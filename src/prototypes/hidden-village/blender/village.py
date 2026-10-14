"""Architecture kit. Executed inside build_scene.py so materials and metre coordinates agree."""
collection('07 · Village architecture')
# A packed glass atlas carries warm interior falloff and curtains, not a flat emissive rectangle.
ww=128;yy,xx=np.mgrid[0:ww,0:ww]/ww
falloff=np.clip(1-((xx-.49)**2*2+(yy-.45)**2*.8),.15,1)
curtains=1-.68*np.exp(-((xx-.13)/.11)**2)-.48*np.exp(-((xx-.9)/.09)**2)
glass=np.empty((ww,ww,4),dtype=np.float32)
for k,c in enumerate([.8,.35,.095]):glass[:,:,k]=c*falloff*curtains*(.94+.06*np.sin(yy*28+xx*12))
glass[:,:,3]=1
im=bpy.data.images.new('Warm interior glass',ww,ww,alpha=True);im.pixels.foreach_set(glass.ravel());im.file_format='PNG';im.filepath_raw=str(CACHE/'warm-glass.png');im.save()
windowmat=mat('Warm recessed windows',(.69,.32,.09,1),file=CACHE/'warm-glass.png',emission=1.15)
bs=windowmat.node_tree.nodes.get('Principled BSDF');tex=next(n for n in windowmat.node_tree.nodes if n.type=='TEX_IMAGE');windowmat.node_tree.links.new(tex.outputs['Color'],bs.inputs['Emission Color'])
shutter=mat('Oxide painted shutters',(.18,.075,.045,1))

def house(x,z,s=1,detail=True,workshop=False,last=False):
 before=set(COL.objects)
 y=gh(x,z)-.12;w=2.45;d=2.55;eaves=3.15;peak=5.55
 def P(a,b,c):return (x+a*s,y+b*s,z+c*s)
 def B(name,pos,size,m=wood,bev=.025):return box(name,P(*pos),tuple(v*s for v in size),m,bev*s)
 def E(name,a,b,r=.065,m=wood):return beam(name,P(*a),P(*b),r*s,m)
 # An actual gabled volume with softened plaster corners and a buried masonry plinth.
 verts=[P(a,b,c) for c in [-d,d] for a,b in [(-w,0),(w,0),(w,eaves),(0,peak),(-w,eaves)]]
 faces=[(4,3,2,1,0),(5,6,7,8,9),(0,1,6,5),(1,2,7,6),(2,3,8,7),(3,4,9,8),(4,0,5,9)]
 wall=mesh('Limewashed gabled shell',verts,faces,plaster)
 # Simple cube projection for plaster, with no stretched gable texture.
 uv=wall.data.uv_layers.new(name='UVMap')
 for f in wall.data.polygons:
  axis=max(range(3),key=lambda k:abs(f.normal[k]));axes=[k for k in range(3) if k!=axis]
  for li in f.loop_indices:
   v=wall.data.vertices[wall.data.loops[li].vertex_index].co;uv.data[li].uv=(v[axes[0]]*.45,v[axes[1]]*.45)
 mod=wall.modifiers.new('Soft lime corners','BEVEL');mod.width=.035*s;mod.segments=2;apply(wall,mod)
 # A plinth extends into the actual hillside at every corner, including distant cottages.
 corners=[(-2.5,-2.6),(2.5,-2.6),(2.5,2.6),(-2.5,2.6)]
 fv=[(x+a*s,min(y-.65*s,gh(x+a*s,z+c*s)-.22),z+c*s) for a,c in corners]+[P(a,.55,c) for a,c in corners]
 foundation=mesh('Masonry foundation',fv,[(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],stone)
 mod=foundation.modifiers.new('Weathered plinth edges','BEVEL');mod.width=.04*s;mod.segments=2;apply(foundation,mod)
 # Warped roof decks and overlapping, staggered shingle courses.
 rv=[];rf=[];ru=[]
 rows=10 if detail else 1;cols=14 if detail else 1
 for side in [-1,1]:
  for row in range(rows):
   for col in range(cols):
    r0=row/rows;r1=min(1,(row+1.18)/rows)
    f0=col/cols;f1=min(1,(col+1.07)/cols)
    xx0=side*r0*2.9;xx1=side*r1*2.9
    zz0=-3.0+f0*6;zz1=-3.0+f1*6
    jitter=rnd(-.022,.022) if detail else 0
    def roofy(xx,zz):return peak+.12-abs(xx)*.94-.08*math.cos(zz*.9)+jitter
    coords=[(xx0,roofy(xx0,zz0),zz0),(xx1,roofy(xx1,zz0),zz0),(xx1,roofy(xx1,zz1),zz1),(xx0,roofy(xx0,zz1),zz1)]
    a=len(rv);rv.extend(P(*v) for v in coords);rv.extend(P(v[0],v[1]-.045,v[2]) for v in coords)
    top=(a,a+3,a+2,a+1) if side==1 else (a,a+1,a+2,a+3)
    rf.extend([top,tuple(v+4 for v in reversed(top)),(a,a+1,a+5,a+4),(a+1,a+2,a+6,a+5),(a+2,a+3,a+7,a+6),(a+3,a,a+4,a+7)])
    ru.extend([(.215+(v[2]-zz0)/max(zz1-zz0,.01)*.025,v[0]*.45+col*.09) for v in coords]*2)
 mesh('Hand laid shingle roof',rv,rf,roofmat,ru)
 E('Ridge cap',(0,peak+.16,-3),(0,peak+.16,3),.095)
 for c in [-d-.04,d+.04]:
  for side in [-1,1]:
   E('Bargeboard',(0,peak+.1,c),(side*2.88,eaves-.17,c),.09)
   E('Corner oak post',(side*2.30,.2,c),(side*2.30,eaves,c),.09)
  E('Gable tie',(-2.4,eaves,c),(2.4,eaves,c),.085)
 if detail:
  for a in [-1.15,0,1.15]:E('Front timber stud',(a,.2,d+.055),(a,eaves,d+.055),.055)
  for side in [-1,1]:E('Gable diagonal',(side*2.1,eaves+.07,d+.08),(0,peak-.25,d+.08),.065)
  for xx in [-1.35,1.35]:
   B('Window recess',(xx,1.98,d+.035),(1.08,1.32,.08),iron,.015)
   B('Warm window',(xx,1.98,d+.085),(.84,1.1,.025),windowmat,.015)
   for dx in [-.49,0,.49]:B('Window mullion',(xx+dx,1.98,d+.14),(.055,1.28,.10),wood,.009)
   for hh in [1.36,1.98,2.6]:B('Window cross rail',(xx,hh,d+.14),(1.05,.06,.10),wood,.012)
   B('Rain sill',(xx,1.3,d+.23),(1.2,.10,.32),wood,.025)
   for side in [-1,1]:
    for board in range(3):B('Shutter board',(xx+side*(.61+board*.10),1.99,d+.075),(.095,1.25,.06),shutter if last else wood,.012)
  # Side casements and eaves keep the buildings legible from the continuing walk.
  for side in [-1,1]:
   B('Side eaves beam',(side*(w+.035),2.96,0),(.12,.15,5.1),wood,.025)
   for zz in [-1.15,1.15]:
    B('Side window recess',(side*(w+.025),1.94,zz),(.07,1.21,.96),iron,.015)
    B('Side amber pane',(side*(w+.07),1.94,zz),(.025,1.05,.80),windowmat,.012)
    for dz in [-.46,0,.46]:B('Side window frame',(side*(w+.12),1.94,zz+dz),(.11,1.21,.05),wood,.01)
    for hh in [1.35,1.94,2.53]:B('Side window rail',(side*(w+.12),hh,zz),(.11,.06,.98),wood,.01)
    B('Side stone sill',(side*(w+.18),1.30,zz),(.34,.10,1.1),stone,.025)
  for plank in range(6):B('Door plank',(-.44+plank*.176,1.15,d+.09),(.168,2.1,.10),wood,.012)
  for xx in [-.59,.59]:B('Door jamb',(xx,1.18,d+.19),(.13,2.22,.18),wood,.02)
  B('Door lintel',(0,2.32,d+.19),(1.3,.16,.20),wood,.025)
  for hh in [.55,1.75]:B('Iron door strap',(0,hh,d+.16),(.89,.052,.028),iron,.008)
  B('Door latch',(.33,1.2,d+.21),(.05,.19,.07),iron,.009)
  for k in range(3):B('Rounded threshold',(0,.08-k*.10,d+.35+k*.34),(1.65,.22,.65),stone,.055)
  # Chimney stone courses and projecting cap.
  for row in range(6):
   for k in range(2):B('Chimney stone',(1.1+(k-.5)*.34,4.72+row*.23,-.85),(.34,.225,.65),stone,.025)
  B('Chimney cap',(1.1,6.15,-.85),(.86,.15,.86),stone,.035)
  empty('House_light',P(0,2.05,d+.65),lamp=True,intensity=8)
  if last:
   # A smaller attic light under a protective gable gives the final house its own face.
   B('Attic opening',(0,4.18,d+.04),(.8,.95,.08),iron,.025)
   B('Attic glow',(0,4.18,d+.10),(.61,.76,.04),windowmat,.015)
   for dx in [-.38,0,.38]:B('Attic frame',(dx,4.18,d+.15),(.05,.93,.08),wood,.01)
   B('Attic sill',(0,3.68,d+.18),(.93,.12,.27),wood,.02)
  if workshop:
   for xx in [-2.1,2.1]:E('Workshop porch post',(xx,(gh(x+xx*s,z+4.15*s)-y)/s-.15,4.15),(xx,2.8,4.15),.10)
   E('Porch header',(-2.3,2.75,4.15),(2.3,2.75,4.15),.12)
   for i in range(17):
    xx=-2.56+i*.32
    b=B('Workshop canopy board',(xx,2.97,3.5),(.30,.10,2.25),roofmat,.018);b.rotation_euler.x=.16
   for xx in [-1.3,1.3]:
    for zz in [3.35,3.95]:
     bottom=(gh(x+xx*s,z+zz*s)-y)/s-.06
     B('Workbench leg',(xx,(bottom+1.0)*.5,zz),(.13,1.0-bottom,.13),wood,.02)
   for zz in [3.3,3.6,3.9]:B('Workbench plank',(0,1.05,zz),(3.0,.13,.28),wood,.025)
   B('Bench brace',(0,.36,3.65),(2.8,.10,.10),wood,.02)
   B('Iron bench vice',(.95,1.22,3.65),(.32,.20,.28),iron,.025)
   for i in range(5):B('Offcut',(-.55,1.15+i*.045,3.55),(.86-i*.1,.042,.24),wood,.012)
   for i in range(7):
    xx=-1.8+(i%3)*.26;hh=.2+(i//3)*.22
    E('Stacked firewood',(xx,hh,2.9),(xx,hh,3.6),.13,bark)
 else:
  for xx in [-1.15,1.15]:B('Distant warm window',(xx,1.8,d+.05),(.62,.85,.035),windowmat,.005)
 bpy.context.view_layer.update()
 root=empty(('Workshop' if workshop else 'Last light' if last else 'Cottage')+f' · {x}, {z}',(x,y,z))
 bpy.context.view_layer.update()
 for o in set(COL.objects)-before-{root}:
  matrix=o.matrix_world.copy();o.parent=root;o.matrix_world=matrix
 return y

# The hillside settlement is part of the ridge benchmark.
for x,z,s in [(21,-9,.8),(32,-24,.95),(39,-37,.9),(25,-48,.85),(44,-57,.75)]:house(x,z,s,False)
x,z=31,-49;y=gh(x,z)
box('Bell tower masonry',(x,y+5,z),(3,10,3),stone,.08)
verts=[(x+dx,y+10,z+dz) for dx,dz in [(-1.9,-1.9),(1.9,-1.9),(1.9,1.9),(-1.9,1.9)]]+[(x,y+16,z)]
mesh('Bell tower steep spire',verts,[(0,4,1),(1,4,2),(2,4,3),(3,4,0)],roofmat)
for xx in [-.68,.68]:box('Tower light',(x+xx,y+8.1,z+1.52),(.38,1.25,.04),windowmat,.07)
house(31,-53,1.25,False)

if opts.village:
 house(-6.8,22,1.05,True,workshop=True)
 house(6.9,0,1.12)
 house(-4,-23,.95)
 house(8.5,-20.5,.8)
 house(0,-76,1.2,last=True)
 for hx,hz,hs in [(-14,-43,1),(13,-35,.9),(-6,-51,.9),(11,-56,1),(-21,-12,.8)]:house(hx,hz,hs)
 # Stone well, with wedge-shaped masonry that reads as a circular wall rather than blocks.
 x,z=-3.9,-2;y=gh(x,z)
 for row in range(3):
  for i in range(14):
   a=(i+row*.5)*math.tau/14;span=math.tau/14*.92
   verts=[]
   for hh in [row*.24,(row+1)*.24-.015]:
    for r,ang in [(.78,a),(1.05,a),(1.05,a+span),(.78,a+span)]:verts.append((x+math.sin(ang)*r,y+hh,z+math.cos(ang)*r))
   o=mesh('Well wedge stone',verts,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],stone)
   mod=o.modifiers.new('Rounded well edges','BEVEL');mod.width=.035;mod.segments=2;apply(o,mod)
 for i in range(34):
  a=i*math.tau/17;r=1.3+(i//17)*.35
  px,pz=x+math.sin(a)*r,z+math.cos(a)*r
  o=place(rocks[i%6],'Well worn paving',px,pz,.18,rotation=a,sink=.025);o.scale.z*=.22
 box('Well interior',(x,y+.07,z),(1.45,.05,1.45),iron,.3)
 for dx in [-1.2,1.2]:beam('Well roof support',(x+dx,y-.1,z),(x+dx,y+2.7,z),.095)
 beam('Winding axle',(x-1.3,y+1.9,z),(x+1.3,y+1.9,z),.105)
 beam('Hemp well rope',(x,y+1.9,z),(x,y+.35,z),.014,wood,6)
 for side in [-1,1]:
  for i in range(9):
   zz=z-1.1+i*.27;b=box('Well roof plank',(x+side*.65,y+2.8,zz),(1.62,.1,.25),roofmat,.022);b.rotation_euler.y=side*.42
 for dx in [-1.2,1.2]:beam('Well gable',(x+dx,y+2.5,z+1.15),(x,y+3.12,z+1.15),.07)
 # Existing bench, built at comfortable human scale.
 x,z=4.2,-5;y=gh(x,z)
 for zz in [-.22,0,.22]:box('Bench seat plank',(x,y+.52,z+zz),(2.6,.1,.19),wood,.035)
 for xx in [-1.05,1.05]:
  for zz in [-.23,.23]:box('Bench leg',(x+xx,y+.25,z+zz),(.15,.65,.15),wood,.022)
  box('Bench back post',(x+xx,y+.77,z-.3),(.12,.68,.12),wood,.02)
 for yy in [.89,1.13]:box('Bench back rail',(x,y+yy,z-.3),(2.6,.19,.08),wood,.03)
 # Postbox remains at the route's final stopping point.
 x,z=1.8,-71.5;y=gh(x,z)
 box('Postbox post',(x,y+.72,z),(.16,1.6,.16),wood,.03)
 box('Postbox',(x,y+1.57,z),(.68,.53,.48),iron,.10)
 box('Postbox lid',(x,y+1.84,z),(.78,.08,.59),wood,.035)
 box('Letter slot',(x,y+1.63,z+.247),(.40,.035,.025),wood,.012)
