"""Prepare the CC0 soundscape. Run with Python 3 and ffmpeg; downloads are checksum pinned."""
from array import array
import hashlib
import json
import math
from pathlib import Path
import subprocess
import urllib.request
import zipfile

HERE = Path(__file__).resolve().parent
CACHE = HERE / '.cache/soundscape'
OUT = HERE.parents[3] / 'public/prototype/hidden-village/assets/audio'
CACHE.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)

for source in json.loads((HERE / 'soundscape-sources.json').read_text()):
    suffix = '.zip' if source['name'] == 'kenney-impact-sounds' else '.mp3'
    path = CACHE / (source['name'] + suffix)
    if not path.exists():
        with urllib.request.urlopen(source['download'], timeout=45) as response:
            path.write_bytes(response.read())
    if hashlib.sha256(path.read_bytes()).hexdigest() != source['sha256']:
        raise ValueError(f'Checksum mismatch: {path}')

with zipfile.ZipFile(CACHE / 'kenney-impact-sounds.zip') as archive:
    for surface in ['grass', 'wood', 'concrete']:
        for n in range(4):
            name = f'Audio/footstep_{surface}_{n:03}.ogg'
            destination = CACHE / 'kenney' / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(archive.read(name))


def encode(name, source, filters, channels=2):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(source), '-filter_complex', filters,
                    '-map', '[out]', '-ar', '32000', '-ac', str(channels), '-codec:a', 'libmp3lame',
                    '-b:a', '112k' if channels == 2 else '80k', str(OUT / f'{name}.mp3')], check=True)


def loop(name, start, duration, fade, target, eq):
    # Rotate the head to the tail and overlap it there. The new endpoint meets
    # the new start in the original recording; there is no fade-to-silence seam.
    filters = (f'[0:a]atrim=start={start}:duration={duration},asetpts=PTS-STARTPTS,{eq},'
               f'loudnorm=I={target}:TP=-3:LRA=9,asplit=2[a][b];'
               f'[a]atrim=start={fade},asetpts=PTS-STARTPTS[body];'
               f'[b]atrim=end={fade},asetpts=PTS-STARTPTS[head];'
               f'[body][head]acrossfade=d={fade}:c1=tri:c2=tri[out]')
    encode(name, CACHE / f'{name}.mp3', filters)


loop('ridge-wind', 7, 40, 4, -24, 'highpass=f=95,lowpass=f=5200')
loop('stream', 3, 32, 3, -24, 'highpass=f=130,lowpass=f=5500')
loop('hushed-score', 5, 54, 7, -22, 'highpass=f=65,lowpass=f=4200')


def step(name, source, start=0, duration=.65):
    # RMS normalization is deterministic for very short one-shots, for which
    # integrated loudness measurement has an insufficient analysis window.
    treatment = (f'highpass=f=55,lowpass=f=6500,afade=t=in:d=0.008,'
                 f'afade=t=out:st={duration-.08}:d=0.08')
    pcm = subprocess.check_output(['ffmpeg', '-v', 'error', '-ss', str(start), '-t', str(duration),
                                   '-i', str(source), '-af', treatment, '-f', 'f32le', '-ac', '1', '-ar', '32000', '-'])
    samples = array('f', pcm)
    rms = math.sqrt(sum(x*x for x in samples) / len(samples))
    peak = max(abs(x) for x in samples)
    gain = min(10**(-23/20) / max(rms, .00001), .5 / max(peak, .00001))
    filters = (f'[0:a]atrim=start={start}:duration={duration},asetpts=PTS-STARTPTS,'
               f'{treatment},volume={gain}[out]')
    encode(name, source, filters, 1)


for surface, original in [('grass', 'grass'), ('wood', 'wood'), ('stone', 'concrete')]:
    for n in range(4):
        step(f'step-{surface}-{n+1}', CACHE / f'kenney/Audio/footstep_{original}_{n:03}.ogg')
for n, start in enumerate([.65, 1.40, 2.15, 2.80], 1):
    step(f'step-leaves-{n}', CACHE / 'forest-steps.mp3', start, .55)

print('Prepared 3 seamless beds and 16 footstep variations.')
