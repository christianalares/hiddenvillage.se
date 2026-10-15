"""Move a path light out of the ridge notebook sightline and rebake lamp pools."""
import bpy,math
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(HERE/'hidden-village.blend'))
def smooth(t):t=max(0,min(1,t));return t*t*(3-2*t)
exec((HERE/'landscape.py').read_text())
for o in list(bpy.data.objects):
 if not o.name.startswith(('Trail lantern','Trail amber','Trail light')):continue
 c=sum((o.matrix_world@Vector(v) for v in o.bound_box),Vector())/8 if o.type=='MESH' else o.location
 if abs(c.x+92.1)<.8 and abs(-c.y-123.899)<.6:
  o.location.x+=7;o.location.z+=gh(-85.325,123.899)-gh(-92.325,123.899)
bpy.context.view_layer.update()
lamps=[o.matrix_world.translation for o in bpy.data.objects if o.get('lamp')]
for o in bpy.data.objects:
 if not o.name.startswith('Landform') or o.type!='MESH':continue
 attr=o.data.color_attributes['GroundBlend']
 for v in o.data.vertices:
  c=attr.data[v.index].color;c[2]=max((math.exp(-((v.co.x-l.x)**2+(v.co.y-l.y)**2)/3.2) for l in lamps),default=0);attr.data[v.index].color=c
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'hidden-village.blend'))
