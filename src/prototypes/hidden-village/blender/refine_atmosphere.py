"""Art direction: an unmistakable watcher, layered foliage and worn, grounded details."""
import bpy,math,random,ast
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;SOURCE=HERE/'hidden-village.blend';bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
wood=bpy.data.materials['Weathered oak'];roofmat=bpy.data.materials['Smoke-dark shingles'];stone=bpy.data.materials['Dressed granite']
for node in ast.parse((HERE/'build_scene.py').read_text()).body:
 if isinstance(node,ast.FunctionDef) and node.name in ['collection','move','xyz','mat','mesh','apply','box','beam','empty','place','smooth']:exec(compile(ast.Module(body=[node],type_ignores=[]),'build_scene.py','exec'))
exec((HERE/'landscape.py').read_text());collection('26 · The watcher')
old=bpy.data.objects.get('Someone at the window');bounds=[old.matrix_world@Vector(v) for v in old.bound_box];c=sum(bounds,Vector())/8;bpy.data.objects.remove(old,do_unlink=True)
# Face close to the pane, held still. A small cold highlight separates skin from warm room light.
coat=mat('Watcher black wool',(.012,.018,.019,1));skin=mat('Watcher pale face',(.34,.36,.32,1),emission=.16);shadow=mat('Watcher shadow features',(.018,.021,.020,1));eye=mat('Watcher reflected eyes',(.36,.42,.4,1),emission=.18)
x,y,z=c.x,c.z,-c.y
# Broad shoulders touch the window edges; this reads from the square, not only at close range.
profile=[(-.36,-.48),(-.34,-.08),(-.24,.09),(-.12,.15),(-.11,.23),(.11,.23),(.12,.15),(.24,.09),(.34,-.08),(.36,-.48)]
mesh('Watcher shoulders',[(x+a,y+b,z+.025) for a,b in profile],[tuple(reversed(range(len(profile))))],coat)
def oval(name,pos,scale,material):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=xyz(pos));o=bpy.context.object;o.name=name;o.scale=(scale[0],scale[2],scale[1]);move(o);o.data.materials.append(material)
 for f in o.data.polygons:f.use_smooth=True
 return o
oval('A face at the glass',(x,y+.34,z+.035),(.115,.17,.052),skin)
oval('Watchers hair',(x,y+.435,z+.018),(.117,.078,.055),coat)
for side in [-1,1]:
 oval('Watcher eye socket',(x+side*.045,y+.365,z+.082),(.024,.013,.007),shadow)
 oval('Watcher eye reflection',(x+side*.045,y+.367,z+.09),(.006,.004,.003),eye)
beam('Watcher mouth',(x-.029,y+.282,z+.083),(x+.029,y+.28,z+.083),.004,shadow,6)
# Avoid an artificial cut-paper surface on the thicket: leaves vary in pitch and warm/cool tone.
random.seed(112)
for o in bpy.data.objects:
 if o.type!='MESH' or not o.name.startswith('Hazel leaf clusters'):continue
 for poly in o.data.polygons:
  verts=[o.data.vertices[i] for i in poly.vertices];centre=sum((v.co for v in verts),Vector())/len(verts)
  pitch=random.uniform(-.7,.7);roll=random.uniform(-.5,.5)
  from mathutils import Matrix
  rotation=Matrix.Rotation(pitch,3,'X')@Matrix.Rotation(roll,3,'Y')
  for v in verts:v.co=centre+rotation@(v.co-centre)*.78
# Hand-placed bark-covered fallen timber stays beside the walking corridor.
collection('27 · Woodland traces');bark=bpy.data.materials['Fissured pine bark'];cut=mat('Old broken end grain',(.24,.21,.15,1));iron=bpy.data.materials['Forged black iron']
for zz,side,length in [(183,-1,3.5),(104,1,4.2),(76,-1,2.2),(49,1,2.8)]:
 xx=tx(zz)+side*3.6;start=Vector((xx,gh(xx,zz)+.19,zz));end=Vector((xx+side*.6,gh(xx+side*.6,zz+length)+.19,zz+length))
 beam('Fallen pine beside trail',start,end,.20,bark,14)
 axis=(end-start).normalized();beam('Exposed broken timber',end-axis*.015,end+axis*.018,.18,cut,14)
 for k in range(3):
  p=start.lerp(end,.2+k*.23);beam('Snapped branch on fallen log',p,p+Vector((side*.35,.25,.15)),.045,bark,8)
# A slightly sagging abandoned timber gate by the thicket, never across the path.
zz=90;xx=tx(zz)-4.0
for dz in [-1.1,1.1]:beam('Old gatepost',(xx,gh(xx,zz+dz)-.1,zz+dz),(xx,gh(xx,zz+dz)+1.4,zz+dz),.085,wood,12)
for yy in [.45,1.05]:beam('Sagging old gate',(xx,gh(xx,zz-1)+yy,zz-1),(xx+.12,gh(xx,zz+1)+yy-.12,zz+1),.045,wood,10)
beam('Gate diagonal',(xx,gh(xx,zz-1)+.45,zz-1),(xx+.12,gh(xx,zz+1)+.93,zz+1),.04,wood,10)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE));print('ATMOSPHERE_REFINED')
