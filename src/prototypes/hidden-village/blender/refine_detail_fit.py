"""Final dimensional fit: flat regulation net tape and a ground-following court approach."""
import bpy,ast,math
from mathutils import Vector
from pathlib import Path
HERE=Path(__file__).resolve().parent;SOURCE=HERE/'hidden-village.blend';bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
COL=bpy.data.collections['23 · The blue court']
stone=bpy.data.materials['Dressed granite']
for node in ast.parse((HERE/'build_scene.py').read_text()).body:
 if isinstance(node,ast.FunctionDef) and node.name in ['xyz','mesh','smooth']:exec(compile(ast.Module(body=[node],type_ignores=[]),'build_scene.py','exec'))
exec((HERE/'landscape.py').read_text());Y=bpy.data.objects['Blue playing surface'].location.z+.07
for o in list(bpy.data.objects):
 if o.name.startswith('Court white net tape'):bpy.data.objects.remove(o,do_unlink=True)
verts=[];faces=[]
for i in range(41):
 x=-77+i*.25;h=Y+.92-.04*math.sin(math.pi*i/40);verts.extend([(x,h,-52),(x,h-.055,-52)])
for i in range(40):faces.append((2*i,2*i+1,2*i+3,2*i+2))
mesh('Court white net tape',verts,faces,bpy.data.materials['Court aged white tape'])
o=bpy.data.objects['Beyond the music room']
via=[]
for z in [-40,-42,-44,-46,-48,-50,-51.4]:via.extend([-62,gh(-62,z)+1.65,z])
for j in range(6,-1,-1):
 x=-72+7.95+j*.32;via.extend([x,max(gh(x,-51.4),Y-j*.16)+1.65,-51.4])
via.extend([-65.5,Y+1.65,-51.4]);o['via']=via
card=bpy.data.objects.get('Far spruce 313')
if card:bpy.data.objects.remove(card,do_unlink=True)
for twig in bpy.data.objects:
 if twig.name.startswith(('Court fallen hazel','Court fine fork')):
  low=min((twig.matrix_world@Vector(p)).z for p in twig.bound_box)
  twig.location.z+=Y+.001-low
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE));print('ENTRY_AND_NET_FITTED',Y,list(o['via']))
