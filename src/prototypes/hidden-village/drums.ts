import * as THREE from 'three'
import { Inspection } from './inspection'
import { DrumPart, WoodlandSound } from './sound'
const names:Record<DrumPart,string>={'kick':'Kick','snare':'Snare','rack-tom':'Hanging tom','floor-tom':'Floor tom','hihat':'Hi-hat','crash':'Crash','ride':'Ride'}
/** Raycast the actual artist meshes. Keyboard targets project onto the same physical instruments. */
export function addPlayableDrums(parts:THREE.Object3D[],camera:THREE.Camera,canvas:HTMLCanvasElement,inspection:Inspection,sound:WoodlandSound,wake:()=>void){
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),point=new THREE.Vector3()
  const controls=document.getElementById('drum-parts')!
  const entries=parts.map(root=>{
    const name=root.userData.drumPart as DrumPart,button=document.createElement('button')
    button.className='drum-part-hit';button.setAttribute('aria-label',`Play ${names[name]}`);button.textContent=names[name];button.hidden=true
    controls.append(button)
    const entry={root,name,button,rest:root.position.clone(),elapsed:1}
    button.addEventListener('click',()=>strike(entry));return entry
  })
  function strike(entry:typeof entries[number]){entry.elapsed=0;void sound.drum(entry.name);document.body.dataset.drumHit=entry.name;wake()}
  function pick(event:PointerEvent){
    pointer.set(event.clientX/innerWidth*2-1,1-event.clientY/innerHeight*2);ray.setFromCamera(pointer,camera)
    const hit=ray.intersectObjects(parts,true)[0]
    if(!hit)return null
    let node:THREE.Object3D|null=hit.object
    while(node&&!parts.includes(node))node=node.parent
    return entries.find(entry=>entry.root===node)??null
  }
  canvas.addEventListener('pointerdown',event=>{if(inspection.key!=='drums'||inspection.moving||event.button!==0)return;const entry=pick(event);if(entry){event.preventDefault();strike(entry)}})
  canvas.addEventListener('pointermove',event=>{if(inspection.key==='drums'&&!inspection.moving)canvas.style.cursor=pick(event)?'pointer':'default'})
  return {get animating(){return entries.some(entry=>entry.elapsed<1)},update(delta:number,reducedMotion:boolean){
    const active=inspection.key==='drums'&&!inspection.moving
    for(const entry of entries){
      entry.button.hidden=!active
      if(active){point.fromArray(entry.root.userData.strike).project(camera);entry.button.style.left=`${(point.x+1)*innerWidth/2}px`;entry.button.style.top=`${(1-point.y)*innerHeight/2}px`}
      entry.elapsed=Math.min(1,entry.elapsed+delta*2.5)
      entry.root.position.copy(entry.rest)
      if(entry.elapsed<1&&!reducedMotion){const t=entry.elapsed;entry.root.position.y+=Math.sin(t*Math.PI*7)*Math.exp(-t*7)*(entry.name==='crash'||entry.name==='ride'?.022:.007)}
    }
    if(inspection.key!=='drums')canvas.style.cursor=''
  }}
}
