import * as THREE from 'three'
import { createLetter, pages } from './letters'
import { Inspection, letterEye } from './inspection'
import { WoodlandSound } from './sound'
export type DiscoveryAnchor = { id: string; position: THREE.Vector3 }
const about = [
  'Hi, I’m Christian. I build software, play drums, and have a habit of wondering whether there’s a better way to do things.',
  'I tend to build things I want to use myself. Something to keep track of an idea, make a fiddly task easier, or connect two things that should probably already talk to each other. Quite often, something starts with “I wish this existed” and turns into something I can’t leave alone.',
  'I care about how things feel to use. How they move, whether they make sense, and the little details you might only notice when something feels off. I enjoy figuring those things out, along with everything that needs to happen underneath.',
  'A lot of my curiosity goes into AI. I like connecting it to the tools I already use, trying things out, and seeing where an idea takes me.',
  'Home is Stockholm, where I live with my family. Music has always been a big part of my life. I’m a drummer and used to work as a music producer. I also love playing padel 🎾. There is, occasionally, a life away from the keyboard.',
  'Hidden Village is my little corner of the internet. Somewhere to make things, follow a few ideas, and take the occasional unnecessarily scenic route.',
  'Make yourself at home.',
]
const marked = ['making', 'curiosity', 'rhythm']
const storageKey = 'hidden-village-pages-v1'
export async function addStories(scene: THREE.Scene, anchors: DiscoveryAnchor[], inspection: Inspection, sound: WoodlandSound, onReading: (reading: boolean) => void, wake: () => void) {
  await document.fonts.load('54px Kalam')
  const dialog = document.getElementById('notebook') as HTMLDialogElement
  const content = document.getElementById('notebook-content')!
  const notesButton = document.getElementById('notes') as HTMLButtonElement
  const close = document.getElementById('close-notebook') as HTMLButtonElement
  const controls = document.getElementById('inspection-controls')!
  const back = document.getElementById('leave-inspection') as HTMLButtonElement
  const next = document.getElementById('turn-page') as HTMLButtonElement
  const listen = document.getElementById('listen') as HTMLButtonElement
  const unfold = document.getElementById('unfold') as HTMLButtonElement
  const transcript = document.getElementById('letter-transcript')!
  const found = new Set<string>()
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    if (Array.isArray(saved)) for (const id of saved) if (typeof id === 'string' && marked.includes(id)) found.add(id)
  } catch { /* Reading and finding work when optional browser storage is unavailable. */ }
  let opener: HTMLElement | null = null, active: string | null = null, sheet = 0
  const letters = anchors.filter(anchor => pages[anchor.id]).map(anchor => {
    const paper = createLetter(pages[anchor.id]); paper.mesh.position.copy(anchor.position).y -= .143
    scene.add(paper.mesh)
    return { ...anchor, paper }
  })
  function updateCount() { notesButton.textContent = `Field notes · ${found.size}/3`; notesButton.setAttribute('aria-label', `Field notes, ${found.size} of 3 compass marks found`); document.body.dataset.marks = String(found.size) }
  updateCount()
  function paragraph(text: string, className?: string) { const p = document.createElement('p'); p.textContent = text; if (className) p.className = className; content.append(p) }
  function heading(place: string, title: string) {
    content.replaceChildren(); paragraph(place, 'paper-eyebrow')
    const h = document.createElement('h2'); h.id='notebook-title'; h.textContent=title; content.append(h)
  }
  function contact() { const a = document.createElement('a'); a.href='mailto:christian@hiddenvillage.se';a.textContent='Write to Christian';content.append(a) }
  function show() {
    if (!dialog.open) { opener=document.activeElement as HTMLElement;onReading(true);dialog.showModal() }
    close.focus({preventScroll:true});dialog.scrollTop=0
  }
  function updatePaperControls() {
    if (!active) return
    const letter = letters.find(letter => letter.id === (active === 'letter' ? 'home' : active))!
    const page = pages[active]
    next.hidden = letter.paper.count < 2; next.textContent = `${sheet+1} / ${letter.paper.count} · Turn page ↻`
    listen.textContent = page.audio ? sound.voiceState === 'playing' || sound.voiceState === 'loading' ? 'Ⅱ Pause reading' : sound.voiceState === 'paused' ? '♫ Resume reading' : '♫ Listen to this' : '♫ Listen · coming soon'
    listen.setAttribute('aria-pressed', String(sound.voiceState === 'playing' || sound.voiceState === 'loading'))
    letter.paper.setVoiceState(sound.voiceState)
    listen.setAttribute('aria-disabled', String(!page.audio))
    unfold.hidden = active !== 'home' || found.size !== 3
    letter.paper.setUnfold(!unfold.hidden)
    letter.paper.draw(sheet)
    document.getElementById('letter-contact')!.hidden = !['home','letter'].includes(active)
    transcript.textContent = `${page.place}. ${page.title} ${page.paragraphs.join(' ')} ${page.hint ?? ''}`
  }
  sound.onVoiceChange(() => { if (active) { updatePaperControls(); wake() } })
  function read(id: string) {
    if (inspection.active) return
    const letter = letters.find(letter => letter.id === id)!
    active=id; sheet=0; opener=document.activeElement as HTMLElement
    letter.paper.prepare(pages[id]);letter.paper.draw(0)
    if (pages[id].mark) { found.add(id);try { localStorage.setItem(storageKey,JSON.stringify(Array.from(found))) } catch { /* Optional. */ } updateCount() }
    const point=letter.paper.mesh.position.clone()
    // Fit the actual sheet to the viewport, with room for its table and the controls.
    const eye=letterEye(point,innerWidth/innerHeight)
    controls.hidden=false; document.getElementById('letter-actions')!.hidden=false; document.getElementById('inspection-description')!.textContent=''
    inspection.open(`note:${id}`,point,eye);updatePaperControls();back.focus({preventScroll:true})
    void sound.listen(pages[id].audio,true)
  }
  next.addEventListener('click',()=>{
    if (!active) return
    const paper=letters.find(letter=>letter.id===(active==='letter'?'home':active))!.paper
    if(paper.animating||inspection.moving)return
    sheet=(sheet+1)%paper.count
    // Update the accessible controls now; the ink changes at the midpoint of the fold.
    next.textContent=`${sheet+1} / ${paper.count} · Turn page ↻`
    paper.turn(sheet,matchMedia('(prefers-reduced-motion: reduce)').matches);sound.page();wake()
  })
  listen.addEventListener('click',()=>{ if (active) void sound.listen(pages[active].audio) })
  unfold.addEventListener('click',()=>{
    sound.stopVoice()
    active='letter';sheet=0;const paper=letters.find(letter=>letter.id==='home')!.paper
    paper.prepare(pages.letter);document.body.dataset.letter='opened';updatePaperControls();paper.turn(0,matchMedia('(prefers-reduced-motion: reduce)').matches);sound.page();wake()
    void sound.listen(pages.letter.audio,true)
  })
  function leave() { if (!inspection.active) return; sound.stopVoice(); controls.hidden=true;active=null;inspection.close(); controls.querySelectorAll<HTMLElement>('button,a').forEach(el=>el.removeAttribute('style')) }
  back.addEventListener('click',leave)
  window.addEventListener('keydown',event=>{
    if (!inspection.active) return
    if (event.key==='Escape') { event.preventDefault();leave() }
    // Keep keyboard focus in the reading controls while the camera is at the table.
    if (event.key==='Tab') {
      const focusable=[...Array.from(document.querySelectorAll<HTMLElement>('#drum-parts button:not([hidden])')), ...Array.from(controls.querySelectorAll<HTMLElement>('button:not([hidden]),a:not([hidden])')), document.getElementById('sound')!].filter(el=>el.offsetParent!==null)
      const first=focusable[0],last=focusable[focusable.length-1]
      if (event.shiftKey && document.activeElement===first) { event.preventDefault();last.focus() }
      else if (!event.shiftKey && document.activeElement===last) { event.preventDefault();first.focus() }
    }
  })
  notesButton.addEventListener('click',()=>{
    heading('NOTES FROM YOUR WALK','Three traces of the same person.')
    paragraph('A missing thing. A question. A rhythm. The marks meet at the last light.')
    for (const id of marked) paragraph(found.has(id) ? `${pages[id].mark}  ${pages[id].title}` : id==='making' ? '○  The workshop keeps its door open.' : id==='curiosity' ? '○  The ridge holds a question.' : '○  The hollow remembers a rhythm.',found.has(id)?'paper-stamp':'missing-page')
    paragraph(found.size===3?'All three marks. Bring them to the last light.':'The waypoints can bring you back to a path you missed.','paper-aside')
    paragraph('Your marks stay in this browser. Nothing is sent anywhere.','paper-footnote');const credits=document.createElement('a');credits.href='/prototype/hidden-village/assets/credits.txt';credits.textContent='World credits';credits.target='_blank';credits.rel='noopener';content.append(credits);show()
  })
  document.getElementById('about')!.addEventListener('click',()=>{heading('A LITTLE ABOUT ME','Hi, I’m Christian.');about.forEach(text=>paragraph(text));contact();show()})
  close.addEventListener('click',()=>dialog.close())
  dialog.addEventListener('close',()=>{onReading(false);opener?.focus({preventScroll:true})})
  const projected=new THREE.Vector3()
  const buttons=letters.map(anchor=>{
    const button=document.createElement('button');button.className='discovery-hit';button.hidden=true;button.textContent='✧ Read letter'
    button.setAttribute('aria-label',`Read ${pages[anchor.id].title}`);button.addEventListener('click',()=>read(anchor.id));document.getElementById('discoveries')!.append(button)
    return {...anchor,button}
  })
  return {
    get reading() { return dialog.open },
    get animating() { return letters.some(letter=>letter.paper.animating) },
    focus(camera: THREE.Camera, look: THREE.Vector3, z: number, choices: {ridge:boolean;pond:boolean}) {
      const anchor=anchors.find(a=>(a.id==='curiosity'?choices.ridge:a.id==='rhythm'?choices.pond:true)&&Math.abs(z-a.position.z-2)<(a.id==='rhythm'||a.id==='curiosity'?6:7))
      if (!anchor || camera.position.distanceTo(anchor.position)>21) return
      const range=anchor.id==='rhythm'||anchor.id==='curiosity'?6:7,distance=(z-anchor.position.z-2)/range
      const weight=(innerWidth<640?.97:.7)*Math.pow(Math.max(0,1-distance*distance),2)
      const normal=look.clone().sub(camera.position).normalize()
      normal.lerp(anchor.position.clone().add(new THREE.Vector3(0,.5,0)).sub(camera.position).normalize(),weight).normalize();look.copy(camera.position).addScaledVector(normal,7)
    },
    update(camera: THREE.Camera, blocked: boolean, delta: number, reducedMotion: boolean) {
      camera.updateMatrixWorld();let visibleId=''
      for(const letter of letters)letter.paper.update(delta,reducedMotion)
      if(active){
        const letter=letters.find(letter=>letter.id===(active==='letter'?'home':active))!
        letter.paper.mesh.updateMatrixWorld()
        const targets={back,next,listen,unfold,contact:document.getElementById('letter-contact')!}
        for(const [name,rect] of Object.entries(letter.paper.regions)){
          const el=targets[name as keyof typeof targets], [x,y,w,h]=rect
          const points=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([px,py])=>new THREE.Vector3((px/1024-.5)*.66,(.5-py/1280)*.825,.002).applyMatrix4(letter.paper.mesh.matrixWorld).project(camera))
          const xs=points.map(p=>(p.x+1)*innerWidth/2),ys=points.map(p=>(1-p.y)*innerHeight/2)
          Object.assign(el.style,{left:`${Math.min(...xs)}px`,top:`${Math.min(...ys)}px`,width:`${Math.max(44,Math.max(...xs)-Math.min(...xs))}px`,height:`${Math.max(44,Math.max(...ys)-Math.min(...ys))}px`,visibility:'visible',pointerEvents:letter.paper.animating||inspection.moving?'none':'auto',opacity:letter.paper.animating||inspection.moving?'0':'1'})
        }
      }
      for (const anchor of buttons) {
        projected.copy(anchor.position).project(camera)
        const visible=!blocked&&!dialog.open&&!inspection.active&&camera.position.distanceTo(anchor.position)<19&&projected.z<1&&Math.abs(projected.x)<.86&&Math.abs(projected.y)<.72
        anchor.button.hidden=!visible
        if(visible) {visibleId=anchor.id;anchor.button.style.left=`${(projected.x+1)*innerWidth/2}px`;anchor.button.style.top=`${(1-projected.y)*innerHeight/2}px`}
      }
      document.body.dataset.discovery=visibleId
    },
  }
}
