"""Fetch the pinned CC0 sources, with checksums. No account or API key required."""
import argparse, concurrent.futures, hashlib, json, subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
p=argparse.ArgumentParser();p.add_argument('--cache',default=str(HERE/'.cache'));args=p.parse_args()
cache=Path(args.cache)
def fetch(asset):
 path=(ROOT/'public/prototype/hidden-village/assets'/asset['runtime']) if asset.get('runtime') else cache/asset['path']
 path.parent.mkdir(parents=True,exist_ok=True)
 if not path.exists() or hashlib.md5(path.read_bytes()).hexdigest()!=asset['md5']:
  subprocess.run(['curl','--fail','--silent','--show-error','--location','--retry','3',asset['url'],'--output',str(path)],check=True)
 if hashlib.md5(path.read_bytes()).hexdigest()!=asset['md5']:raise RuntimeError('Source checksum mismatch: '+asset['path'])
 return asset['path']
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  for path in pool.map(fetch,json.loads((HERE/'sources.json').read_text())):print('Verified',path)
