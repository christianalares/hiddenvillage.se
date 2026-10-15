"""Prepare licensed field recordings and acoustic hits. Sources/licenses are in ATTRIBUTION.md."""
from pathlib import Path
import subprocess
HERE=Path(__file__).resolve().parent;src=HERE/'.cache/research';out=HERE.parents[3]/'public/prototype/hidden-village/assets/audio';out.mkdir(parents=True,exist_ok=True)
parts={'kick':'kick_OH_F','snare':'snare_OH_MP','hihat':'hihatClosed_OH_F','crash':'crash1_OH_FF','ride':'ride1_OH_MP','rack-tom':'hiTom_OH_F','floor-tom':'loTom_OH_MP'}
for name,stem in parts.items():
 for i in [1,2]:
  subprocess.run(['ffmpeg','-y','-v','error','-i',str(src/'salamander-selected'/f'{stem}_{i}.wav'),'-af','silenceremove=start_periods=1:start_duration=0:start_threshold=-55dB,afade=t=out:st=4.5:d=0.4','-t','4.9','-ar','44100','-ac','1','-codec:a','libmp3lame','-b:a','128k',str(out/f'{name}-{i}.mp3')],check=True)
for name,duration,level in [('page-turn',2,.8),('owl',6,.8),('wood-creak',4,.6)]:
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(src/f'{name}.mp3'),'-t',str(duration),'-af',f'volume={level},afade=t=out:st={duration-.5}:d=0.5','-ac','1','-ar','44100','-codec:a','libmp3lame','-b:a','96k',str(out/f'{name}.mp3')],check=True)
subprocess.run(['ffmpeg','-y','-v','error','-i',str(src/'woodland-wind.mp3'),'-filter_complex','[0:a]atrim=start=10:end=40,asetpts=PTS-STARTPTS,asplit=2[a][b];[a]atrim=start=2:end=30,asetpts=PTS-STARTPTS[a1];[b]atrim=start=0:end=2,asetpts=PTS-STARTPTS[b1];[a1][b1]acrossfade=d=2:c1=tri:c2=tri,volume=0.7,alimiter=limit=0.7[out]','-map','[out]','-ac','2','-ar','44100','-codec:a','libmp3lame','-b:a','128k',str(out/'woodland.mp3')],check=True)
