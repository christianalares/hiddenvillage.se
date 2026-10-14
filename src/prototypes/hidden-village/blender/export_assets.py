"""Export the saved .blend, preserving manual edits, then compress the web delivery."""
import os, shutil, subprocess, tempfile
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
BLENDER=os.environ.get('BLENDER_BIN') or shutil.which('blender') or '/Applications/Blender.app/Contents/MacOS/Blender'
worker='''import bpy,sys
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
 if o.type=='MESH' or (o.type=='EMPTY' and o.get('lamp')):o.select_set(True)
bpy.ops.export_scene.gltf(filepath=sys.argv[-1],export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_yup=True,export_normals=True,export_texcoords=True,export_materials='EXPORT',export_cameras=False,export_lights=False)
'''
with tempfile.TemporaryDirectory(prefix='hidden-village-') as temp:
 script=Path(temp)/'export.py';script.write_text(worker);raw=Path(temp)/'woodland.glb'
 subprocess.run([BLENDER,'--background',str(HERE/'hidden-village.blend'),'--python-exit-code','1','--python',str(script),'--',str(raw)],check=True)
 subprocess.run(['npx','--yes','@gltf-transform/cli@4.5.1','optimize',str(raw),str(ROOT/'public/prototype/hidden-village/assets/woodland.glb'),
  '--compress','meshopt','--simplify','false','--flatten','false','--join','false','--instance','false','--palette','false','--texture-compress','webp','--texture-size','1024','--prune','false'],check=True)
