"""One-time authoring pass from a preserved source. Export the saved .blend thereafter."""
import bpy,math,random,ast,shutil
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
SOURCE=HERE/'hidden-village.blend';BACKUP=HERE/'.cache/pre-mystery.blend'
if not BACKUP.exists():shutil.copy2(SOURCE,BACKUP)
bpy.ops.wm.open_mainfile(filepath=str(BACKUP))
random.seed(15010);rnd=random.uniform
wood=bpy.data.materials['Weathered oak'];iron=bpy.data.materials['Forged black iron'];stone=bpy.data.materials['Dressed granite'];roofmat=bpy.data.materials['Smoke-dark shingles'];bark=bpy.data.materials['Fissured pine bark'];leafmat=bpy.data.materials['Distant spruce foliage']
for node in ast.parse((HERE/'build_scene.py').read_text()).body:
 if isinstance(node,ast.FunctionDef) and node.name in ['collection','move','xyz','smooth','mat','mesh','apply','box','beam','empty','place','trunk','crown']:
  exec(compile(ast.Module(body=[node],type_ignores=[]),'build_scene.py','exec'))
exec((HERE/'landscape.py').read_text())
collection('19 · The overgrown passage')
fern=next(o for o in bpy.data.objects if o.type=='MESH' and any('fern' in m.name for m in o.data.materials if m))
rock=next(o for o in bpy.data.objects if o.type=='MESH' and any('rock_moss' in m.name for m in o.data.materials if m))
# A compulsory tunnel of rooted, bent hazel stems. Keep the 2.8m walking corridor clear.
for side in [-1,1]:
 for i in range(17):
  z=70+i*1.08+rnd(-.2,.2);x=tx(z)+side*rnd(2.4,4.1);y=gh(x,z)
  for k in range(3):
   zz=z+rnd(-.7,.7);xx=x+rnd(-.5,.5)
   place(fern,'Thicket fern',xx,zz,rnd(1.5,2.6),sink=.03)
  points=[(x,y-.16,z),(x-side*.35,y+1.5,z-.15),(x-side*.85,y+2.8,z-.4),(x-side*1.4,y+3.45,z-.7)]
  for k in range(3):beam('Hazel arch',points[k],points[k+1],.075-k*.017,bark,7)
  for k in range(3):
   a=points[2];b=(a[0]+rnd(-.65,.65),a[1]+rnd(.4,.85),a[2]+rnd(-1.2,1.2));beam('Hazel twig',a,b,.022,bark,5)
 # Reuse the authored foliage cards, clustered above head height instead of on the path.
 for i in range(11):
  z=71+i*1.55;x=tx(z)+side*2.3;y=gh(tx(z),z)
  top=crown('Thicket foliage',4.3,180+i+(0 if side<0 else 20));top.location=xyz((x,y-.15,z));top.scale=(.53,.53,.8)
# Trail paint follows the new short workshop fork too, without replacing saved terrain.
for o in bpy.data.objects:
 if not(o.type=='MESH' and o.name.startswith('Landform')):continue
 colors=o.data.color_attributes.get('GroundBlend')
 for v in o.data.vertices:
  x,z=v.co.x,-v.co.y
  if 13<z<40:
   c=list(colors.data[v.index].color);c[0]=max(c[0],1-smooth((path_distance(x,z)-.85)/.65));colors.data[v.index].color=c
# The old notebook marks were decorative strips. Runtime ink now sits on the real sheet.
for o in list(bpy.data.objects):
 if o.name.startswith(('Notebook written line','Compass mark','Padel racket','Racket perforation','Padel handle','Padel ball')):bpy.data.objects.remove(o,do_unlink=True)
for o in list(bpy.data.objects):
 if o.name.startswith('Notebook pages'):bpy.data.objects.remove(o,do_unlink=True)
 elif o.name.startswith('Notebook leather cover'):
  o.dimensions.x=.71;o.dimensions.y=.86
  pos=o.matrix_world.translation;box('Single folded paper',(pos.x,pos.z+.043,-pos.y),(.665,.018,.83),bpy.data.materials['Old cream paper'],.006)
for o in bpy.data.objects:
 if o.get('storyLabel'):
  o['storyLabel']={'A note for you':'For the wanderer','I wish this existed':'The missing thing','What if these connected?':'An open question','Away from the keyboard':'The room remembers','My little corner':'A light left on'}.get(o['storyLabel'],o['storyLabel'])
 if o.get('storyPoster'):o['storyPoster']='What is missing?'
# Every masonry tread gets a stone riser down into the actual slope, including moved houses.
collection('20 · Grounded thresholds')
for o in list(bpy.data.objects):
 if not(o.type=='MESH' and o.name.startswith('Rounded threshold')):continue
 bounds=[o.matrix_world@Vector(v) for v in o.bound_box]
 xmin,xmax=min(p.x for p in bounds),max(p.x for p in bounds)
 zmin,zmax=min(-p.y for p in bounds),max(-p.y for p in bounds)
 top=min(p.z for p in bounds)+.06
 bottom=min(gh(x,z) for x in [xmin,xmax] for z in [zmin,zmax])-.16
 if top>bottom:box('Stone stair riser',((xmin+xmax)/2,(top+bottom)/2,(zmin+zmax)/2),(xmax-xmin-.035,top-bottom,zmax-zmin-.035),stone,.025)
# Vary occupied, dim and dark cottages. The watcher is painted into one interior pane.
collection('21 · Windows after dusk')
dark=mat('Unlit window glass',(.018,.026,.029,1));dim=bpy.data.materials['Warm recessed windows'].copy();dim.name='Low candle windows';dim.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=.28
roots=[o for o in bpy.data.objects if o.type=='EMPTY' and o.name.startswith('Cottage')]
for root in roots:
 is_dark='6.9, 0' in root.name;is_dim=('-4, -23' in root.name or '13, -35' in root.name)
 if not(is_dark or is_dim):continue
 for child in root.children_recursive:
  if child.get('lamp'):child['intensity']=0 if is_dark else 3
  if child.type=='MESH' and any('Warm recessed' in m.name for m in child.data.materials if m):child.data.materials.clear();child.data.materials.append(dark if is_dark else dim)
# Quiet human outline, motionless and partly hidden by the window's existing mullions.
watcher=mat('A silhouette behind the curtain',(.025,.022,.017,1))
root=next(o for o in roots if '-4, -23' in o.name)
pane=next(o for o in root.children_recursive if o.name.startswith('Warm window'))
bounds=[pane.matrix_world@Vector(v) for v in pane.bound_box];c=sum(bounds,Vector())/8
w=(max(v.x for v in bounds)-min(v.x for v in bounds));h=max(v.z for v in bounds)-min(v.z for v in bounds)
profile=[(-.31,-.47),(-.28,-.06),(-.17,.08),(-.105,.10),(-.14,.22),(-.105,.34),(0,.39),(.105,.34),(.14,.22),(.105,.10),(.17,.08),(.28,-.06),(.31,-.47)]
mesh('Someone at the window',[(c.x+a*w,c.z+b*h,-c.y+.022) for a,b in profile],[tuple(range(len(profile)))],watcher)
# The telescope aims at the actual tower, with a physical eyepiece and a matching inspect anchor.
collection('22 · Things worth approaching')
barrel=bpy.data.objects['Telescope barrel'];center=barrel.matrix_world.translation
pos=Vector((center.x,center.z,-center.y));target=Vector((31,gh(31,-49)+10,-49));axis=(target-pos).normalized()
barrel.rotation_euler=xyz(axis).to_track_quat('Z','Y').to_euler()
glass=bpy.data.objects['Telescope glass'];glass.location=xyz(pos+axis*.66);glass.rotation_euler=barrel.rotation_euler
beam('Telescope eyepiece',pos-axis*.6,pos-axis*.78,.06,iron,16)
focus=empty('Look through telescope',pos-axis*.72,inspect='telescope');focus['target']=list(target)
eye=pos-axis*.83;focus['eye']=list(eye)
# The drum kit and well also honour their obvious invitation to come closer.
kit=empty('Sit beside the drums',(-82.8,gh(-84,-31)+2.2,-30.5),inspect='drums');kit['eye']=[-81,gh(-84,-31)+2.6,-28];kit['target']=[-84,gh(-84,-31)+1.9,-31]
well=empty('Look into the well',(-3.9,gh(-3.9,-2)+.9,-2),inspect='well');well['eye']=[-3.9,gh(-3.9,-2)+2.3,-.7];well['target']=[-3.9,gh(-3.9,-2)+.12,-2]
# A terraced blue court. Retaining stone reaches the soil, no floating sports platform.
collection('23 · The blue court')
x,z=-72,-52;w,d=10,20
y=max(gh(x+dx,z+dz) for dx in [-5,0,5] for dz in [-10,0,10])+.09
blue=mat('Worn blue court',(.055,.19,.30,1));chalk=mat('Court chalk',(.61,.65,.59,1));rust=mat('Old court iron',(.14,.13,.105,1));netmat=mat('Faded court net',(.12,.16,.145,1))
box('Blue playing surface',(x,y,z),(w,.12,d),blue,.025)
for dx,dz,ww,dd in [(0,-10.07,10.3,.15),(0,10.07,10.3,.15),(-5.07,0,.15,20),(5.07,0,.15,20)]:
 bottom=min(gh(x+dx+xx,z+dz+zz) for xx in [-ww/2,ww/2] for zz in [-dd/2,dd/2])-.15
 box('Court retaining stone',(x+dx,(bottom+y)/2,z+dz),(ww,y-bottom,dd),stone,.035)
for dx in [-4.85,4.85]:box('Court sideline',(x+dx,y+.067,z),(.055,.008,19.7),chalk,0)
for dz in [-9.85,9.85,-6.95,6.95]:box('Court service line',(x,y+.067,z+dz),(9.7,.008,.055),chalk,0)
for side in [-1,1]:box('Court centre line',(x,y+.067,z+side*3.5),(.055,.008,7),chalk,0)
# Narrow strips form mesh rather than alpha blended layers, so fences batch cheaply.
def wire_grid(name,a,b,height,spacing=.3,net=False):
 a,b=Vector(a),Vector(b);length=(b-a).length;direction=(b-a).normalized();verts=[];faces=[]
 def strip(p,q):
  i=len(verts);off=Vector((0,.007,0));verts.extend([p-off,p+off,q+off,q-off]);faces.append((i,i+1,i+2,i+3))
 for k in range(int(length/spacing)+1):
  p=a+direction*(k*spacing);h=height-(.12*math.sin(math.pi*k*spacing/length) if net else 0)
  # Vertical wires need a horizontal strip normal.
  i=len(verts);off=direction*.006;verts.extend([p-off,p+off,p+off+Vector((0,h,0)),p-off+Vector((0,h,0))]);faces.append((i,i+1,i+2,i+3))
 for j in range(int(height/spacing)+1):strip(a+Vector((0,j*spacing,0)),b+Vector((0,j*spacing,0)))
 return mesh(name,verts,faces,netmat if net else rust)
for side in [-1,1]:
 for j in range(11):
  zz=z-10+j*2;beam('Court fence post',(x+side*5.1,y-.15,zz),(x+side*5.1,y+3,zz),.038,rust,8)
 # The east central panel is an open gate.
 for j in range(10):
  if side==1 and j==5:continue
  zz=z-10+j*2;wire_grid('Court side mesh',(x+side*5.1,y,zz),(x+side*5.1,y,zz+2),3)
 for dz in [-10,10]:beam('Court crossbar',(x-5.1,y+3,z+dz),(x+5.1,y+3,z+dz),.035,rust,8)
for dz in [-10,10]:wire_grid('Court end mesh',(x-5.1,y,z+dz),(x+5.1,y,z+dz),3)
for dx in [-5,5]:beam('Net post',(x+dx,y,z),(x+dx,y+.95,z),.055,rust,12)
wire_grid('Sagging court net',(x-5,y+.04,z),(x+5,y+.04,z),.88,.12,True)
# The top tape follows a gentle sag.
for i in range(20):
 a=-5+i*.5;b=a+.5
 beam('Net top tape',(x+a,y+.94-.12*math.cos(a/5*math.pi/2),z),(x+b,y+.94-.12*math.cos(b/5*math.pi/2),z),.018,chalk,6)
for i in range(56):
 dx=rnd(-5,5);dz=rnd(-10,10)
 if abs(dx)<4.3 and abs(dz)<8.8 and i%7:continue
 o=place(fern,'Court encroaching fern',x+dx,z+dz,rnd(.4,1.15),sink=0);o.location.z=y+.065
for i in range(6):
 xx=x+rnd(-4,4);zz=z+rnd(-8,8);a=(xx,y+.15,zz);b=(xx+rnd(.8,2),y+.18,zz+rnd(-.8,.8));beam('Fallen court branch',a,b,rnd(.035,.065),bark,7)
 mid=(Vector(a)+Vector(b))*.5;beam('Fallen branch twig',mid,mid+Vector((-.35,.02,.65)),.018,bark,5)
# Low patches of moss and faded blue variation break up the uniform surface.
moss=mat('Court creeping moss',(.11,.16,.09,1));faded=mat('Court faded blue',(.075,.22,.31,1))
for i in range(70):
 xx=x+rnd(-4.8,4.8);zz=z+rnd(-9.8,9.8);r=rnd(.08,.4);n=7
 points=[(xx+math.cos(k*math.tau/n)*r*rnd(.7,1.3),y+.067,zz+math.sin(k*math.tau/n)*r*rnd(.7,1.3)) for k in range(n)]
 mesh('Court weathered patch',points,[tuple(reversed(range(n)))],moss if i%3==0 else faded)
look=empty('Beyond the music room',(x+5,y+1.2,z+9),inspect='court');look['eye']=[x+6.7,y+2.3,z+11.5];look['target']=[x,y+.6,z-2]
# A shallow chalk circle catches the telescope's eye, on the existing tower wall.
collection('24 · The distant signal')
signal=mat('Tower candle signal',(.78,.5,.22,1),emission=.8)
yy=gh(31,-49)+10
for dx in [-.65,0,.65]:box('Three distant marks',(31+dx,yy,-47.465),(.12,.42,.035),signal,.01)
# Preserve all image dependencies in the editable source.
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE))
print('MYSTERY_PASS_SAVED',len(bpy.data.objects))
