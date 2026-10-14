"""High moor, pale hollow, pond and village detail. Uses the shared authoring kit."""
collection('10 · Heather and boundary stones')
heather=mat('Dry heather',(.16,.105,.13,1))
# One shared clump, small irregular blades and flower tips, rather than spheres.
verts=[];faces=[]
for k in range(13):
 a=k*2.4;r=rnd(.04,.38);xx=math.sin(a)*r;zz=math.cos(a)*r;h=rnd(.12,.36)
 n=len(verts);verts.extend([(xx-.025,0,zz),(xx+.025,0,zz),(xx+.07,h*.7,zz+.025),(xx+.015,h,zz)]);faces.append((n,n+1,n+2,n+3))
clump=mesh('Heather template',verts,faces,heather);COL.objects.unlink(clump)
for i in range(260):
 z=rnd(119,222);off=(-1 if i%2 else 1)*rnd(2.5,18);x=tx(z)+off
 if path_distance(x,z)<2 or clearing(x,z):continue
 place(clump,'Heather tussock',x,z,rnd(.8,1.8))
for i,z in enumerate([213,206,196,185,174,153,141,127,115]):
 x=tx(z)+(-1 if i%2 else 1)*rnd(3.5,7)
 if path_distance(x,z)<3:continue
 o=place(rocks[i%6],'Moor granite',x,z,rnd(1,1.6),sink=.5)
 contacts.append((x,z,1.6))
# Weathered boundary markers along the optional ridge.
for i,z in enumerate([149,137,125,114]):
 x=tx(z)+branch_offset(z,BRANCHES[0])-2.5
 o=place(rocks[(i+3)%6],'Boundary stone',x,z,.7,sink=.25);o.scale.z*=1.8

collection('11 · Pale hollow')
# Small authored bark atlas with narrow horizontal birch scars.
w,h=128,256;rng=np.random.default_rng(481)
pixels=np.ones((h,w,4),dtype=np.float32);shade=.68+rng.normal(0,.055,(h,w))
for i in range(95):
 xx=int(rng.integers(0,w));yy=int(rng.integers(0,h));span=int(rng.integers(3,24))
 shade[yy:min(yy+int(rng.integers(1,4)),h),xx:min(xx+span,w)]*=.25
for c,tint in enumerate([1,.97,.88]):pixels[:,:,c]=np.clip(shade*tint,0,1)
im=bpy.data.images.new('Birch silver bark',w,h);im.pixels.foreach_set(pixels.ravel());im.file_format='PNG';im.filepath_raw=str(CACHE/'birch-bark.png');im.save()
birch=mat('Silver birch bark',file=CACHE/'birch-bark.png')
birchleaf=mat('Birch autumn leaves',(.19,.21,.09,1))
for i in range(24):
 z=rnd(116,174);x=tx(z)+(-1 if i%2 else 1)*rnd(5,25)
 if clearing(x,z) or path_distance(x,z)<4:continue
 y=gh(x,z);height=rnd(5,9);lean=rnd(-.65,.65)
 for k in range(6):
  a=k/6;b=(k+1)/6
  beam('Pale birch stem',(x+lean*a*a,y+height*a,z),(x+lean*b*b,y+height*b,z+.12*b),.13*(1-a*.75),birch)
 lv=[];lf=[]
 for k in range(7):
  a=k*2.399;hh=height*(.37+k*.073);r=rnd(1,2.8);base=(x,y+hh,z);tip=(x+math.cos(a)*r,y+hh+1.0,z+math.sin(a)*r)
  beam('Bare birch bough',base,tip,.028,birch,6)
  for j in range(11):
   t=j/10;xx=base[0]+(tip[0]-base[0])*t;yy=base[1]+(tip[1]-base[1])*t;zz=base[2]+(tip[2]-base[2])*t
   side=-1 if j%2 else 1;xx+=side*.16;n=len(lv);size=rnd(.10,.23)
   lv.extend([(xx,yy,zz),(xx-size,yy+.03,zz+size*.35),(xx,yy+.08,zz+size),(xx+size,yy+.01,zz+size*.35)]);lf.append((n,n+1,n+2,n+3))
 mesh('Sparse birch leaves',lv,lf,birchleaf)
 contacts.append((x,z,.7))
for i,(x,z,rot,scale) in enumerate(WILDLIFE):
 empty('Deer clearing '+str(i),(x,gh(x,z),z),animal='deer',rotation=rot,scale=scale)
 # Grounded stones at the far edge help the animals read at their true size.
 for k in range(3):place(rocks[k],'Wildlife clearing stone',x+5+k,z+3,.35,sink=.15)

collection('12 · Reed pond')
for i,(x,z) in enumerate([(-36,-18),(-39,-28),(-34,-40),(-45,-35)]):
 for j,template in enumerate(prototypes[i]):place(template,('Shore trunk' if j==0 else 'Shore crown')+str(i),x,z,.9,i*.7,sink=.07)
water=mat('Still pond',(.035,.085,.09,1));water.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.44
cx,cz=-25,-26;water_y=gh(cx,cz)+.9
verts=[(cx,water_y,cz)];faces=[]
for i in range(65):
 a=i/64*math.tau;r=1+.035*math.sin(a*5)
 verts.append((cx+math.cos(a)*5.9*r,water_y,cz+math.sin(a)*8.8*r))
for i in range(64):faces.append((0,i+2,i+1))
mesh('Quiet pond surface',verts,faces,water)
reedmat=mat('Reed leaves',(.16,.19,.10,1));reedverts=[];reedfaces=[]
for k in range(7):
 a=k*2.4;xx=math.cos(a)*.22;zz=math.sin(a)*.22;hh=rnd(.7,1.5);n=len(reedverts)
 reedverts.extend([(xx-.018,0,zz),(xx+.018,0,zz),(xx+.11,hh,zz+.07),(xx+.07,hh,zz+.07)]);reedfaces.append((n,n+1,n+2,n+3))
reed=mesh('Reed template',reedverts,reedfaces,reedmat);COL.objects.unlink(reed)
for i in range(95):
 a=i/95*math.tau;r=rnd(1,1.17);x=cx+math.cos(a)*6.3*r;z=cz+math.sin(a)*9.4*r
 place(reed,'Reed margin',x,z,rnd(.7,1.2),sink=.05)
# A small jetty, entirely scenery; the optional walk remains on the bank.
jetty_y=gh(-18,-24)+.18
for i in range(13):
 x=-18-i*.32
 box('Jetty plank',(x,jetty_y,-24),(.29,.11,1.65),wood,.018)
for x in [-18,-20,-22]:
 for z in [-24.65,-23.35]:beam('Jetty pile',(x,gh(x,z)-.25,z),(x,jetty_y+.06,z),.075)
# Open clinker hull resting at the waterline, with ribs and a thwart.
bv=[];bf=[]
for row in range(4):
 t=row/3;rx=.32+t*.38;rz=1.65+t*.45
 for k in range(24):
  a=k/24*math.tau;bv.append((-25+math.cos(a)*rx,water_y-.18+t*.5,-26+math.sin(a)*rz))
for row in range(3):
 for k in range(24):
  a=row*24+k;b=row*24+(k+1)%24;bf.append((a,b,b+24,a+24))
boat=mesh('Moored wooden skiff',bv,bf,wood)
for p in boat.data.polygons:p.use_smooth=True
mod=boat.modifiers.new('Hull thickness','SOLIDIFY');mod.thickness=.045;apply(boat,mod)
box('Boat thwart',(-25,water_y+.28,-26),(1.25,.08,.28),wood,.02)
beam('Mooring line',(-22,jetty_y+.08,-24.65),(-24.8,water_y+.25,-27.7),.012,wood,5)

collection('13 · Village lanes and gardens')
# Gate remnants make the transition into the settlement distinct.
for side in [-1,1]:
 x=tx(42)+side*3.1;z=42;y=gh(x,z)
 for row in range(6):
  for k in range(2):box('Gate pier stone',(x+(k-.5)*.47,y+row*.28,z),(.46,.275,.72),stone,.045)
 box('Gate coping',(x,y+1.72,z), (1.12,.16,.9),stone,.055)
for x,z,length in [(-16,-37,9),(15,-42,11),(-8,-58,8),(-20,-6,7)]:
 for j in range(int(length/.65)):
  zz=z+j*.65;y=gh(x,zz)
  for row in range(2):box('Garden dry stone wall',(x+rnd(-.05,.05),y+.18+row*.29,zz),(.52,.28,.63),stone,.07)
# Small timber fences, garden rows and wood piles make the larger village inhabited.
for x,z in [(-18,-43),(16,-37),(-9,-51),(14,-55)]:
 for k in range(5):
  zz=z+k*.85;y=gh(x,zz);beam('Garden paling',(x,y-.12,zz),(x,y+.9,zz),.04)
 for side in [-1,1]:
  a=(x,gh(x,z)+(.32 if side<0 else .68),z);b=(x,gh(x,z+3.4)+(.32 if side<0 else .68),z+3.4);beam('Garden rail',a,b,.035)
 for k in range(10):
  px=x-1.1-(k%2)*.5;pz=z+(k//2)*.65;place(clump,'Garden herbs',px,pz,1.3)
 for k in range(9):
  xx=x+1.8+(k%3)*.25;zz=z+1;yy=gh(xx,zz)+.18+(k//3)*.22;beam('Seasoned firewood',(xx,yy,zz),(xx,yy,zz+.7),.12,bark)

collection('14 · Side-path lanterns')
def side_lantern(x,z):
 y=gh(x,z);h=2.4
 beam('Side-path lantern post',(x,y-.15,z),(x,y+h+.2,z),.075)
 beam('Side-path lantern arm',(x,y+h+.2,z),(x-.5,y+h+.2,z),.045)
 box('Side-path amber pane',(x-.5,y+h-.1,z),(.18,.32,.18),lightmat,.01)
 for yy in [h-.3,h+.1]:box('Side-path iron cap',(x-.5,y+yy,z),(.28,.05,.28),iron,.02)
 for dx in [-.12,.12]:
  for dz in [-.12,.12]:beam('Side-path lantern frame',(x-.5+dx,y+h-.29,z+dz),(x-.5+dx,y+h+.1,z+dz),.013,iron,5)
 pos=(x-.5,y+h-.1,z);empty('Side_path_lamp',pos,lamp=True,intensity=13);lamps.append(pos)
for b,zs in [(BRANCHES[0],[143,119]),(BRANCHES[1],[-15,-34])]:
 for z in zs:side_lantern(tx(z)+branch_offset(z,b)+2.0,z)
