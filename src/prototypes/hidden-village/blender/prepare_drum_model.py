"""Split the credited source kit into loose parts before import_drums.py. Works only in the research cache."""
import bpy,bmesh,json
from pathlib import Path
from mathutils import Vector
p=Path(__file__).resolve().parent/'.cache/research';bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(p/'serg-drums.glb'));bpy.context.view_layer.update()
for o in list(bpy.data.objects):
 if o.type!='MESH':continue
 o.data.transform(o.matrix_world);o.parent=None;o.matrix_world.identity()
 bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.05);bm.to_mesh(o.data);bm.free()
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.data.objects:
 if o.type=='MESH':o.select_set(True);bpy.context.view_layer.objects.active=o
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.separate(type='LOOSE');bpy.ops.object.mode_set(mode='OBJECT')
rows=[]
for o in bpy.data.objects:
 if o.type!='MESH':continue
 v=[o.matrix_world@Vector(x) for x in o.bound_box];lo=[min(a[i] for a in v)/1000 for i in range(3)];hi=[max(a[i] for a in v)/1000 for i in range(3)]
 rows.append({'name':o.name,'verts':len(o.data.vertices),'lo':lo,'hi':hi,'center':[(a+b)/2 for a,b in zip(lo,hi)],'material':o.data.materials[0].name})
(p/'serg-parts.json').write_text(json.dumps(rows,indent=2));bpy.ops.wm.save_as_mainfile(filepath=str(p/'serg-parts.blend'))
