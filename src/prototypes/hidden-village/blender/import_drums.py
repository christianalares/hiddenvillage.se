"""Adapt Serg.Morgun's CC BY4.0 acoustic kit to one rack tom and separate playable parts."""
import bpy,math,ast,json
from pathlib import Path
from mathutils import Vector,Matrix
HERE=Path(__file__).resolve().parent;SOURCE=HERE/'hidden-village.blend';bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
wood=bpy.data.materials['Weathered oak'];roofmat=bpy.data.materials['Smoke-dark shingles']
for node in ast.parse((HERE/'build_scene.py').read_text()).body:
 if isinstance(node,ast.FunctionDef) and node.name in ['collection','move','xyz','mat','mesh','apply','box','beam','empty']:exec(compile(ast.Module(body=[node],type_ignores=[]),'build_scene.py','exec'))
# Replace the old procedural instrument, keep the cabin, records, amp and letter.
for o in list(bpy.data.objects):
 if o.name.startswith(('Drum lacquer','Drum chrome','Drum skin','Tension rod','Cymbal stand','Cymbal tripod','Brass cymbal','Cymbal bell','Drum stool','Stool leg','Drum stick')):bpy.data.objects.remove(o,do_unlink=True)
collection('25 · Acoustic instruments')
with bpy.data.libraries.load(str(HERE/'.cache/research/serg-parts.blend'),link=False) as (src,dst):dst.objects=[n for n in src.objects]
parts=[o for o in dst.objects if o and o.type=='MESH']
floor=bpy.data.objects['Music cabin floor'];Y=floor.matrix_world.translation.z+.06
centres={'kick':(-1.439,-.202,-.064),'snare':(-1.836,.706,.221),'rack-tom':(-1.682,-.067,.657),'floor-tom':(-.955,.549,.006),'hihat':(-2.311,.438,.64),'crash':(-2.137,-.262,1.162),'ride':(-.626,-.051,.975)}
origin=Vector((-1.45,.25,-.513));rotation=Matrix.Rotation(math.pi/2,4,'Z');scale=.82
base=Vector((-84,31,Y));groups={}
for name,c in centres.items():
 group=empty('Acoustic '+name,(-84,Y,-31),motion='drum',drumPart=name)
 strike=base+rotation@(Vector(c)-origin)*scale
 if name in ['rack-tom','floor-tom','snare']:strike.z+=.16*scale
 group['strike']=[strike.x,strike.z,-strike.y];groups[name]=group
removed=0;objects_by_part={name:[] for name in centres}
for o in parts:
 COL.objects.link(o);o.parent=None;o.matrix_world.identity()
 bounds=[Vector(p)/1000 for p in o.bound_box];c=sum(bounds,Vector())/8
 # Discard the right rack tom, including its own rims, heads and lugs.
 if math.hypot(c.x+1.155,c.y+.037)<.29 and .36<c.z<.80:
  bpy.data.objects.remove(o,do_unlink=True);removed+=1;continue
 name=min(centres,key=lambda k:(c-Vector(centres[k])).length)
 for v in o.data.vertices:v.co=base+rotation@(v.co/1000-origin)*scale
 o.data.update();o['drumPart']=name
 objects_by_part[name].append(o)
 for m in o.data.materials:
  if not m.name.startswith('Drum artist '):m.name='Drum artist '+m.name
  bs=m.node_tree.nodes.get('Principled BSDF')
  if bs:
   if 'blinn2' in m.name or 'phongE1' in m.name:bs.inputs['Metallic'].default_value=.75;bs.inputs['Roughness'].default_value=.28
# Combine by material within each instrument. The moving parent preserves hit identity in the export.
for name,items in objects_by_part.items():
 batches={}
 for o in items:batches.setdefault(o.data.materials[0].name,[]).append(o)
 for material,group_items in batches.items():
  bpy.ops.object.select_all(action='DESELECT')
  for o in group_items:o.select_set(True)
  bpy.context.view_layer.objects.active=group_items[0]
  if len(group_items)>1:bpy.ops.object.join()
  o=group_items[0];o.name='Playable '+name+' '+material;o.parent=groups[name];o.matrix_parent_inverse=groups[name].matrix_world.inverted()
# A worn rug grounds every stand and pedal in the old room.
rug=mat('Faded indigo drum rug',(.055,.065,.061,1));box('Drum room woven rug',(-84,Y+.005,-31),(3.1,.012,2.8),rug,.015)
look=bpy.data.objects['Sit beside the drums'];look['eye']=[-80.4,Y+2.05,-28.9];look['target']=[-84,Y+.85,-31];look.location=xyz((-82.7,Y+1.1,-30))
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE));print('IMPORTED_KIT',len(parts),'REMOVED_TOM_PIECES',removed)
