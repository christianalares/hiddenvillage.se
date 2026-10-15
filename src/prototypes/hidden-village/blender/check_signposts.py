"""Load the runtime fingerposts into the woodland for the existing clearance sweep.
Run against hidden-village.blend with the same probe/report arguments as check_routes.py.
The saved source is never modified.
"""
import bpy, math, runpy
from pathlib import Path
from mathutils import Matrix

HERE=Path(__file__).resolve().parent
def smooth(t):
 t=max(0,min(1,t));return t*t*(3-2*t)
exec(compile((HERE/'landscape.py').read_text(),str(HERE/'landscape.py'),'exec'))
with bpy.data.libraries.load(str(HERE/'signpost.blend')) as (source,destination):
 destination.objects=source.objects
for start in [156,-4]:
 z=start-6;x=tx(z)+2.8
 # gh includes authored micro-relief; runtime placement uses the smooth surface.
 y=gh(x,z)-math.sin(x*2.6+z*.71)*math.sin(z*3.1-x*.4)*.035
 angle=math.atan2(tx(start+1)-x,7)
 transform=Matrix.Translation((x,-z,y)) @ Matrix.Rotation(-angle,4,'Z')
 for original in destination.objects:
  if original.type!='MESH':continue
  obj=original.copy();bpy.context.scene.collection.objects.link(obj)
  obj.matrix_world=transform @ original.matrix_world
bpy.context.view_layer.update()
runpy.run_path(str(HERE/'check_routes.py'),run_name='__main__')
