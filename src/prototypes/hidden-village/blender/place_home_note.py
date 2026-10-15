"""Keep the final postcard ahead of the visitor at the end of the path."""
import bpy,math
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(HERE/'hidden-village.blend'))
def smooth(t):t=max(0,min(1,t));return t*t*(3-2*t)
exec((HERE/'landscape.py').read_text())
x=tx(-61)+2.7;dx=-5.7;dz=-5.5;dy=gh(x+dx,-61+dz)-gh(x,-61)
for o in bpy.data.collections['17 · Christian’s discoveries'].objects:
 c=sum((o.matrix_world@Vector(v) for v in o.bound_box),Vector())/8 if o.type=='MESH' else o.matrix_world.translation
 if abs(c.x-x)<1.6 and abs(-c.y+61)<1:
  o.location.x+=dx;o.location.y-=dz;o.location.z+=dy
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'hidden-village.blend'))
