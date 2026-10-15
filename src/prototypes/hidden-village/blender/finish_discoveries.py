"""Small composition refinements after reviewing the real browser camera."""
import bpy,math,ast,random
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(HERE/'hidden-village.blend'))
wood=bpy.data.materials['Weathered oak'];iron=bpy.data.materials['Forged black iron'];stone=bpy.data.materials['Dressed granite'];roofmat=bpy.data.materials['Smoke-dark shingles']
random.seed(998);rnd=random.uniform
for node in ast.parse((HERE/'build_scene.py').read_text()).body:
 if isinstance(node,ast.FunctionDef) and node.name in ['xyz','smooth','move','mesh','apply','box','beam','empty','place']:
  exec(compile(ast.Module(body=[node],type_ignores=[]),'build_scene.py','exec'))
exec((HERE/'landscape.py').read_text())
COL=bpy.data.collections['17 · Christian’s discoveries']
# Move the ridge lantern behind the notebook. Its pole was blocking the actual camera.
for o in list(bpy.data.objects):
 if not o.name.startswith(('Trail lantern','Trail amber','Trail light')):continue
 if o.type=='MESH':c=sum((o.matrix_world@Vector(v) for v in o.bound_box),Vector())/8
 else:c=o.location
 x,z=c.x,-c.y
 if abs(x+96)<.8 and abs(z-124.8)<.6:
  o.location.y+=4.5;o.location.z+=gh(-96.2,120.3)-gh(-96.2,124.8)
# A few grounded boulders and ferns soften the open shelter's perimeter.
rock=next(o for o in bpy.data.objects if o.type=='MESH' and any('rock_moss' in m.name for m in o.data.materials if m))
fern=next(o for o in bpy.data.objects if o.type=='MESH' and any('fern' in m.name for m in o.data.materials if m))
for i,(x,z,s) in enumerate([(-94,130,.7),(-100,130,.6),(-104,118,.7),(-95,116,.6),(-82,-23,.5),(-86,-38,.6)]):
 o=place(rock,'Shelter moss stone '+str(i),x,z,s,sink=.22)
 for k in range(4):place(fern,'Shelter fern',x+math.cos(k)*1.3,z+math.sin(k)*1.3,rnd(.8,1.3),sink=.035)
# Steps make the music shelter a usable place rather than a platform on poles.
floor=next(o for o in bpy.data.objects if o.name.startswith('Music cabin floor'))
y=floor.location.z;x=-80.65;z=-29.9
for k in range(5):
 xx=x+.28+k*.32;top=y-(k+1)*.18;bottom=gh(xx,z)-.07
 if top>bottom:
  box('Music cabin stair tread',(xx,top,z),(.37,.09,1.7),wood,.02)
  for dz in [-.7,.7]:box('Stair support',(xx,(top+bottom)/2,z+dz),(.13,top-bottom,.13),wood,.012)
# A paper sketch hanging in the workshop has a visible title and diagram at runtime.
bpy.data.objects['Pinned workshop sketch']['storyPoster']='I wish this existed.'
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'hidden-village.blend'))
