"""Check sampled runtime camera positions against the saved Blender terrain/bridge.
Pass a JSON array of {route,x,y,z} and an output report path after --.
"""
import bpy,json,sys
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from pathlib import Path
args=sys.argv[sys.argv.index('--')+1:]
verts=[];faces=[]
for o in bpy.context.scene.objects:
 if o.type!='MESH' or not (o.name.startswith('Landform') or o.name.startswith('Worn bridge deck')):continue
 start=len(verts);verts.extend(o.matrix_world@v.co for v in o.data.vertices)
 faces.extend(tuple(start+i for i in p.vertices) for p in o.data.polygons)
bvh=BVHTree.FromPolygons(verts,faces)
results={};outliers=[]
for p in json.loads(Path(args[0]).read_text()):
 # Foot-sized sample spans the intentionally open gaps between bridge planks.
 hits=[bvh.ray_cast(Vector((p['x']+dx,-p['z']+dz,100)),Vector((0,0,-1)))[0] for dx,dz in [(0,0),(.08,0),(-.08,0),(0,.08),(0,-.08)]]
 hit=max((h for h in hits if h is not None),key=lambda h:h.z,default=None)
 clearance=p['y']-hit.z if hit else None
 results.setdefault(p['route'],[]).append(clearance)
 if clearance is None or not 1.6<clearance<1.95:outliers.append(dict(**p,clearance=clearance))
report={'routes':{key:{'samples':len(values),'minClearance':min(v for v in values if v is not None),'maxClearance':max(v for v in values if v is not None)} for key,values in results.items()},'outliers':outliers,'unpackedImages':[im.name for im in bpy.data.images if im.source=='FILE' and not im.packed_file]}
# A chest/head-radius sweep catches cottages, fences and rocks crossing a branch.
verts=[];faces=[];names=[]
for o in bpy.context.scene.objects:
 if o.type!='MESH' or o.name.startswith(('Landform','Far spruce','Crown','Heather','Fern','Reed','Sparse birch','Garden herbs','Mountain','Western crown')):continue
 start=len(verts);verts.extend(o.matrix_world@v.co for v in o.data.vertices)
 for poly in o.data.polygons:faces.append(tuple(start+i for i in poly.vertices));names.append(o.name)
obstacles=BVHTree.FromPolygons(verts,faces);collisions=[]
for p in json.loads(Path(args[0]).read_text()):
 if p['route']=='both':continue
 for height in [1.0,1.76]:
  point=Vector((p['x'],-p['z'],p['y']-1.76+height))
  location,normal,index,distance=obstacles.find_nearest(point,.28)
  if location is not None:collisions.append(dict(route=p['route'],z=p['z'],object=names[index],distance=distance))
report['obstacleContacts']=collisions
Path(args[1]).write_text(json.dumps(report,indent=2));print('ROUTE_CHECK',json.dumps(report))
if outliers or collisions:raise RuntimeError('Route clearance needs inspection')
