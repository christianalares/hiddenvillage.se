"""Replace the conspicuous flat moor blades with shared scanned undergrowth."""
import bpy
from pathlib import Path
HERE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(HERE/'hidden-village.blend'))
fern=next(o for o in bpy.data.objects if o.type=='MESH' and any('fern' in m.name.lower() for m in o.data.materials if m))
count=0
for o in bpy.data.objects:
 if not o.name.startswith('Heather tussock'):continue
 o.data=fern.data;o.scale*=.55;o.name='Fern moor undergrowth';count+=1
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'hidden-village.blend'))
print('MOOR_UNDERGROWTH_REPLACED',count)
