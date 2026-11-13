"""Prepara un video de la gata de la sala (S-44) para la app.

   python3 herramientas/sala/gata.py entrada.mp4 salida.webm

La entrada es un video de Gemini de la gata sobre magenta (P-018 a P-020 y los que sigan), de 1280 x 720, que empieza y
termina en la misma pose. El video no se corta ni se cambia de tiempo: a cada cuadro se le quita el magenta, se lo
entona a la luz de la sala (menos saturado, más cálido y tenue, más oscuro hacia el apoyo) y se le hornea su propia
sombra de contacto, para que la sombra acompañe a la cola cuando se mueve. Sale un VP9 con transparencia de 538 x 342
(el recorte en 458 de ancho, más 40 de margen para la sombra), que Chrome reproduce en la sala.

Todos los videos usan el mismo recorte (CAJA): la gata está en el mismo lugar en todos, así que se encadenan sin saltos.
Es el lugar que ocupa ovillada (108, 72, 1175, 663, medido sobre el primer cuadro del P-018) agrandado para que entre el
estiramiento del P-020, que llega con las patas casi al borde izquierdo y con las orejas al de arriba. Si se cambia,
hay que rehacer todos los videos y mover la gata en sala/index.html para que quede en el mismo lugar. Si un video nuevo
la trae corrida, o se sale del recorte, hay que pedírselo de nuevo a la IA.

Necesita ffmpeg con libvpx-vp9, numpy y Pillow. """
import glob
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageFilter

CAJA = (16, 0, 1180, 663)     # x0, y0, x1, y1 en el video de 1280 x 720
ANCHO = 458                   # el recorte, en la app (la gata ovillada, en 420)
MARGEN = 40                   # alrededor, para la sombra
SOMBRA = np.array([38, 16, 8], np.float32) / 255


def magenta(c):
    """El color del fondo: la mediana de las cuatro esquinas (Gemini no lo da siempre igual)."""
    esq = np.concatenate([c[:20, :20].reshape(-1, 3), c[:20, -20:].reshape(-1, 3), c[-20:, :20].reshape(-1, 3), c[-20:, -20:].reshape(-1, 3)])
    return np.median(esq, axis=0).astype(np.float32)


def recortar(c, M):
    """Quita el magenta: devuelve el color entonado y la transparencia, en la resolución del video."""
    R, G, B = c[..., 0], c[..., 1], c[..., 2]
    m = np.minimum(R, B) - G
    a = 1 - np.clip((m - 40) / 110, 0, 1)
    aa = np.maximum(a, 0.05)[..., None]
    rgb = np.clip((c - (1 - aa) * M) / aa, 0, 255)
    # en el borde, que no quede rosado: el azul no supera al verde (ni a una parte del rojo)
    borde = np.asarray(Image.fromarray(((a < 0.999) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
    rgb[..., 2] = np.where(borde, np.minimum(rgb[..., 2], np.maximum(rgb[..., 1] * 1.05, rgb[..., 0] * 0.55)), rgb[..., 2])
    a = np.clip((a - 0.15) / 0.85, 0, 1)
    A = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(0.8))
    a = np.asarray(A).astype(np.float32) / 255
    # la luz de la sala: menos saturada, cálida y tenue, y más oscura hacia abajo
    g = rgb.mean(-1, keepdims=True)
    rgb = g + (rgb - g) * 0.74
    rgb = rgb * np.array([0.90, 0.80, 0.68], np.float32)
    yy = np.linspace(0, 1, rgb.shape[0])[:, None, None]
    rgb = np.clip(rgb * (1.04 - 0.22 * yy ** 1.5), 0, 255)
    return rgb, a


def achicar(rgb, a):
    """Recorta la CAJA y la lleva a ANCHO, mezclando con la transparencia para que el borde no se ensucie."""
    x0, y0, x1, y1 = CAJA
    alto = round(ANCHO * (y1 - y0) / (x1 - x0)); alto += alto % 2
    im = np.dstack([rgb * a[..., None], a * 255])[y0:y1, x0:x1]
    capas = [np.asarray(Image.fromarray(im[..., k].astype(np.float32)).resize((ANCHO, alto), Image.LANCZOS)) for k in range(4)]
    arr = np.dstack(capas)
    al = np.clip(arr[..., 3], 0, 255)
    col = np.clip(arr[..., :3] / np.maximum(al[..., None] / 255, 1e-3), 0, 255)
    return col / 255, al / 255


def con_sombra(col, al):
    """Suma la sombra de contacto (una amplia y suave, y otra corta justo en el apoyo) debajo de la gata."""
    H, W = al.shape
    P = MARGEN
    base = Image.new('L', (W + 2 * P, H + 2 * P), 0)
    base.paste(Image.fromarray((al * 255).astype(np.uint8)), (P, P + 4))
    amplia = np.asarray(base.filter(ImageFilter.GaussianBlur(11))).astype(np.float32) / 255 * 0.82
    corta = np.asarray(base.filter(ImageFilter.GaussianBlur(4))).astype(np.float32) / 255 * 0.5
    sa = np.clip(amplia + corta * (1 - amplia), 0, 1)[..., None]
    c = np.zeros((H + 2 * P, W + 2 * P, 3), np.float32); c[P:P + H, P:P + W] = col
    ca = np.zeros((H + 2 * P, W + 2 * P, 1), np.float32); ca[P:P + H, P:P + W, 0] = al
    outa = ca + sa * (1 - ca)
    outc = (c * ca + SOMBRA * sa * (1 - ca)) / np.maximum(outa, 1e-4)
    return Image.fromarray((np.dstack([outc, outa]) * 255).round().astype(np.uint8), 'RGBA')


def main(entrada, salida):
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', entrada, os.path.join(tmp, 'c%03d.png')], check=True)
        cuadros = sorted(glob.glob(os.path.join(tmp, 'c*.png')))
        M = magenta(np.asarray(Image.open(cuadros[0]).convert('RGB')).astype(np.float32))
        for i, f in enumerate(cuadros):
            c = np.asarray(Image.open(f).convert('RGB')).astype(np.float32)
            con_sombra(*achicar(*recortar(c, M))).save(os.path.join(tmp, f'g{i + 1:03d}.png'))
            os.remove(f)
        fps = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate',
                              '-of', 'default=nw=1:nk=1', entrada], capture_output=True, text=True, check=True).stdout.strip()
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', fps, '-i', os.path.join(tmp, 'g%03d.png'),
                        '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '30', '-row-mt', '1',
                        '-auto-alt-ref', '0', '-an', salida], check=True)
    print(f'{salida}: {len(cuadros)} cuadros, {os.path.getsize(salida) // 1024} KB')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
