"""Rebuild the court from the FIP glass-court drawing, with a usable terraced entrance."""
import bpy,math,random,ast,shutil,numpy as np
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;SOURCE=HERE/'hidden-village.blend'
backup=HERE/'.cache/pre-court-rules.blend'
if not backup.exists():shutil.copy2(SOURCE,backup)
bpy.ops.wm.open_mainfile(filepath=str(SOURCE));random.seed(301);rnd=random.uniform
floor=bpy.data.objects['Blue playing surface'];Y=floor.location.z+.06;X,Z=-72,-52
wood=bpy.data.materials['Weathered oak'];stone=bpy.data.materials['Dressed granite'];roofmat=bpy.data.materials['Smoke-dark shingles'];bark=bpy.data.materials['Fissured pine bark']
for node in ast.parse((HERE/'build_scene.py').read_text()).body:
 if isinstance(node,ast.FunctionDef) and node.name in ['collection','move','xyz','mat','mesh','apply','box','beam','empty','place','smooth']:exec(compile(ast.Module(body=[node],type_ignores=[]),'build_scene.py','exec'))
exec((HERE/'landscape.py').read_text());COL=bpy.data.collections['23 · The blue court']
for o in list(COL.objects):bpy.data.objects.remove(o,do_unlink=True)
fern=next(o for o in bpy.data.objects if o.type=='MESH' and any('fern' in m.name for m in o.data.materials if m))
iron=mat('Court structural iron',(.035,.045,.043,1));iron.node_tree.nodes.get('Principled BSDF').inputs['Metallic'].default_value=.65
meshmat=mat('Court wire mesh',(.07,.09,.08,1));chalk=mat('Court aged white tape',(.68,.70,.63,1));blue=mat('Court blue woven turf',(.05,.18,.34,1));rubber=mat('Court protective padding',(.025,.035,.032,1))
glass=mat('Court tempered glass',(.35,.48,.51,.15));bs=glass.node_tree.nodes.get('Principled BSDF');bs.inputs['Alpha'].default_value=.15;bs.inputs['Roughness'].default_value=.18;bs.inputs['Metallic'].default_value=.2;glass.surface_render_method='DITHERED'
# The ten-by-twenty dimensions are measured inside the enclosure.
floor=box('Blue playing surface',(X,Y-.07,Z),(10,.14,20),blue,.015)
size=1024;rng=np.random.default_rng(301);v,u=np.mgrid[0:size,0:size]/size
edge=np.minimum(np.minimum(u,1-u),np.minimum(v,1-v));noise=rng.normal(0,.028,(size,size));wear=.90+.035*np.sin(u*19+v*11)+.018*np.sin(v*92)+noise
pixels=np.ones((size,size,4),dtype=np.float32)
for k,c in enumerate([.16,.34,.50]):pixels[:,:,k]=np.clip(c*wear,0,1)
moss=np.clip(1-edge/.04,0,1)*(.5+.5*np.sin(u*107+v*31)**2)*.55
for k,c in enumerate([.15,.20,.09]):pixels[:,:,k]=pixels[:,:,k]*(1-moss)+c*moss
for i in range(38):
 xx,yy=rng.uniform(0,1,2);r=rng.uniform(.01,.09);stain=np.exp(-(((u-xx)/r)**2+((v-yy)/(r*.4))**2))*.15
 pixels[:,:,:3]*=(1-stain[:,:,None])
im=bpy.data.images.new('Blue turf fibres and moss',size,size);im.pixels.foreach_set(pixels.ravel());im.pack();tex=blue.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im;blue.node_tree.links.new(tex.outputs['Color'],blue.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
for loop in floor.data.loops:
 co=floor.data.vertices[loop.vertex_index].co;floor.data.uv_layers.active.data[loop.index].uv=(co.x/10+.5,co.y/20+.5)
# Only service lines and their centre divisions, no tennis-style perimeter markings.
for side in [-1,1]:
 box('Court service line',(X,Y+.004,Z+side*6.95),(10,.006,.05),chalk,0)
 box('Court centre service line',(X,Y+.004,Z+side*3.575),(.05,.006,7.15),chalk,0)
for dx,dz,ww,dd in [(0,-10.10,10.4,.2),(0,10.10,10.4,.2),(-5.10,0,.2,20),(5.10,0,.2,20)]:
 bottom=min(gh(X+dx+xx,Z+dz+zz) for xx in [-ww/2,ww/2] for zz in [-dd/2,dd/2])-.2
 box('Court retaining foundation',(X+dx,(bottom+Y)/2,Z+dz),(ww,Y-bottom,dd),stone,.035)
# Wire strips run continuously, keeping a real 50 mm welded grid inexpensive.
def grid(name,a,b,lo,hi,spacing=.05,net=False):
 a,b=Vector(a),Vector(b);direction=(b-a).normalized();length=(b-a).length;verts=[];faces=[];width=.0014 if not net else .0018
 def quad(p,q,offset):
  n=len(verts);verts.extend([p-offset,p+offset,q+offset,q-offset]);faces.append((n,n+1,n+2,n+3))
 for i in range(round(length/spacing)+1):
  t=min(i*spacing,length);p=a+direction*t;top=hi-(.04*math.sin(math.pi*t/length) if net else 0);quad(p+Vector((0,lo,0)),p+Vector((0,top,0)),direction*width)
 for h in np.arange(lo,hi+.001,spacing):
  if net:
   for j in range(20):
    p=a+direction*(length*j/20)+Vector((0,h-.04*(h/hi)*math.sin(math.pi*j/20),0));q=a+direction*(length*(j+1)/20)+Vector((0,h-.04*(h/hi)*math.sin(math.pi*(j+1)/20),0));quad(p,q,Vector((0,width,0)))
  else:quad(a+Vector((0,h,0)),b+Vector((0,h,0)),Vector((0,width,0)))
 return mesh(name,verts,faces,meshmat)
# End walls: 3m glass, 1m mesh. Glass side returns: 4m long, 3m high.
panes=[]
for end in [-1,1]:
 zz=Z+end*10
 for xx in [-4,-2,0,2,4]:panes.append(box('Court end glass',(X+xx,Y+1.5,zz),(1.99,3,.012),glass,0))
 grid('Court end upper mesh',(X-5,Y,zz),(X+5,Y,zz),3,4)
 for xx in [-5,-3,-1,1,3,5]:beam('Court end post',(X+xx,Y-.08,zz),(X+xx,Y+4,zz),.025,iron,12)
 beam('Court end top rail',(X-5,Y+4,zz),(X+5,Y+4,zz),.022,iron,12)
for side in [-1,1]:
 xx=X+side*5
 for end in [-1,1]:
  for zz in [7,9]:panes.append(box('Court side return glass',(xx,Y+1.5,Z+end*zz),(.012,3,1.99),glass,0))
  lo,hi=sorted([Z+end*8,Z+end*10]);grid('Court raised corner mesh',(xx,Y,lo),(xx,Y,hi),3,4)
 for lo,hi in [(-6,-1.125),(1.125,6)]:grid('Court side mesh',(xx,Y,Z+lo),(xx,Y,Z+hi),0,3)
 grid('Court above entries',(xx,Y,Z-1.125),(xx,Y,Z+1.125),2.2,3)
 for zz in [-10,-8,-6,-4,-2,-1.125,0,1.125,2,4,6,8,10]:
  height=4 if abs(zz)>=8 else 3
  beam('Court side upright',(xx,Y-.08,Z+zz),(xx,Y+height,Z+zz),.025,iron,12)
 beam('Court side upper rail',(xx,Y+3,Z-8),(xx,Y+3,Z+8),.022,iron,12)
 # Two approximately 1m-clear, 2.2m-high openings beside the padded net support.
 for zz in [-.075,.075]:beam('Gate centre support',(xx,Y,Z+zz),(xx,Y+2.2,Z+zz),.017,iron,10)
 for zz in [-1.125,1.125]:box('Gate safety padding',(xx,Y+1.1,Z+zz),(.11,2.2,.08),rubber,.025)
 beam('Gate lintel',(xx,Y+2.2,Z-1.125),(xx,Y+2.2,Z+1.125),.022,iron,12)
 # A broad, level outside landing, supported down to the terrain; steps are usable from the path.
 ax=X+side*6.45;bottom=min(gh(ax+a,Z+b) for a in [-1.4,1.4] for b in [-2,2])-.2
 box('Court entrance masonry',(ax,(bottom+Y-.1)/2,Z),(2.8,Y-.1-bottom,4),stone,.04)
 for j in range(10):box('Entrance weathered deck',(ax,Y-.055,Z-1.8+j*.4),(2.8,.11,.38),wood,.014)
 # The top step meets the deck, each lower riser sinks into the slope.
 for j in range(7):
  sx=X+side*(7.95+j*.32);top=Y-j*.16;ground=gh(sx,Z+.60)-.14
  if top>ground:box('Court approach step',(sx,(top+ground)/2,Z+.60),(.35,top-ground,1.4),stone,.025)
 # Rails terminate before the entrance and never cross either gate.
 for zz in [-1.8,1.8]:
  for xx2 in [X+side*5.4,X+side*7.6]:beam('Court landing rail post',(xx2,Y-.1,Z+zz),(xx2,Y+.9,Z+zz),.035,wood,12)
  beam('Court landing handrail',(X+side*5.4,Y+.9,Z+zz),(X+side*7.6,Y+.9,Z+zz),.04,wood,12)
# Join transparent panes to one draw object; no mesh is drawn over rebound glass.
bpy.ops.object.select_all(action='DESELECT')
for o in panes:o.select_set(True)
bpy.context.view_layer.objects.active=panes[0];bpy.ops.object.join();panes[0].name='Court continuous tempered panes'
# Regulation net: 0.92m at posts, 0.88m at centre, 10m long.
for side in [-1,1]:beam('Padded net post',(X+side*5,Y,Z),(X+side*5,Y+.92,Z),.05,rubber,16)
grid('Court net',(X-5,Y+.015,Z),(X+5,Y+.015,Z),0,.905,.045,True)
for i in range(40):
 a=-5+i*.25;b=a+.25
 beam('Court white net tape',(X+a,Y+.92-.04*math.cos(a/5*math.pi/2),Z),(X+b,Y+.92-.04*math.cos(b/5*math.pi/2),Z),.022,chalk,8)
# Court lighting has aged with the woods. Only one small bank remains warm.
for side in [-1,1]:
 for end in [-1,1]:
  xx=X+side*5.5;zz=Z+end*6.5
  beam('Court floodlight mast',(xx,gh(xx,zz)-.15,zz),(xx,Y+6.3,zz),.055,iron,12)
  beam('Court floodlight arm',(xx,Y+6.3,zz),(xx-side*.8,Y+6.15,zz),.04,iron,12)
  box('Court floodlight housing',(xx-side*.8,Y+6.1,zz),(.75,.14,.28),iron,.03)
  light=mat('Court last floodlight '+str(side)+str(end),(.44,.35,.21,1) if side==1 and end==1 else (.09,.12,.13,1),emission=.7 if side==1 and end==1 else 0)
  box('Court floodlight lens',(xx-side*.8,Y+6.025,zz),(.62,.015,.20),light,.015)
# Subtle abandonment around the edges, with a clear entry and playing layout.
for i in range(44):
 xx=X+rnd(-4.8,4.8);zz=Z+rnd(-9.8,9.8)
 if abs(xx-X)<4.2 and abs(zz-Z)<9.1:continue
 o=place(fern,'Court edge fern',xx,zz,rnd(.30,.70),sink=0);o.location.z=Y+.01
for i in range(5):
 xx=X+rnd(-3.5,3.5);zz=Z+rnd(-8.5,8.5)
 a=Vector((xx,Y+.08,zz));b=a+Vector((rnd(.6,1.6),.02,rnd(-.4,.6)));beam('Court fallen hazel',a,b,.027,bark,9);beam('Court fine fork',(a+b)*.5,(a+b)*.5+Vector((-.25,.015,.4)),.012,bark,6)
# Remove any old growth blocking the outside entrance/apron.
for o in list(bpy.data.objects):
 if o.type!='MESH' or o in COL.objects[:]:continue
 if not any(any(k in m.name.lower() for k in ['foliage','bark','fern','rock_moss','pine_roots','tree_stump']) for m in o.data.materials if m):continue
 c=sum((o.matrix_world@Vector(v) for v in o.bound_box),Vector())/8
 if -67<c.x<-60 and -55<-c.y<-39:bpy.data.objects.remove(o,do_unlink=True)
anchor=empty('Beyond the music room',(-65.6,Y+1.1,-50.8),inspect='court');anchor['eye']=[-68.3,Y+1.65,-51.4];anchor['target']=[-74,Y+1,-56]
anchor['via']=[-62,Y+1.65,-40,-62,Y+1.65,-51.4,-65.4,Y+1.65,-51.4]
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE));print('COURT_RULES_SAVED',Y)
