"""Final authoring adjustments to the saved mystery pass, after browser inspection."""
import bpy,ast,math,random
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(HERE/'hidden-village.blend'))
wood=bpy.data.materials['Weathered oak'];stone=bpy.data.materials['Dressed granite']
for node in ast.parse((HERE/'build_scene.py').read_text()).body:
 if isinstance(node,ast.FunctionDef) and node.name in ['xyz','smooth','mesh']:exec(compile(ast.Module(body=[node],type_ignores=[]),'build_scene.py','exec'))
exec((HERE/'landscape.py').read_text());COL=bpy.data.collections['19 · The overgrown passage']
random.seed(18);rnd=random.uniform
leaf=bpy.data.materials['Birch autumn leaves'].copy();leaf.name='Hazel foliage';leaf.diffuse_color=(.12,.19,.10,1);leaf.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=leaf.diffuse_color
# Dense elliptical leaves around the twig tips soften the cut silhouettes.
for o in list(COL.objects):
 if not o.name.startswith('Hazel twig'):continue
 bounds=[o.matrix_world@Vector(v) for v in o.bound_box];c=sum(bounds,Vector())/8
 verts=[];faces=[]
 for k in range(56):
  a=rnd(0,math.tau);r=rnd(.12,.65);p=Vector((c.x+math.cos(a)*r,c.z+rnd(-.24,.28),-c.y+math.sin(a)*r));sz=rnd(.09,.22);angle=rnd(0,math.tau)
  u=Vector((math.cos(angle)*sz,0,math.sin(angle)*sz));v=Vector((-math.sin(angle)*sz*.55,sz*.18,math.cos(angle)*sz*.55));i=len(verts)
  verts.extend([p-u,p-u*.45+v,p+u*.5+v*.8,p+u,p+u*.5-v*.8,p-u*.45-v]);faces.append(tuple(i+j for j in range(6)))
 mesh('Hazel leaf clusters',verts,faces,leaf)
# Paint both sides of the workshop fork and remove small growth in that walking corridor.
for o in list(bpy.data.objects):
 if o.type!='MESH':continue
 if o.name.startswith('Landform'):
  colors=o.data.color_attributes['GroundBlend']
  for v in o.data.vertices:
   if 13<-v.co.y<40:
    c=list(colors.data[v.index].color);c[0]=max(c[0],1-smooth((path_distance(v.co.x,-v.co.y)-1.2)/.7));colors.data[v.index].color=c
 elif any(any(k in m.name.lower() for k in ['fern','rock_moss','pine_roots','tree_stump','foliage','bark']) for m in o.data.materials if m):
  c=sum((o.matrix_world@Vector(v) for v in o.bound_box),Vector())/8
  if 15<-c.y<38 and c.x>1 and path_distance(c.x,-c.y)<1.7:bpy.data.objects.remove(o,do_unlink=True)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'hidden-village.blend'))
