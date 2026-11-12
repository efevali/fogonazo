"""Biblioteca: recorta las piezas pintadas (P-012 a P-015) y prepara los fondos (P-010, P-011 y P-016) para la app.

   python3 herramientas/biblioteca/recortar.py

Lee las entregas aprobadas de docs/biblioteca/arte/ y escribe biblioteca/arte/ en WebP:
- los objetos y las llaves, cada uno en un recuadro de 240 × 320 (el de 60 × 80 del dibujo con código, a 4×), del mismo
  tamaño y apoyado en el mismo lugar que su dibujo (recuadros.json, medido sobre los dibujos de objetos.js);
- los libros de la dificultad, la puerta (solo el marco: el vidrio lo pone el código) y la reja;
- los tres fondos, tal cual.
El magenta se vuelve transparente; los huecos que quedan adentro de los casetes (los carretes, la ventanita) se pintan
del tono de la cinta, y los de las llaves y la reja quedan transparentes. Necesita numpy, scipy y Pillow."""
import numpy as np, json, os
from PIL import Image
from scipy import ndimage
RAIZ=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..')
ARTE=os.path.join(RAIZ,'docs','biblioteca','arte')
OUT=os.path.join(RAIZ,'biblioteca','arte'); os.makedirs(OUT+'/objetos',exist_ok=True)
bb=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'recuadros.json')))
CINTA=np.array([38,30,26.])
def cortar(f,cols,rows,nombres,huecos_cinta=()):
    im=np.asarray(Image.open(f).convert('RGB')).astype(float); H,W,_=im.shape
    r,g,b=im[...,0],im[...,1],im[...,2]
    d=np.sqrt((r-255)**2+g**2+(b-255)**2)
    A=np.clip((d-110)/60,0,1)
    mag=d<90
    lab,n=ndimage.label(mag)
    borde=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    hueco=mag & ~np.isin(lab,list(borde))
    # piezas: componentes de lo que no es fondo (con los huecos incluidos), asignadas a la celda de su centro
    solido=ndimage.binary_fill_holes(A>0.5)
    plab,pn=ndimage.label(ndimage.binary_dilation(solido,iterations=6))
    cw,ch=W/cols,H/rows; piezas={}
    cent=ndimage.center_of_mass(solido,plab,range(1,pn+1)); size=ndimage.sum(solido,plab,range(1,pn+1))
    celda={}
    for i,(cy,cx) in enumerate(cent):
        if size[i]<3000: continue
        celda.setdefault(int(cy//ch)*cols+int(cx//cw),[]).append(i+1)
    edge=ndimage.binary_dilation(A<0.5,iterations=5)
    for idx,nom in enumerate(nombres):
        if nom is None or idx not in celda: continue
        m=np.isin(plab,celda[idx])
        C=im.copy(); Am=A*m
        if nom in huecos_cinta:
            hh=hueco&m; ring=ndimage.binary_dilation(hh,iterations=3)&m
            t=(1-Am[ring])[:,None]; C[ring]=C[ring]*(1-t)+CINTA*t; Am[ring]=1; C[hh]=CINTA; Am[hh]=1
        sp=np.clip(np.minimum(C[...,0],C[...,2])-C[...,1],0,None)*edge
        C[...,0]-=sp; C[...,2]-=sp
        ys,xs=np.where(Am>0.02)
        rgba=np.dstack([np.clip(C,0,255),Am*255]).astype(np.uint8)[ys.min():ys.max()+1,xs.min():xs.max()+1]
        piezas[nom]=Image.fromarray(rgba,'RGBA')
    return piezas
def encajar(p,box,size=(240,320)):
    x0,y0,x1,y1=box; bw,bh=x1-x0,y1-y0
    s=min(bw/p.width,bh/p.height); q=p.resize((max(1,round(p.width*s)),max(1,round(p.height*s))),Image.LANCZOS)
    cv=Image.new('RGBA',size,(0,0,0,0)); cv.alpha_composite(q,(round((x0+x1)/2-q.width/2),y1-q.height)); return cv
todo={}
todo.update(cortar(ARTE+'/P-012_libros.jpg',5,2,['tomo','tomoAzul','libros','librosAlt','pila','enciclopedia','enciclopediaVerde','dif-facil','dif-normal','dif-dificil']))
todo.update(cortar(ARTE+'/P-013_adornos.jpg',5,2,['eiffel','avion','globo','despertador','mamushka','cactus','auto','camara','radio',None]))
cas=['casete','caseteBlanco','caseteAhumado','caseteTransparente','caseteA','caseteB']
todo.update(cortar(ARTE+'/P-014_casetes-llaves.jpg',4,2,cas+['llave','llaveReja'],huecos_cinta=cas))
todo.update(cortar(ARTE+'/P-015_puertas.jpg',2,1,['puerta','reja']))
for k,p in todo.items():
    if k in bb: encajar(p,bb[k]).save(f'{OUT}/objetos/{k}.webp',quality=90,method=6)
    elif k in ('caseteA','caseteB'): encajar(p,bb['casete']).save(f'{OUT}/objetos/{k}.webp',quality=90,method=6)
    else:
        tgt={'puerta':(576,456),'reja':(576,456)}.get(k)
        q=p.resize(tgt,Image.LANCZOS) if tgt else p.resize((round(p.width*0.6),round(p.height*0.6)),Image.LANCZOS)
        q.save(f'{OUT}/{k}.webp',quality=90,method=6)
for src,dst in [('P-010_fondo-partida.jpg','fondo-partida'),('P-011_fondo-facil.jpg','fondo-partida-facil'),('P-016_fondo-entrada.jpg','fondo-entrada')]:
    Image.open(os.path.join(ARTE,src)).convert('RGB').save(f'{OUT}/{dst}.webp',quality=86)
print('listo:',len(todo),'piezas y 3 fondos en biblioteca/arte/')
