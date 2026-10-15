import * as THREE from 'three'
import { Inspection } from './inspection'
import { WoodlandSound } from './sound'
export type Inspectable = { id: string; position: THREE.Vector3; eye: THREE.Vector3; target: THREE.Vector3 }
export function addInspectables(anchors: Inspectable[], inspection: Inspection, sound: WoodlandSound) {
  const labels: Record<string,string>={telescope:'Look through the telescope',drums:'Step into the music room',court:'Explore the blue court',well:'Look into the well'}
  const controls=document.getElementById('inspection-controls')!
  const drum=document.getElementById('play-drum') as HTMLButtonElement
  drum.addEventListener('click',()=>sound.drum())
  const projected=new THREE.Vector3()
  const targets=anchors.map(anchor=>{
    const button=document.createElement('button');button.className='discovery-hit object-hit';button.textContent=labels[anchor.id];button.hidden=true
    button.addEventListener('click',()=>{
      if(inspection.active)return
      document.getElementById('letter-actions')!.hidden=true;controls.hidden=false;drum.hidden=anchor.id!=='drums'
      document.getElementById('inspection-description')!.textContent=anchor.id==='telescope'?'Three lights in the old tower. Someone left them burning.':anchor.id==='court'?'The blue is still there, beneath the years.':''
      inspection.open(anchor.id,anchor.target,anchor.eye,anchor.id==='telescope'?13:61)
      document.getElementById('leave-inspection')!.focus({preventScroll:true})
    });document.getElementById('discoveries')!.append(button);return {...anchor,button}
  })
  return (camera:THREE.Camera,blocked:boolean)=>{
    for(const anchor of targets){
      projected.copy(anchor.position).project(camera)
      const visible=!blocked&&!inspection.active&&camera.position.distanceTo(anchor.position)<(anchor.id==='court'?26:20)&&projected.z<1&&Math.abs(projected.x)<.86&&Math.abs(projected.y)<.7
      anchor.button.hidden=!visible
      if(visible){anchor.button.style.left=`${(projected.x+1)*innerWidth/2}px`;anchor.button.style.top=`${(1-projected.y)*innerHeight/2-30}px`}
    }
  }
}
