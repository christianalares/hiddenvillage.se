"""Terrain equations mirror trail.ts. Keep route clearance checks when changing either."""
BRANCHES=[(156,90,-85),(-4,-58,-78)]
WILDLIFE=[(12.5,141,-.85,1),(16,137,-.4,.88),(-110,118,1.1,1),(-100,-16,.6,.84)]
def branch_offset(z,b):
 start,end,off=b
 return off*math.sin(math.pi*(start-z)/(start-end))**2 if end<z<start else 0

def tx(z):
 return math.sin(z*.105)*.72-smooth((z-43)/44)*8+math.sin((z-22)*.14)*1.8*smooth((z-22)/18)+math.sin((z-110)*.055)*3*smooth((z-110)/18)-smooth((z-165)/35)*7+math.sin(max(0,min(1,(-z-12)/50))*math.pi)*6

def th(z):
 return smooth((z-22)/74)*10.5+12*smooth((z-100)/50)+16*smooth((z-155)/55)-2.8*smooth((-z-18)/44)+1.4*math.exp(-((z+28)/10)**2)

def raw_ground(x,z):
 off=x-tx(z);edge=smooth((abs(off)-2)/8);ridge=smooth((z-33)/30)
 bank=edge*(1.4+ridge*4.5) if off<0 else -edge*ridge*7
 uneven=edge*(math.sin(x*.38+z*.12)*.7+math.cos(z*.29)*.35)
 road=1-smooth((abs(off)-1.65)/.65)
 dip=smooth((z-50.51)/.7)*smooth((58.29-z)/.7)
 ravine=math.exp(-((z-54.5+math.sin(x*.12)*.8)/2.15)**2)*4.8*(1-road+road*dip)
 hill=math.exp(-((x-32)/17)**2-((z+46)/25)**2)*18*smooth((abs(off)-1.8)/6)
 pond=3.2*math.exp(-((x+25)/7)**4-((z+26)/11)**4)
 outer=smooth((abs(off)-27)/18)*(15*math.exp(-((x+93)/30)**2-((z-123)/33)**2)-5*math.exp(-((x+76)/27)**2-((z+30)/24)**2))
 return th(z)+bank+uneven-ravine+hill-pond+outer

def gh(x,z):
 y=raw_ground(x,z)
 for xx,zz,rot,scale in WILDLIFE:
  d=math.hypot(x-xx,z-zz);blend=1-smooth((d-2)/2)
  y+=(raw_ground(xx,zz)-y)*blend
 # Micro relief stays below 4 cm and fades out at wildlife hoof contact.
 micro=math.sin(x*2.6+z*.71)*math.sin(z*3.1-x*.4)*.035
 wildlife=min(smooth((math.hypot(x-xx,z-zz)-2)/2) for xx,zz,_,_ in WILDLIFE)
 return y+micro*wildlife

def path_distance(x,z):
 d=abs(x-tx(z))
 for b in BRANCHES:
  if b[1]<z<b[0]:
   slope=(tx(z+.1)+branch_offset(z+.1,b)-tx(z-.1)-branch_offset(z-.1,b))/.2
   d=min(d,abs(x-tx(z)-branch_offset(z,b))/math.sqrt(1+slope*slope))
 return d
