"""Resolve measured route contacts in the saved discovery pass."""
import bpy,math
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(HERE/'hidden-village.blend'))
def smooth(t):t=max(0,min(1,t));return t*t*(3-2*t)
exec((HERE/'landscape.py').read_text())
for name,dx,dz in [('Cottage · -21, -12',-8,2),('Cottage · -6, -51',-9,-6)]:
 o=bpy.data.objects[name];x,z=o.location.x,-o.location.y
 o.location.x+=dx;o.location.y-=dz;o.location.z+=gh(x+dx,z+dz)-gh(x,z)
 # Extend masonry below the new ground at every corner, keeping wooden walls seated.
 for child in o.children:
  if 'foundation' in child.name.lower() or 'footing' in child.name.lower():
   child.scale.z*=1.35
for name,dx,dz in [('Moor granite.005',-11,0),('Moss boulder 158',4,0),('Opening anchor 0',0,2.5)]:
 o=bpy.data.objects[name];center=sum((o.matrix_world@Vector(c) for c in o.bound_box),Vector())/8
 x,z=center.x,-center.y;o.location.x+=dx;o.location.y-=dz;o.location.z+=gh(x+dx,z+dz)-gh(x,z)-.12
# Keep the darkest plank visible in its own lantern light.
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'hidden-village.blend'))
