"""Clear the old trees out of the authored court, preserve its new encroaching vegetation."""
import bpy,math,ast,numpy as np
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(HERE/'hidden-village.blend'))
roofmat=bpy.data.materials['Smoke-dark shingles'];wood=bpy.data.materials['Weathered oak'];stone=bpy.data.materials['Dressed granite'];COL=bpy.data.collections['23 · The blue court']
for node in ast.parse((HERE/'build_scene.py').read_text()).body:
 if isinstance(node,ast.FunctionDef) and node.name in ['xyz','move','box','mat','apply','beam']:exec(compile(ast.Module(body=[node],type_ignores=[]),'build_scene.py','exec'))
for o in list(bpy.data.objects):
 if o.type!='MESH' or o.name.startswith(('Court','Fallen','Blue','Net','Sagging')):continue
 if not any(any(k in m.name.lower() for k in ['foliage','bark','pine_roots','rock_moss','tree_stump']) for m in o.data.materials if m):continue
 c=sum((o.matrix_world@Vector(v) for v in o.bound_box),Vector())/8
 if abs(c.x+72)<9 and abs(-c.y+52)<14:bpy.data.objects.remove(o,do_unlink=True)
# Packed, subtle variation across the entire playing surface instead of a flat solid blue.
floor=bpy.data.objects['Blue playing surface'];material=floor.data.materials[0]
size=1024;rng=np.random.default_rng(71);v,u=np.mgrid[0:size,0:size]/size
noise=rng.normal(0,.018,(size,size))
wear=.87+.06*np.sin(u*9+v*4)+.04*np.sin(v*23+u*17)+noise
edge=np.clip((np.minimum(np.minimum(u,1-u),np.minimum(v,1-v))-.015)/.13,0,1)
wear*=.6+.4*edge
pixels=np.ones((size,size,4),dtype=np.float32)
for k,c in enumerate([.23,.42,.55]):pixels[:,:,k]=np.clip(c*wear,0,1)
for i in range(20):
 xx=rng.uniform(0,1);yy=rng.uniform(0,1);r=rng.uniform(.009,.04)
 mask=np.exp(-(((u-xx)/r)**2+((v-yy)/(r*.6))**2))*.14
 for k in range(3):pixels[:,:,k]*=(1-mask)
im=bpy.data.images.new('Weathered blue felt',size,size);im.pixels.foreach_set(pixels.ravel());im.pack()
bs=material.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(1,1,1,1)
tex=material.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im;material.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
uv=floor.data.uv_layers.active
for loop in floor.data.loops:
 co=floor.data.vertices[loop.vertex_index].co;uv.data[loop.index].uv=(co.x/10+.5,co.y/20+.5)
# Rear rebound panes and their iron uprights identify this as a padel enclosure.
glass=mat('Weathered court glass',(.16,.27,.31,.13));glass.surface_render_method='DITHERED';glass.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=.13
rust=bpy.data.materials['Old court iron'];y=floor.location.z;x,z=-72,-52
for side in [-1,1]:
 for dx in [-4,-2,0,2,4]:box('Court rebound glass',(x+dx,y+1.45,z+side*9.95),(1.96,2.8,.018),glass,.005)
 for dx in [-3,-1,1,3]:beam('Court back upright',(x+dx,y,z+side*10),(x+dx,y+3,z+side*10),.035,rust,8)
# Approach the open side gate. The sightline is clear of the fence and of nearby trees.
o=bpy.data.objects['Beyond the music room'];o['eye']=[-66,y+1.9,-51];o['target']=[-73,y+.5,-52]
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'hidden-village.blend'))
