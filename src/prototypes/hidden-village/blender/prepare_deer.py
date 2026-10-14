"""Prepare Quaternius' CC0 deer as a small grounded, idle-only animated web asset."""
import bpy,sys,argparse
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
p=argparse.ArgumentParser();p.add_argument('--cache',default=str(HERE/'.cache'));args=p.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
cache=Path(args.cache)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(cache/'deer-original.glb'))
for o in list(bpy.context.scene.objects):
 if o.type=='MESH' and o.name!='Deer':bpy.data.objects.remove(o,do_unlink=True)
arm=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
for track in list(arm.animation_data.nla_tracks):
 if track.name not in ['Idle','Idle_2','Eating']:arm.animation_data.nla_tracks.remove(track)
arm.animation_data.action=None
for action in list(bpy.data.actions):
 if action.name not in ['Idle','Idle_2','Eating']:bpy.data.actions.remove(action)
for t in arm.animation_data.nla_tracks:t.mute=t.name!='Idle'
root=arm
while root.parent:root=root.parent
root.scale*=.34
bpy.context.scene.frame_set(0);bpy.context.view_layer.update()
deer=bpy.data.objects['Deer'];bounds=[deer.matrix_world@Vector(v) for v in deer.bound_box];root.location.z-=min(v.z for v in bounds)
for m in bpy.data.materials:
 if m.use_nodes:
  bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Metallic'].default_value=0;bs.inputs['Roughness'].default_value=.97
for f in deer.data.polygons:f.use_smooth=True
bpy.context.scene.render.fps=24
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'deer.blend'),compress=True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/prototype/hidden-village/assets/deer.glb'),export_format='GLB',export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_frame_step=2)
print('DEER_READY')
