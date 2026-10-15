"""Expand the saved woodland, preserving the authored village and bridge.
Run once against the pre-discoveries source; reruns use the local backup.
The resulting .blend is authoritative and exports without running this builder.
"""
import bpy, math, random, ast, shutil
from pathlib import Path
from mathutils import Vector
from mathutils.kdtree import KDTree
HERE=Path(__file__).resolve().parent
SOURCE=HERE/'hidden-village.blend'
BACKUP=HERE/'.cache/pre-discoveries.blend'
BACKUP.parent.mkdir(exist_ok=True)
if not BACKUP.exists():shutil.copy2(SOURCE,BACKUP)
bpy.ops.wm.open_mainfile(filepath=str(BACKUP))
random.seed(417);rnd=random.uniform
wood=bpy.data.materials['Weathered oak'];iron=bpy.data.materials['Forged black iron']
stone=bpy.data.materials['Dressed granite'];soil=bpy.data.materials['Forest soil · blended trail']
bark=bpy.data.materials['Fissured pine bark'];leafmat=bpy.data.materials['Distant spruce foliage']
roofmat=bpy.data.materials['Smoke-dark shingles'];lightmat=bpy.data.materials['Amber glass']
# Reuse construction helpers, never execute the original scene-resetting script.
module=ast.parse((HERE/'build_scene.py').read_text())
for node in module.body:
 if isinstance(node,ast.FunctionDef) and node.name in ['collection','move','xyz','smooth','mat','mesh','apply','box','beam','empty','place','trunk','crown']:
  exec(compile(ast.Module(body=[node],type_ignores=[]),str(HERE/'build_scene.py'),'exec'))
exec(compile((HERE/'landscape.py').read_text(),str(HERE/'landscape.py'),'exec'))

def outer(x,z):return smooth((abs(x-tx(z))-27)/18)*(15*math.exp(-((x+93)/30)**2-((z-123)/33)**2)-5*math.exp(-((x+76)/27)**2-((z+30)/24)**2))
# Preserve contact shading from the original terrain, then retopologize the extended west.
old=[o for o in bpy.data.objects if o.name.startswith('Landform') and o.type=='MESH']
count=sum(len(o.data.vertices) for o in old);tree=KDTree(count);oldcolors=[]
for o in old:
 colors=o.data.color_attributes['GroundBlend']
 for v in o.data.vertices:
  tree.insert((v.co.x,v.co.y,0),len(oldcolors));oldcolors.append(tuple(colors.data[v.index].color))
tree.balance()
for o in old:bpy.data.objects.remove(o,do_unlink=True)
# Move only outer vegetation with the new relief and remove growth through new trails.
organic=lambda o:o.type=='MESH' and any(any(k in m.name.lower() for k in ['foliage','bark','birch','fern','pine_roots','rock_moss','tree_stump','heather']) for m in o.data.materials if m)
templates={}
for key in ['rock_moss','fern','tree_stump']:
 templates[key]=next(o.copy() for o in bpy.data.objects if o.type=='MESH' and any(key in m.name for m in o.data.materials if m))
for o in list(bpy.data.objects):
 if not organic(o):continue
 center=sum((o.matrix_world@Vector(c) for c in o.bound_box),Vector())/8
 x,z=center.x,-center.y
 if x < -22 and path_distance(x,z)<4.5:
  bpy.data.objects.remove(o,do_unlink=True);continue
 if x < -24:o.location.z+=outer(x,z)
for c in list(bpy.data.collections):
 if c.name.startswith('14 '):
  for o in list(c.objects):bpy.data.objects.remove(o,do_unlink=True)
  bpy.data.collections.remove(c)

collection('15 · Long western trails')
contacts=[]
# Shared full crowns and sculpted stems; no new texture allocation.
prototypes=[]
for i in range(3):
 h=12+i*2;stem=trunk('Western pine source',h,.27+i*.04,100+i);top=crown('Western crown source',h,700+i)
 prototypes.append((stem,top))
 for o in (stem,top):COL.objects.unlink(o)

def landmark_clear(x,z):
 return ((x+99)/9)**2+((z-123)/10)**2<1 or ((x+84)/10)**2+((z+30)/11)**2<1 or any(math.hypot(x-a,z-b)<7 for a,b,_,_ in WILDLIFE)
for i in range(320):
 z=rnd(-74,174);x=rnd(-136,-26)
 if path_distance(x,z)<4.5 or landmark_clear(x,z):continue
 # A more open ridge above the dense forest and low wet hollow.
 if 108<z<141 and x<-75 and i%3:continue
 scale=rnd(.7,1.25);ang=rnd(0,math.tau)
 for j,p in enumerate(prototypes[i%3]):place(p,f'Western {"trunk" if j==0 else "crown"} {i}',x,z,scale,ang,sink=.1)
 contacts.append((x,z,.9*scale))
for bi,b in enumerate(BRANCHES):
 for i in range(230):
  z=rnd(b[1]+2,b[0]-2);x=tx(z)+branch_offset(z,b)+rnd(-18,18)
  if path_distance(x,z)<2.5 or landmark_clear(x,z) or x>-23:continue
  key='rock_moss' if i%4==0 else 'tree_stump' if i%31==0 else 'fern'
  scale=rnd(.5,1.1) if key!='fern' else rnd(.9,2.3)
  o=place(templates[key],f'Western {key} {bi}.{i}',x,z,scale,sink=.13 if key=='rock_moss' else .035)
  if key=='rock_moss':
   radius=max(o.dimensions.x,o.dimensions.y)*.4
   o.location.z=min(gh(x+dx*radius,z+dz*radius) for dx,dz in [(0,0),(1,0),(-1,0),(0,1),(0,-1)])-.14
   contacts.append((x,z,radius))

collection('16 · Lights along the detours')
lamps=[]
def lantern(x,z,h=2.6):
 y=gh(x,z)
 beam('Trail lantern post',(x,y-.22,z),(x,y+h+.2,z),.09)
 beam('Trail lantern arm',(x,y+h+.1,z),(x+.55,y+h+.1,z),.055)
 box('Trail amber glass',(x+.48,y+h-.24,z),(.19,.34,.19),lightmat,.015)
 for yy in [h-.46,h-.025]:box('Trail lantern cap',(x+.48,y+yy,z),(.3,.07,.3),iron,.02)
 for dx in [-.12,.12]:
  for dz in [-.12,.12]:beam('Trail lantern cage',(x+.48+dx,y+h-.43,z+dz),(x+.48+dx,y+h-.03,z+dz),.015,iron,6)
 empty('Trail light',(x+.48,y+h-.23,z),lamp=True,intensity=16)
 lamps.append((x+.48,y+h-.23,z))
for bi,b in enumerate(BRANCHES):
 for z in ([148,140,132,123,114,105,96] if bi==0 else [-10,-17,-24,-31,-38,-45,-52]):
  x=tx(z)+branch_offset(z,b)
  slope=(tx(z+.1)+branch_offset(z+.1,b)-tx(z-.1)-branch_offset(z-.1,b))/.2
  # Offset perpendicular to the trail, preserving a wide walking corridor.
  dx=3.1/math.sqrt(1+slope*slope);dz=-slope*dx
  lantern(x-dx,z-dz)

collection('17 · Christian’s discoveries')
paper=mat('Old cream paper',(.72,.64,.45,1))
cloth=mat('Wind-worn linen',(.27,.36,.32,1))
red=mat('Burgundy lacquer',(.21,.045,.035,1))
brass=mat('Tarnished brass',(.43,.31,.12,1))
ink=mat('Faded ink',(.075,.09,.085,1))
heads=mat('Drum skins',(.56,.55,.47,1))

def cylinder(name,pos,r,depth,material,axis=(0,1,0),sides=32):
 v=Vector(axis)*depth/2
 # Beam taper is deliberately subtle on wood, drums use exact cylindrical rims.
 bpy.ops.mesh.primitive_cylinder_add(vertices=sides,radius=r,depth=depth,location=xyz(pos))
 o=move(bpy.context.object);o.name=name;o.rotation_euler=xyz(axis).to_track_quat('Z','Y').to_euler();o.data.materials.append(material)
 mod=o.modifiers.new('Soft edge','BEVEL');mod.width=.008;mod.segments=2;apply(o,mod)
 return o

def notebook(id,x,y,z,heading):
 box('Notebook leather cover '+id,(x,y,z),(.96,.045,.65),red,.025)
 for dx in [-.245,.245]:box('Notebook pages '+id,(x+dx,y+.035,z),(.46,.035,.59),paper,.012)
 # Written traces and brass compass stamp remain visible in the physical world.
 for k in range(6):box('Notebook written line',(x+.23,y+.055,z-.2+k*.055),(.32-(k%3)*.035,.003,.008),ink,0)
 for k in range(4):
  a=k*math.pi/2
  beam('Compass mark',(x-.24,y+.058,z),(x-.24+math.cos(a)*.12,y+.058,z+math.sin(a)*.12),.008,brass,4)
 empty('Discovery '+id,(x,y+.2,z),discovery=id)
 # Label is a runtime canvas on a physical surface, no text raster baked at 4K.
 plaque=box('Notebook title '+id,(x,y+.2,z-.43),(.95,.32,.045),wood,.02)
 plaque['storyLabel']=heading
 return plaque

def table(x,z,width=1.65,depth=.85,height=1.05):
 y=max(gh(x+dx,z+dz) for dx in [-width/2,width/2] for dz in [-depth/2,depth/2])+.08
 box('Workbench top',(x,y+height,z),(width,.11,depth),wood,.035)
 for dx in [-width*.41,width*.41]:
  for dz in [-depth*.37,depth*.37]:
   bottom=gh(x+dx,z+dz)-.06
   beam('Bench leg',(x+dx,bottom,z+dz),(x+dx,y+height-.05,z+dz),.065)
 beam('Bench stretcher',(x-width*.4,y+.45,z),(x+width*.4,y+.45,z),.05)
 return y+height+.065

# A letter at the entrance, optional from the first few steps.
x=tx(199)-2.5;y=table(x,199)
notebook('invitation',x,y,199,'A note for you')
lantern(x-.9,199,2.3)
# Existing workshop bench and an adjacent experiment with copper coils.
x,z=-4.9,26.8;y=table(x,z,1.8,.9)
notebook('making',x,y,z,'I wish this existed')
for k in range(3):
 cylinder('Workshop cable spool',(x-1.25,y-.07,z+k*.23),.13,.14,brass,(0,0,1),20)
box('Pinned workshop sketch',(-6.9,gh(-6.8,22)+1.7,26.27),(.65,.8,.02),paper,.015)
# Hilltop observation shelter, deliberately open towards the route.
x,z=-100,123;y=max(gh(x+dx,z+dz) for dx in [-3,3] for dz in [-2,2])+.25
for dx in [-3,3]:
 for dz in [-2,2]:
  bottom=gh(x+dx,z+dz)-.3
  beam('Observation footing',(x+dx,bottom,z+dz),(x+dx,y+3.1,z+dz),.13)
for i in range(15):box('Observation deck',(x-2.8+i*.4,y,z),(.37,.12,4.3),wood,.015)
for dx in [-3,3]:beam('Observation roof beam',(x+dx,y+3,z-2.3),(x+dx,y+3,z+2.3),.11)
# Single sloping weather roof, individual overlapping boards.
for i in range(16):
 o=box('Observation roof',(x-3.2+i*.42,y+3.4-i*.025,z),(.45,.12,4.8),roofmat,.02);o.rotation_euler.y=.06
# Bench, binocular-like telescope, instruments and a notebook.
ybook=table(x+4.5,z,1.8,.9)
notebook('curiosity',x+4.5,ybook,z,'What if these connected?')
lantern(x+3.8,z+1.8,2.5)
beam('Telescope tripod',(x+1,y,z),(x+1,y+1.5,z),.04,brass)
for dx,dz in [(.6,.3),(-.6,.3),(0,-.6)]:beam('Telescope foot',(x+1+dx,y+.06,z+dz),(x+1,y+1.2,z),.025,iron)
cylinder('Telescope barrel',(x+1,y+1.65,z),.13,1.3,brass,(.85,.2,-.25))
cylinder('Telescope glass',(x+1.57,y+1.78,z-.17),.115,.015,ink,(.85,.2,-.25))
# Weather vane blades animate on a proper pole pivot.
beam('Weather mast',(x-2,y,z-1),(x-2,y+6,z-1),.045,iron)
pivot=empty('Weather vane pivot',(x-2,y+5.7,z-1),motion='vane')
for i in range(4):
 a=i*math.pi/2
 o=beam('Wind vane arm',(x-2,y+5.7,z-1),(x-2+math.cos(a)*.65,y+5.7,z-1+math.sin(a)*.65),.025,brass)
 o.parent=pivot;o.matrix_parent_inverse=pivot.matrix_world.inverted()
 o=box('Wind vane paddle',(x-2+math.cos(a)*.65,y+5.8,z-1+math.sin(a)*.65),(.25,.24,.04),brass,.015,rot=a)
 o.parent=pivot;o.matrix_parent_inverse=pivot.matrix_world.inverted()
# Music shelter in the valley. Open east wall, deeply framed roof and grounded deck.
x,z=-84,-31;y=max(gh(x+dx,z+dz) for dx in [-3.3,3.3] for dz in [-3,3])+.22
for dx in [-3.3,3.3]:
 for dz in [-3,3]:beam('Music cabin post',(x+dx,gh(x+dx,z+dz)-.3,z+dz),(x+dx,y+3.4,z+dz),.13)
for i in range(23):box('Music cabin floor',(x-3.3+i*.3,y,z),(.28,.12,6.3),wood,.015)
for k in range(11):
 yy=y+.16+k*.26
 box('Music cabin west wall',(x-3.3,yy,z),(.15,.24,6.1),wood,.016)
 box('Music cabin north wall',(x,yy,z-3),(6.6,.24,.15),wood,.016)
for i in range(25):
 xx=x-3.7+i*.3;yy=y+3.3+1.4*(1-abs(xx-x)/3.7)
 box('Music cabin shingles',(xx,yy,z),(.36,.14,7.2),roofmat,.018)
beam('Music gable tie',(x-3.7,y+3.25,z+3.3),(x+3.7,y+3.25,z+3.3),.12)
for side in [-1,1]:beam('Music gable rafter',(x+side*3.7,y+3.25,z+3.3),(x,y+4.75,z+3.3),.1)
# Warm slit windows and hanging lamp.
box('Music window glow',(x-3.2,y+1.9,z+1),(.04,.85,1.3),bpy.data.materials['Warm recessed windows'],.015)
empty('Music interior light',(x,y+2.3,z),lamp=True,intensity=26)
box('Music hanging lamp',(x,y+2.6,z),(.3,.4,.3),lightmat,.02)
beam('Music lamp chain',(x,y+2.8,z),(x,y+4.4,z),.015,iron)
# An identifiable drum kit with skins, rims, tuning lugs, legs, cymbals and sticks.
def drum(xx,yy,zz,r,depth,axis):
 cylinder('Drum lacquer shell',(xx,yy,zz),r,depth,red,axis)
 for side in [-1,1]:
  pos=Vector((xx,yy,zz))+Vector(axis)*depth/2*side
  cylinder('Drum chrome rim',pos,r*1.04,.04,iron,axis)
  cylinder('Drum skin',pos+Vector(axis)*.022*side,r*.94,.008,heads,axis)
 for k in range(8):
  a=k*math.tau/8
  # Vertical shells have physical tension rods around their circumference.
  if axis==(0,1,0):beam('Tension rod',(xx+math.cos(a)*r,yy-depth/2,zz+math.sin(a)*r),(xx+math.cos(a)*r,yy+depth/2,zz+math.sin(a)*r),.012,brass,6)
drum(x+.4,y+.62,z-.4,.59,.62,(1,0,0))
drum(x-.3,y+1.05,z+.45,.31,.28,(0,1,0))
drum(x+.2,y+1.35,z-1,.26,.3,(0,1,0))
drum(x-1.1,y+.8,z-1,.4,.55,(0,1,0))
for xx,zz,r,h in [(x+.7,z+1.25,.45,1.65),(x-1.1,z+1,.34,1.5),(x-.8,z-1.8,.49,1.9)]:
 beam('Cymbal stand',(xx,y,zz),(xx,y+h+.08,zz),.017,iron)
 for k in range(3):
  a=k*math.tau/3;beam('Cymbal tripod',(xx,y+.42,zz),(xx+math.cos(a)*.34,y+.05,zz+math.sin(a)*.34),.012,iron)
 cylinder('Brass cymbal',(xx,y+h,zz),r,.018,brass,(0,.98,.15),40)
 cylinder('Cymbal bell',(xx,y+h+.03,zz),r*.18,.055,brass)
cylinder('Drum stool',(x-1,y+.63,z),.28,.12,ink)
beam('Stool leg',(x-1,y,z),(x-1,y+.6,z),.045,iron)
for k in range(2):beam('Drum stick',(x-.45+k*.13,y+1.21,z+.25),(x-.2+k*.13,y+1.22,z+.7),.012,wood)
# Record shelf and modest amp.
box('Record shelf',(x-2.9,y+.7,z+1.6),(.5,1.4,1.6),wood,.03)
for k in range(12):box('Record sleeve',(x-2.62,y+.85,z+.95+k*.095),(.035,.45,.4),paper if k%3==0 else red,.003,rot=math.pi/2)
box('Small amp',(x-1.8,y+.4,z-2.3),(.8,.75,.45),ink,.05)
for k in range(16):beam('Amp grille',(x-2.15+k*.045,y+.12,z-2.06),(x-2.15+k*.045,y+.67,z-2.06),.005,brass,4)
ybook=table(x+5.6,z+1,1.8,.9)
notebook('rhythm',x+5.6,ybook,z+1,'Away from the keyboard')
lantern(x+4.6,z+2.4,2.5)
# Padel racket left beside the last house; a postcard on the trail-side table.
x,z=tx(-61)+2.7,-61;ybook=table(x,z,1.6,.8)
notebook('home',x,ybook,z,'My little corner')
# Racket head with real openings and a short handle, leaning against the bench.
cylinder('Padel racket head',(x+.95,ybook-.15,z),.22,.05,ink,(0,0,1))
for i in range(-2,3):
 for j in range(-2,3):
  if i*i+j*j<6:cylinder('Racket perforation',(x+.95+i*.07,ybook-.15+j*.07,z+.028),.018,.003,paper,(0,0,1),8)
beam('Padel handle',(x+.95,ybook-.35,z),(x+.95,ybook-.67,z),.04,wood)
cylinder('Padel ball',(x+.56,ybook+.07,z+.2),.065,.07,brass)
# Fabric hung securely from a line near the cabin; weights pin its top edge in runtime.
for k in range(3):
 xx=-83+k*.9;zz=-37;bottom=gh(xx,zz)
 if k in [0,2]:beam('Washing post',(xx,bottom-.2,zz),(xx,bottom+2.6,zz),.055)
beam('Washing line',(-83,gh(-83,-37)+2.4,-37),(-81.2,gh(-81.2,-37)+2.4,-37),.008,iron)
verts=[];faces=[]
for j in range(7):
 for i in range(7):
  xx=-82.9+i*.26;yy=gh(-82,-37)+2.37-j*.2
  verts.append((xx,yy,-37+math.sin(i*.8)*.035))
for j in range(6):
 for i in range(6):
  q=j*7+i;faces.append((q,q+1,q+8,q+7))
mesh('Pinned linen in the wind',verts,faces,cloth)
# More distant deer, anchored to authored flattened clearings.
for i,(xx,zz,rot,s) in enumerate(WILDLIFE[2:]):empty('Western deer '+str(i),(xx,gh(xx,zz),zz),animal=True,rotation=rot,scale=s)

# Rebuild terrain in spatial tiles; original contact shading retained near main route.
COL=bpy.data.collections.get('01 · Landform')
xs=[-160,-150,-140]+[float(i) for i in range(-130,-33)]+[i*.75 for i in range(-44,43)]+[38,48,65,85,110]
terrain=[]
all_lamps=[(o.location.x,o.location.z,-o.location.y) for o in bpy.data.objects if o.get('lamp')]
for chunk,z0 in enumerate(range(-112,230,18)):
 for tile in range(0,len(xs)-1,24):
  xx=xs[tile:min(tile+25,len(xs))];verts=[];faces=[];uvs=[];colors=[]
  for j in range(25):
   z=z0+j*.75
   for off in xx:
    x=tx(z)+off;verts.append((x,gh(x,z),z));uvs.append((x*.32,z*.32))
    width=1.55+math.sin(z*.8)*.12
    blend=1-smooth((path_distance(x,z)-width)/.8)
    if off>-32:
     _,idx,_=tree.find((x,-z,0));shade=oldcolors[idx][1]
    else:shade=.78+math.sin(x*.15+z*.09)*.07
    for px,pz,r in contacts:
     d=((x-px)**2+(z-pz)**2)/(r*r)
     if d<5:shade*=1-.26*math.exp(-d*1.8)
    pool=max((math.exp(-((x-lx)**2+(z-lz)**2)/3.2) for lx,ly,lz in all_lamps),default=0)
    colors.append((blend,max(.23,shade),pool,1))
  n=len(xx)
  for j in range(24):
   for i in range(n-1):
    a=j*n+i;faces.append((a,a+n,a+n+1,a+1))
  o=mesh(f'Landform_{chunk:02}_{tile:03}',verts,faces,soil,uvs)
  for p in o.data.polygons:p.use_smooth=True
  attr=o.data.color_attributes.new(name='GroundBlend',type='FLOAT_COLOR',domain='POINT')
  for i,c in enumerate(colors):attr.data[i].color=c
  terrain.append(o)
# Store the route/story plan in the editable scene.
bpy.context.scene['discovery_pass']='Western ridge, music hollow, three compass marks and personal notebooks'
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE))
print('DISCOVERIES SAVED',len(bpy.data.objects),'objects',sum(len(o.data.polygons) for o in terrain),'terrain faces')
