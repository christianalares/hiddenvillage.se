"""Small authored woodland birds. Body and articulated wing silhouettes share meshes."""
import bpy,math
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(HERE/'hidden-village.blend'))
c=bpy.data.collections.new('18 · Birds above the valley');bpy.context.scene.collection.children.link(c)
m=bpy.data.materials.new('Raven charcoal');m.diffuse_color=(.035,.047,.05,1);m.use_nodes=True
m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=m.diffuse_color
m.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.95
# Blender local axes X wing span, Y forward, Z up.
verts=[(-.09,-.3,0),(.09,-.3,0),(.11,.12,0),(0,.32,.03),(-.11,.12,0),(0,-.05,.1),(0,-.05,-.07),(-.11,-.5,.01),(.11,-.5,.01)]
faces=[(0,1,5),(1,2,5),(2,3,5),(3,4,5),(4,0,5),(1,0,6),(2,1,6),(3,2,6),(4,3,6),(0,4,6),(0,7,8,1)]
body=bpy.data.meshes.new('Raven body');body.from_pydata(verts,[],faces);body.materials.append(m)
wing=bpy.data.meshes.new('Feathered wing silhouette')
v=[(0,-.18,0),(.36,-.24,-.02),(.72,-.31,-.06),(.64,-.15,-.045),(.78,-.19,-.06),(.68,-.04,-.04),(.81,-.08,-.05),(.69,.07,-.03),(.62,.21,0),(.32,.18,.035),(0,.09,.035),(.36,.01,.065)]
f=[(i,(i+1)%11,11) for i in range(11)]
# Backfaces as well as top surfaces for readable silhouettes from below.
wing.from_pydata(v,[],f+[tuple(reversed(t)) for t in f]);wing.materials.append(m)
for i,(x,y,z) in enumerate([(-84,55,124),(-70,52,112),(-65,46,100),(-61,17,-21),(-83,20,-35)]):
 root=bpy.data.objects.new('Raven flight '+str(i),None);c.objects.link(root);root.location=(x,-z,y);root['motion']='bird';root['phase']=i*1.8
 o=bpy.data.objects.new('Raven body '+str(i),body);c.objects.link(o);o.parent=root
 for side in [-1,1]:
  o=bpy.data.objects.new('Raven wing '+str(i)+'.'+str(side),wing);c.objects.link(o);o.parent=root;o.scale.x=side;o['wing']=side
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'hidden-village.blend'))
