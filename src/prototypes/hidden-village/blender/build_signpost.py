"""An editable, reusable fingerpost. Does not modify the saved woodland composition."""
import bpy, math
from pathlib import Path
from mathutils import Vector

HERE = Path(__file__).resolve().parent
ASSETS = HERE.parents[3] / 'public/prototype/hidden-village/assets'
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def xyz(p): return Vector((p[0], -p[2], p[1]))
def material(name, color, emission=0):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Roughness'].default_value=.95
 if emission:
  p.inputs['Emission Color'].default_value=(*color,1); p.inputs['Emission Strength'].default_value=emission
 return m

wood=material('Fingerpost · rain-dark oak',(.42,.32,.21))
im=bpy.data.images.load(str(ASSETS/'roof-planks.jpg')); im.pack()
n=wood.node_tree.nodes.new('ShaderNodeTexImage');n.image=im
wood.node_tree.links.new(n.outputs['Color'],wood.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
iron=material('Fingerpost · forged iron',(.055,.065,.057))
glass=material('Fingerpost · warm glass',(.82,.43,.13),1.5)
label=material('Fingerpost · lettering replaced at runtime',(.63,.51,.32))

def finish(o,name,mat,bevel=.015):
 o.name=name; o.data.materials.append(mat)
 if bevel:
  mod=o.modifiers.new('Soft worn edges','BEVEL'); mod.width=bevel;mod.segments=2
  bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
 if mat==wood:
  uv=o.data.uv_layers.active or o.data.uv_layers.new()
  for p in o.data.polygons:
   for li in p.loop_indices:
    v=o.data.vertices[o.data.loops[li].vertex_index].co
    uv.data[li].uv=(.225+v.z*.025,v.x*.45+v.z*.23)
 return o

def box(name,pos,size,mat=wood,bevel=.015):
 bpy.ops.mesh.primitive_cube_add(size=1,location=xyz(pos));o=bpy.context.object
 o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 return finish(o,name,mat,bevel)

box('Oak post buried below ground',(0,1.55,0),(.18,3.4,.2),bevel=.035)
box('Iron foot collar',(0,.15,0),(.205,.21,.225),iron,.01)
for side,y in [('branch',2.62),('main',1.88)]:
 direction=-1 if side=='branch' else 1
 outline=[(-1.37,-.285),(.98,-.285),(1.51,0),(.98,.285),(-1.37,.285)]
 verts=[xyz((x*direction,y+dy,z)) for z in [.08,.23] for x,dy in outline]
 faces=[tuple(range(4,-1,-1)),tuple(range(5,10))]+[(i,(i+1)%5,(i+1)%5+5,i+5) for i in range(5)]
 mesh=bpy.data.meshes.new('Arrow plank');mesh.from_pydata(verts,[],faces);mesh.update()
 o=bpy.data.objects.new('Hand-cut '+side+' finger',mesh);bpy.context.collection.objects.link(o)
 bpy.context.view_layer.objects.active=o;o.select_set(True)
 # Correct outward normals after reflecting the left arrow.
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
 finish(o,o.name,wood,.022)
 # The label plane remains separate: runtime adds painted, accessible route names.
 v=[(-1.06,y-.23,.254),(1.06,y-.23,.254),(1.06,y+.23,.254),(-1.06,y+.23,.254)]
 m=bpy.data.meshes.new(side+' label');m.from_pydata([xyz(p) for p in v],[],[(0,1,2,3)]);m.update()
 uv=m.uv_layers.new()
 for i,co in enumerate([(0,0),(1,0),(1,1),(0,1)]):uv.data[i].uv=co
 o=bpy.data.objects.new(side+' lettering',m);bpy.context.collection.objects.link(o);o['forkLabel']=side;o.data.materials.append(label)
 for x in [-.085,.085]:
  bpy.ops.mesh.primitive_uv_sphere_add(segments=8,ring_count=4,radius=.032,location=xyz((x,y-.205,.264)))
  finish(bpy.context.object,'Hand-forged nail',iron,0)

# A small permanent practical light crowns the post; no extra runtime point light.
box('Lantern base',(0,3.23,0),(.37,.075,.33),iron)
box('Amber lantern panes',(0,3.46,0),(.25,.37,.22),glass,.008)
for x in [-.145,.145]:
 for z in [-.13,.13]:box('Lantern corner',(x,3.46,z),(.035,.43,.035),iron,.006)
bpy.ops.mesh.primitive_cone_add(vertices=4,radius1=.32,radius2=.065,depth=.18,location=xyz((0,3.76,0)),rotation=(0,0,math.pi/4))
finish(bpy.context.object,'Pitched iron lantern cap',iron,.008)

# One draw call per structural material, plus the two lettering surfaces.
for mat in [wood,iron,glass]:
 bpy.ops.object.select_all(action='DESELECT')
 objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.active_material==mat]
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0]
 if len(objects)>1:bpy.ops.object.join()
 bpy.context.object.name=mat.name
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'signpost.blend'))
bpy.ops.export_scene.gltf(filepath=str(ASSETS/'signpost.glb'),export_format='GLB',export_extras=True)
