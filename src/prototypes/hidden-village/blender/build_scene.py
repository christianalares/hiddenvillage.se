"""Build the editable woodland in Blender. Coordinates in helpers are Three.js metres.
Run: Blender -b --factory-startup --python build_scene.py -- --cache /tmp/hidden-village-assets
"""
import bpy, math, random, sys, argparse, json
import numpy as np
from pathlib import Path
from mathutils import Vector
from mathutils.noise import noise_vector

ROOT = Path(__file__).resolve().parents[4]
HERE = Path(__file__).resolve().parent
ASSETS = ROOT / 'public/prototype/hidden-village/assets'
args = argparse.ArgumentParser()
args.add_argument('--cache', default=str(HERE / '.cache'))
args.add_argument('--woods-only', action='store_true')
opts = args.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
opts.village = not opts.woods_only
CACHE = Path(opts.cache)
random.seed(86109)
rnd = random.uniform
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
for c in list(bpy.data.collections):
 if c.name != 'Collection': bpy.data.collections.remove(c)
base = bpy.data.collections.get('Collection'); base.name = '01 · Landform'
COL = base

def collection(name):
 global COL
 COL = bpy.data.collections.new(name); bpy.context.scene.collection.children.link(COL)
 return COL

def move(o):
 for c in list(o.users_collection): c.objects.unlink(o)
 COL.objects.link(o)
 return o

def xyz(v): return Vector((v[0], -v[2], v[1]))
def smooth(t):
 t=max(0,min(1,t)); return t*t*(3-2*t)
def tx(z): return math.sin(z*.105)*.72-smooth((z-43)/44)*8+math.sin((z-22)*.14)*1.8*smooth((z-22)/18)
def th(z): return smooth((z-22)/74)*10.5
def gh(x,z):
 off=x-tx(z); edge=smooth((abs(off)-2)/8); ridge=smooth((z-33)/30)
 bank=edge*(1.4+ridge*4.5) if off<0 else -edge*ridge*7
 uneven=edge*(math.sin(x*.38+z*.12)*.7+math.cos(z*.29)*.35)
 ravine=math.exp(-((z-54.5+math.sin(x*.12)*.8)/2.15)**2)*4.8
 road=1-smooth((abs(off)-1.65)/.65)
 ravine*=1-road+road*smooth((z-50.51)/.7)*smooth((58.29-z)/.7)
 hill=math.exp(-((x-32)/17)**2-((z+46)/25)**2)*18*smooth((abs(off)-1.8)/6)
 micro=(math.sin(x*2.6+z*.71)*math.sin(z*3.1-x*.4))*.055
 return th(z)+bank+uneven-ravine+hill+micro

def mat(name, color=(.35,.35,.35,1), file=None, normal=None, alpha=False, emission=0):
 m=bpy.data.materials.new(name);m.diffuse_color=color;m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=color
 bs.inputs['Roughness'].default_value=.92
 if file:
  im=bpy.data.images.load(str(file),check_existing=True)
  n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=im;m.node_tree.links.new(n.outputs['Color'],bs.inputs['Base Color'])
  if alpha:
   m.node_tree.links.new(n.outputs['Alpha'],bs.inputs['Alpha']);m.surface_render_method='DITHERED';m['alphaTest']=.42
 if normal:
  im=bpy.data.images.load(str(normal),check_existing=True);im.colorspace_settings.name='Non-Color'
  n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=im
  nm=m.node_tree.nodes.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.7
  m.node_tree.links.new(n.outputs['Color'],nm.inputs['Color']);m.node_tree.links.new(nm.outputs['Normal'],bs.inputs['Normal'])
 if emission:
  bs.inputs['Emission Color'].default_value=color;bs.inputs['Emission Strength'].default_value=emission
 return m

wood=mat('Weathered oak',file=ASSETS/'roof-planks.jpg')
bark=mat('Fissured pine bark',file=ASSETS/'pine-bark.jpg')
iron=mat('Forged black iron',(.055,.067,.066,1))
stone=mat('Dressed granite',(.28,.31,.29,1),ASSETS/'weathered-plaster.jpg')
plaster=mat('Limewashed walls',(.42,.43,.38,1),ASSETS/'weathered-plaster.jpg')
roofmat=mat('Smoke-dark shingles',(.18,.22,.21,1),ASSETS/'roof-planks.jpg')
lightmat=mat('Amber glass',(.92,.46,.13,1),emission=1.5)
leafmat=mat('Distant spruce foliage',file=ASSETS/'spruce-cutout.png',alpha=True)
soil=mat('Forest soil · blended trail',file=ASSETS/'forest-leaves.jpg',normal=ASSETS/'forest-normal.jpg')
pathmat=mat('Worn earth',file=ASSETS/'wood-chip-path.jpg')

# Shared construction helpers. The bevel is physical geometry, not a shading trick.
def mesh(name,verts,faces,material,uvs=None):
 d=bpy.data.meshes.new(name);d.from_pydata([xyz(v) for v in verts],[],faces);d.update()
 o=bpy.data.objects.new(name,d);COL.objects.link(o)
 if material:d.materials.append(material)
 if material==stone and not uvs:
  uv=d.uv_layers.new(name='UVMap')
  for p in d.polygons:
   axis=max(range(3),key=lambda k:abs(p.normal[k]));axes=[k for k in range(3) if k!=axis]
   for li in p.loop_indices:
    co=d.vertices[d.loops[li].vertex_index].co;uv.data[li].uv=tuple(co[k]*1.5 for k in axes)
 if uvs:
  uv=d.uv_layers.new(name='UVMap')
  for p in d.polygons:
   for li in p.loop_indices:uv.data[li].uv=uvs[d.loops[li].vertex_index]
 return o

def apply(o,modifier):
 bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=modifier.name)

def box(name,pos,size,material=wood,bevel=.025,rot=0):
 bpy.ops.mesh.primitive_cube_add(size=1,location=xyz(pos));o=move(bpy.context.object);o.name=name
 o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  mod=o.modifiers.new('Worn edges','BEVEL');mod.width=bevel;mod.segments=2;apply(o,mod)
 o.rotation_euler.z=-rot
 o.data.materials.append(material)
 # Metre-scale UVs on dominant face; grain runs along each timber.
 uv=o.data.uv_layers.active
 for p in o.data.polygons:
  axis=max(range(3),key=lambda k:abs(p.normal[k]));uvaxes=[k for k in range(3) if k!=axis]
  for li in p.loop_indices:
   co=o.data.vertices[o.data.loops[li].vertex_index].co
   if material.name.startswith('Warm recessed'):
    uv.data[li].uv=tuple(co[k]/max(o.dimensions[k],.01)+.5 for k in uvaxes)
   elif material in [wood,roofmat]:
    long=max(uvaxes,key=lambda k:o.dimensions[k]);short=next(k for k in uvaxes if k!=long)
    uv.data[li].uv=(.225+co[short]/max(o.dimensions[short],.01)*.024,co[long]*.35)
   else:uv.data[li].uv=(co[uvaxes[0]]*.7,co[uvaxes[1]]*.7)
 return o

def beam(name,a,b,r,material=wood,ends=8):
 av,bv=xyz(a),xyz(b);v=bv-av
 bpy.ops.mesh.primitive_cone_add(vertices=ends,radius1=r,radius2=r*.83,depth=v.length,location=(av+bv)*.5)
 o=move(bpy.context.object);o.name=name;o.rotation_euler=v.to_track_quat('Z','Y').to_euler();o.data.materials.append(material)
 for p in o.data.polygons:p.use_smooth=len(p.vertices)==4
 if material==wood:
  for uv in o.data.uv_layers.active.data:uv.uv=(.215+uv.uv.x*.025,uv.uv.y*v.length*.4)
 return o

def empty(name,pos,**extras):
 o=bpy.data.objects.new(name,None);COL.objects.link(o);o.location=xyz(pos)
 for k,v in extras.items():o[k]=v
 return o

# The mesh is the rendered ground, with denser transverse vertices at the walking edge.
# COLOR_0 stores path blend and precomputed contact shade; the runtime blends two tiling maps.
terrain=[]
xs=[-100,-70,-48,-34,-25,-19,-15,-12,-10,-8,-6,-5,-4,-3.3,-2.8,-2.3,-1.9,-1.5,-1,-.5,0,.5,1,1.5,1.9,2.3,2.8,3.3,4,5,6,8,10,12,15,19,25,34,48,70,100]
for chunk,z0 in enumerate(range(-112,110,18)):
 verts=[];uvs=[];faces=[];colors=[]
 for j in range(25):
  z=z0+j*.75
  for off in xs:
   x=tx(z)+off;y=gh(x,z)
   verts.append((x,y,z));uvs.append((x*.32,z*.32))
   width=1.45+math.sin(z*.8)*.13+math.sin(z*2.4)*.045
   blend=1-smooth((abs(off)-width)/.75)
   shade=.82+math.sin(x*.15+z*.09)*.08
   colors.append((blend,shade,0,1))
 for j in range(24):
  for i in range(len(xs)-1):
   a=j*len(xs)+i;faces.append((a,a+len(xs),a+1+len(xs),a+1))
 o=mesh(f'Landform_{chunk:02}',verts,faces,soil,uvs)
 for p in o.data.polygons:p.use_smooth=True
 attr=o.data.color_attributes.new(name='GroundBlend',type='FLOAT_COLOR',domain='POINT')
 for i,c in enumerate(colors):attr.data[i].color=c
 terrain.append(o)
# Keep the Blender material preview faithful to the runtime's terrain blend.
n=soil.node_tree.nodes;l=soil.node_tree.links;bs=n.get('Principled BSDF')
forest=next(n for n in n if n.type=='TEX_IMAGE');pathnode=n.new('ShaderNodeTexImage');pathnode.image=bpy.data.images.load(str(ASSETS/'wood-chip-path.jpg'),check_existing=True)
vc=n.new('ShaderNodeVertexColor');vc.layer_name='GroundBlend';sep=n.new('ShaderNodeSeparateColor');l.new(vc.outputs['Color'],sep.inputs['Color'])
mix=n.new('ShaderNodeMixRGB');l.new(sep.outputs['Red'],mix.inputs[0]);l.new(forest.outputs['Color'],mix.inputs[1]);l.new(pathnode.outputs['Color'],mix.inputs[2]);shade=n.new('ShaderNodeMixRGB');shade.blend_type='MULTIPLY';shade.inputs[0].default_value=1;l.new(mix.outputs[0],shade.inputs[1]);l.new(sep.outputs['Green'],shade.inputs[2]);l.new(shade.outputs[0],bs.inputs['Base Color'])

collection('02 · Scanned woodland library')
library=COL

def import_asset(name,tri_budget):
 bpy.ops.import_scene.gltf(filepath=str(CACHE/name/(name+'.gltf')))
 obs=[o for o in bpy.context.selected_objects if o.type=='MESH']
 for o in obs:
  move(o);o.location=(0,0,0)
  bpy.context.view_layer.objects.active=o
  bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
  vs=[v.co for v in o.data.vertices];lo=Vector(tuple(min(v[k] for v in vs) for k in range(3)));hi=Vector(tuple(max(v[k] for v in vs) for k in range(3)))
  offset=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
  for v in o.data.vertices:v.co-=offset
  if len(o.data.polygons)>tri_budget:
   m=o.modifiers.new('Web silhouette reduction','DECIMATE');m.ratio=tri_budget/len(o.data.polygons);apply(o,m)
  for p in o.data.polygons:p.use_smooth=True
  # Only the diffuse and normal are useful at this scene's scale; fixed high roughness.
  for m in o.data.materials:
   if not m or not m.use_nodes:continue
   bs=m.node_tree.nodes.get('Principled BSDF')
   for key in ['Metallic','Roughness','Specular IOR Level']:
    for link in list(bs.inputs[key].links):m.node_tree.links.remove(link)
   bs.inputs['Metallic'].default_value=0;bs.inputs['Roughness'].default_value=.95;bs.inputs['Specular IOR Level'].default_value=.22
   # No material-level specular extension needed by this matte woodland.
   if name=='rock_moss_set_01':
    bs.inputs['Base Color'].links[0].from_node.image=bpy.data.images.load(str(ASSETS/'rock-moss-color.jpg'),check_existing=True)
   if name=='fern_02':
    diffuse=bs.inputs['Base Color'].links[0].from_node
    if not bpy.data.images.get('Fern_RGBA'):
     alpha=bpy.data.images.load(str(CACHE/name/'alpha.png'))
     color=diffuse.image;w,h=color.size[:];alpha.scale(w,h)
     pixels=np.array(color.pixels[:],dtype=np.float32).reshape(-1,4)
     pixels[:,3]=np.array(alpha.pixels[:],dtype=np.float32).reshape(-1,4)[:,0]
     im=bpy.data.images.new('Fern_RGBA',w,h,alpha=True);im.pixels.foreach_set(pixels.ravel());im.file_format='PNG';im.filepath_raw=str(CACHE/'fern-rgba.png');im.save()
    diffuse.image=bpy.data.images['Fern_RGBA'];m.node_tree.links.new(diffuse.outputs['Alpha'],bs.inputs['Alpha']);m.surface_render_method='DITHERED';m['alphaTest']=.42
 return obs
rocks=import_asset('rock_moss_set_01',650)
ferns=import_asset('fern_02',320)
roots=import_asset('pine_roots',1000)
stumps=import_asset('tree_stump_01',1800)
# Library objects stay editable but outside the exported scene. Instances share their mesh data.
for o in list(library.objects):library.objects.unlink(o)
contacts=[]
def clearing(x,z):
 return any(abs(x-bx)<3.5*scale and abs(z-bz)<(5 if bz==22 else 3.5)*scale for bx,bz,scale in [(-6.8,22,1.05),(6.9,0,1.12),(-7.8,-17.2,.95),(8.5,-20.5,.8),(0,-32,1.2)]) or ((x+3.9)**2+(z+2)**2<3)
def place(template,name,x,z,scale=1,rotation=None,sink=.04,y=None):
 o=template.copy();o.data=template.data;COL.objects.link(o);o.name=name
 o.location=xyz((x,(gh(x,z) if y is None else y)-sink,z))
 o.scale=(scale,scale,scale);o.rotation_euler=(0,0,rnd(0,math.tau) if rotation is None else rotation)
 return o
collection('03 · Moss, roots and understorey')
for i,(off,z,s) in enumerate([(-3.35,95,1.15),(-4.5,100,.95),(-3.6,86,1.05),(3.8,90,.75)]):
 x=tx(z)+off;o=place(rocks[i%6],f'Opening anchor {i}',x,z,s,rotation=i*.8,sink=.1)
 radius=max(rocks[i%6].dimensions.x,rocks[i%6].dimensions.y)*s*.42
 o.location.z=min(gh(x+dx*radius,z+dz*radius) for dx,dz in [(0,0),(1,0),(-1,0),(0,1),(0,-1)])-.1
 contacts.append((x,z,radius))
 for k in range(5):
  a=k*math.tau/5;px,pz=x+math.sin(a)*radius*1.08,z+math.cos(a)*radius*1.08
  place(ferns[k%4],f'Opening fern {i}.{k}',px,pz,1.4+(k%3)*.25,sink=.04)

for i in range(118):
 z=rnd(-30,109);side=-1 if i%3 else 1;off=side*rnd(2.9,11 if z>35 else 18);x=tx(z)+off
 s=rnd(.4,1.15)
 if clearing(x,z):continue
 o=place(rocks[i%6],f'Moss boulder {i:03}',x,z,s,sink=.18*s)
 radius=max(rocks[i%6].dimensions.x,rocks[i%6].dimensions.y)*s*.42
 o.location.z=min(gh(x+dx*radius,z+dz*radius) for dx,dz in [(0,0),(1,0),(-1,0),(0,1),(0,-1)])-.12*s
 contacts.append((x,z,radius))
for i in range(420):
 z=rnd(-30,109);side=(-1 if i%2 else 1);off=side*rnd(2.1,9.8);x=tx(z)+off
 if 50.5<z<59 and abs(off)<3.8:continue
 if (z<30 and abs(off)<6) or clearing(x,z):continue
 place(ferns[i%4],f'Fern colony {i:03}',x,z,rnd(.7,2.4),sink=.035)
for i in range(30):
 z=rnd(35,106);x=tx(z)+(-1 if i%3 else 1)*rnd(1.6,5)
 if 49<z<60:continue
 o=place(roots[i%2],f'Exposed root {i:02}',x,z,rnd(.7,1.4),sink=.06)
 normal=Vector((-(gh(x+.1,z)-gh(x-.1,z))/.2,(gh(x,z+.1)-gh(x,z-.1))/.2,1)).normalized()
 o.rotation_euler=normal.to_track_quat('Z','Y').to_euler()
for i,z in enumerate([102,91,85,69,46,35,-5]):
 x=tx(z)-rnd(3.3,6);place(stumps[0],f'Old stump {i}',x,z,rnd(.9,1.5),sink=.07)

# Sculpted ring trunks: buttress, taper, bends, bark corrugation and real lateral limbs.
collection('04 · Canopy and shelter')
def trunk(name,height,radius,seed):
 rng=random.Random(seed);verts=[];uv=[];faces=[];rings=17;sides=13
 bend=rng.uniform(-.7,.7)
 for j in range(rings):
  t=(j/(rings-1))**1.55;y=height*t
  for k in range(sides+1):
   a=k/sides*math.tau;r=radius*(1-t*.9)*(1+.10*math.sin(a*5+1)+.045*math.sin(j*3+k))
   r*=1+1.2*math.exp(-t*28)*(0.5+0.5*math.cos(a*4))
   verts.append((math.cos(a)*r+bend*t*t,y,math.sin(a)*r+math.sin(t*2)*.25));uv.append((k/sides*2,t*height*.3))
 for j in range(rings-1):
  for k in range(sides):
   a=j*(sides+1)+k;faces.append((a,a+sides+1,a+sides+2,a+1))
 o=mesh(name,verts,faces,bark,uv)
 for p in o.data.polygons:p.use_smooth=True
 return o
# Volumetric crown made of bent, intersecting branch fans sampling the existing
# authored spruce canopy. Full-tree cards are reserved for the far forest.
def crown(name,height,seed):
 rng=random.Random(seed);verts=[];uvs=[];faces=[]
 # Curved, intersecting canopy slices retain fine photographic branch silhouettes.
 # The separate sculpted trunk provides real parallax and contact at walking height.
 for plane in range(3):
  a=plane*math.pi/3+rng.uniform(-.08,.08);start=len(verts)
  for j in range(9):
   t=j/8
   for k in range(5):
    u=k/4;across=(u-.5)*height*.62
    depth=math.sin(u*math.pi)*height*.065*math.sin(t*math.pi)
    verts.append((math.cos(a)*across-math.sin(a)*depth,height*t,math.sin(a)*across+math.cos(a)*depth))
    uvs.append((u,t))
  for j in range(8):
   for k in range(4):
    q=start+j*5+k;faces.append((q,q+1,q+6,q+5))
 return mesh(name,verts,faces,leafmat,uvs)
prototypes=[]
for i in range(4):
 h=12+i*1.5;stem=trunk(f'Pine stem variant {i}',h,.28+i*.025,51+i);top=crown(f'Spruce crown variant {i}',h,200+i)
 prototypes.append((stem,top))
 for o in [stem,top]:COL.objects.unlink(o)
positions=[(tx(z)+off,z) for off,z in [(-3.6,99),(4.8,96),(-5.1,89),(5.6,86),(-4.1,78),(-4.8,69),(-4.6,61),(-4.3,45),(5.8,40),(-9,29),(10,16),(-12,-13)]]
for i in range(80):
 z=rnd(-40,111);side=-1 if i%2 else 1;off=side*rnd(6 if side<0 else 13,40)
 if side>0 and 45<z<86 and off<33:continue
 positions.append((tx(z)+off,z))
for i,(x,z) in enumerate(positions):
 if clearing(x,z) or (z<12 and 12<x<53):continue
 s=rnd(.8,1.35);ang=rnd(0,math.tau)
 for j,p in enumerate(prototypes[i%4]):place(p,f'{"Trunk" if j==0 else "Crown"}_{i:03}',x,z,s,ang,sink=.07)
 contacts.append((x,z,.85*s))
 if i<22:
  y=gh(x,z)
  for k in range(3):
   a=rnd(0,math.tau);h=rnd(2.7,5);r=rnd(.5,1.8)
   beam('Broken lower limb',(x,y+h,z),(x+math.cos(a)*r,y+h-.45,z+math.sin(a)*r),.06,bark)
# Distant silhouette stands, kept below the ridge sight line.
card=mesh('Spruce distance template',[(-.25,0,0),(.25,0,0),(.25,1,0),(-.25,1,0)],[(0,1,2,3)],leafmat,[(0,0),(1,0),(1,1),(0,1)])
COL.objects.unlink(card)
for i in range(210):
 x=rnd(-65,85);z=rnd(-100,100)
 if abs(x-tx(z))<23 or ((x-31)/26)**2+((z+37)/43)**2<1:continue
 h=rnd(7,15);place(card,f'Far spruce {i:03}',x,z,h,rnd(-.4,.4),sink=.05)
# Feathered contact darkening stored on the terrain, free of runtime shadow maps.
for o in terrain:
 c=o.data.color_attributes['GroundBlend']
 for v in o.data.vertices:
  x,z=v.co.x,-v.co.y
  shade=1
  for px,pz,r in contacts:
   d=((x-px)**2+(z-pz)**2)/(r*r)
   if d<9:shade*=1-.32*math.exp(-d*1.8)
  col=c.data[v.index].color;col[1]*=max(.4,shade);c.data[v.index].color=col

collection('05 · Crossing and ridge')
for side in [-1,1]:
 points=[]
 for z in [51,52.75,54.5,56.25,58]:
  x=tx(z)+side*1.62;y=th(z)
  box('Bridge oak upright',(x,y+.55,z),(.15,1.28,.17),bevel=.025)
  points.append((x,y,z))
  for yy in [.24,1.03]:box('Peg',(x-side*.085,y+yy,z),(.045,.045,.055),iron,.01)
 for a,b in zip(points,points[1:]):
  for y in [.51,1.10,-.31]:
   beam('Continuous handrail',(a[0],a[1]+y,a[2]),(b[0],b[1]+y,b[2]),.08 if y>0 else .17)
  beam('Bridge diagonal brace',(a[0],a[1]+.22,a[2]),(b[0],b[1]+.96,b[2]),.045)
for i in range(26):
 z=50.65+i*.3;x=tx(z);y=th(z)
 b=box('Worn bridge deck',(x,y-.065,z),(3.42,.15,.277),bevel=.024,rot=math.atan((tx(z+.1)-tx(z-.1))/.2))
 b.rotation_euler.y=rnd(-.007,.007)
for side in [-1,1]:
 for z in [50.8,58.2]:
  for row in range(3):
   for k in range(2):
    x=tx(z)+side*(1.35+k*.5)
    o=place(rocks[(row+k)%6],'Mossy bridge abutment',x,z,.33,rotation=k,sink=0,y=th(z)-.9+row*.25)
points=[]
for z in [88,83.2,78.4,73.6,68.8,64]:
 x=tx(z)+2.45;y=gh(x,z);beam('Split oak ridge post',(x,y-.1,z),(x+.035,y+1.05,z),.09)
 points.append((x,y,z))
for a,b in zip(points,points[1:]):
 for h in [.48,.9]:beam('Ridge rail',(a[0],a[1]+h,a[2]),(b[0],b[1]+h,b[2]),.047)

collection('06 · Lanterns')
lamps=[]
for i,(z,side) in enumerate([(94,1),(74,1),(61,-1),(38,-1),(16,1),(1,-1),(-18,1)]):
 x=tx(z)+side*2.65;y=gh(x,z);arm=-side*.63;h=2.75
 beam('Lantern hewn post',(x,y-.16,z),(x+.04,y+h+.28,z),.09)
 beam('Lantern bracket',(x,y+h+.2,z),(x+arm,y+h+.2,z),.055)
 beam('Lantern brace',(x,y+h-.35,z),(x+arm*.7,y+h+.16,z),.035)
 beam('Hanging iron',(x+arm,y+h+.2,z),(x+arm,y+h-.05,z),.018,iron)
 box('Amber lantern pane',(x+arm,y+h-.29,z),(.18,.32,.18),lightmat,.01)
 for yy in [h-.49,h-.08]:box('Lantern iron cap',(x+arm,y+yy,z),(.29,.06,.29),iron,.025)
 for dx in [-.115,.115]:
  for dz in [-.115,.115]:beam('Lantern frame',(x+arm+dx,y+h-.47,z+dz),(x+arm+dx,y+h-.1,z+dz),.015,iron,6)
 empty('Lamp_anchor_'+str(i),(x+arm,y+h-.26,z),lamp=True,intensity=15)
 lamps.append((x+arm,y+h-.26,z))

# Real ridged landforms rather than sharp planar cutouts.
collection('08 · Valley silhouettes')
for layer in range(3):
 verts=[];faces=[]
 for j in range(5):
  for i in range(70):
   x=-145+i*4.2;z=-100-layer*22-j*9
   ridge=19+layer*8+math.sin(i*.35+layer)*8+math.sin(i*.91+layer)*2.8
   y=ridge*(math.sin(j/4*math.pi)*.65+.35)-j*2
   verts.append((x,y,z))
 for j in range(4):
  for i in range(69):
   a=j*70+i;faces.append((a,a+1,a+71,a+70))
 # Close the front and back down to the valley floor; open ribbons exposed sky gaps.
 for row in [0,4]:
  for i in range(69):
   a=row*70+i;b=len(verts);verts.extend([(verts[a][0],-20,verts[a][2]),(verts[a+1][0],-20,verts[a+1][2])]);faces.append((a,b,b+1,a+1) if row==0 else (a,a+1,b+1,b))
 m=mat('Distant ridge '+str(layer),[(.075,.115,.125,1),(.105,.145,.16,1),(.135,.17,.19,1)][layer])
 o=mesh('Mountain ridge '+str(layer),verts,faces,m)
 for p in o.data.polygons:p.use_smooth=True

# Architecture is added in the second production stage, after the opening is reviewed.
exec(compile((HERE/'village.py').read_text(),str(HERE/'village.py'),'exec'))

bpy.context.view_layer.update()
depsgraph=bpy.context.evaluated_depsgraph_get()
for o in terrain:
 attr=o.data.color_attributes['GroundBlend']
 for v in o.data.vertices:
  if abs(v.co.x-tx(-v.co.y))>26:continue
  hit,*_=bpy.context.scene.ray_cast(depsgraph,v.co+Vector((0,0,.16)),Vector((-.42,.3,.85)).normalized(),distance=32)
  if hit:
   col=attr.data[v.index].color;col[1]*=.67;attr.data[v.index].color=col
collection('09 · Walking cameras and lighting')
scene=bpy.context.scene
for name,z in [('Opening',100),('Ridge',82),('Crossing',60),('Workshop',31),('Square',3),('Last light',-19)]:
 data=bpy.data.cameras.new(name);o=bpy.data.objects.new('Camera · '+name,data);COL.objects.link(o);data.lens=31
 o.location=xyz((tx(z),th(z)+1.76,z));target=xyz((tx(z-7),th(z)+1.2,z-7));o.rotation_euler=(target-o.location).to_track_quat('-Z','Y').to_euler()
 if z==100:scene.camera=o
sun=bpy.data.lights.new('Cool canopy light','SUN');sun.energy=1.25;sun.angle=.22;sun.color=(.64,.75,.85)
o=bpy.data.objects.new('Cool canopy light',sun);COL.objects.link(o);o.rotation_euler=(.4,-.4,-.6)
for i,pos in enumerate(lamps):
 l=bpy.data.lights.new('Practical lamp '+str(i),'POINT');l.energy=45;l.color=(1,.54,.23);l.shadow_soft_size=.5
 o=bpy.data.objects.new(l.name,l);COL.objects.link(o);o.location=xyz(pos)
scene.world.color=(.055,.07,.085)
scene.render.engine='CYCLES';scene.cycles.samples=16
scene.render.resolution_x=1280;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
scene['workflow']='Authored scene in metres. GLB uses Y-up. Shared mesh objects become regional instances in Three.js.'
# Remove unused import images before packing, then pack all actual sources into the editable file.
for im in list(bpy.data.images):
 if not im.users:bpy.data.images.remove(im)
for im in bpy.data.images:
 if im.source=='FILE':
  if max(im.size)>2048:
   ratio=2048/max(im.size);im.scale(int(im.size[0]*ratio),int(im.size[1]*ratio))
  im.pack()
HERE.mkdir(exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'hidden-village.blend'),compress=True)
# Camera/light helpers stay in the source; lamp anchors and meshes go into the runtime.
bpy.ops.object.select_all(action='DESELECT')
for o in scene.objects:
 if o.type=='MESH' or (o.type=='EMPTY' and o.get('lamp')):o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(CACHE/'woodland-raw.glb'),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_yup=True,export_normals=True,export_texcoords=True,export_materials='EXPORT',export_cameras=False,export_lights=False)
print('SOURCE_READY',len(scene.objects),'objects',sum(len(o.data.polygons) for o in scene.objects if o.type=='MESH'),'instanced faces')
