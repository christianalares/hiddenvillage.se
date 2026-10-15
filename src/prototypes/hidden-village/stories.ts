import * as THREE from 'three'

export type DiscoveryAnchor = { id: string; position: THREE.Vector3 }
type Page = { title: string; place: string; paragraphs: string[]; mark?: string; hint?: string }
const pages: Record<string, Page> = {
  invitation: {
    title: 'You found the way in.', place: 'A NOTE AT THE EDGE OF THE WOODS',
    paragraphs: ['Hi, I’m Christian. I build software, play drums, and have a habit of wondering whether there’s a better way to do things.', 'Hidden Village is my little corner of the internet. Somewhere to make things, follow a few ideas, and take the occasional unnecessarily scenic route.', 'I’ve left three marked pages around here. One where ideas begin, one where the wind is strongest, and one where it gets a little louder. Find them if you feel like taking the long way. There’s a letter waiting at the last light.'],
    hint: 'Look for the small compass marks. Nothing here is timed. You can always wander back.',
  },
  making: {
    title: 'I wish this existed.', place: 'THE WORKSHOP NOTEBOOK', mark: '✳',
    paragraphs: ['I tend to build things I want to use myself. Something to keep track of an idea, make a fiddly task easier, or connect two things that should probably already talk to each other.', 'Quite often, something starts with “I wish this existed” and turns into something I can’t leave alone.', 'I care about how things feel to use. How they move, whether they make sense, and the little details you might only notice when something feels off. I enjoy figuring those things out, along with everything that needs to happen underneath.'],
    hint: 'A compass mark is pressed into the corner. Another page is somewhere above the trees.',
  },
  curiosity: {
    title: 'What if these connected?', place: 'FIELD NOTES FROM THE RIDGE', mark: '⌁',
    paragraphs: ['A lot of my curiosity goes into AI. I like connecting it to the tools I already use, trying things out, and seeing where an idea takes me.', 'Quite often, something starts with “I wish this existed” and turns into something I can’t leave alone.'],
    hint: 'A second kind of compass mark. Down in the hollow, someone has left the music room open.',
  },
  rhythm: {
    title: 'Away from the keyboard.', place: 'A PAGE BESIDE THE RECORDS', mark: '≋',
    paragraphs: ['Music has always been a big part of my life. I’m a drummer and used to work as a music producer.', 'I also love playing padel 🎾. There is, occasionally, a life away from the keyboard.'],
    hint: 'The last kind of mark. The three belong together at the house with the last light.',
  },
  home: {
    title: 'My little corner of the internet.', place: 'A POSTCARD FROM HOME',
    paragraphs: ['Home is Stockholm, where I live with my family.', 'Hidden Village is my little corner of the internet. Somewhere to make things, follow a few ideas, and take the occasional unnecessarily scenic route.', 'Make yourself at home.'],
    hint: 'There’s a folded letter here, addressed to whoever finds all three marked pages.',
  },
}
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
export function addStories(anchors: DiscoveryAnchor[], onReading: (reading: boolean) => void) {
  const dialog = document.getElementById('notebook') as HTMLDialogElement
  const content = document.getElementById('notebook-content')!
  const notesButton = document.getElementById('notes') as HTMLButtonElement
  const close = document.getElementById('close-notebook') as HTMLButtonElement
  const found = new Set<string>()
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    if (Array.isArray(saved)) for (const id of saved) if (typeof id === 'string' && marked.includes(id)) found.add(id)
  } catch { /* Storage can be unavailable in private browsing. The walk still works. */ }
  let opener: HTMLElement | null = null
  let active: string | null = null
  function updateCount() {
    notesButton.textContent = `Field notes · ${found.size}/3`
    notesButton.setAttribute('aria-label', `Field notes, ${found.size} of 3 compass marks found`)
    document.body.dataset.marks = String(found.size)
  }
  updateCount()
  function paragraph(text: string, className?: string) {
    const p = document.createElement('p'); p.textContent = text
    if (className) p.className = className
    content.append(p)
  }
  function heading(place: string, title: string) {
    content.replaceChildren()
    paragraph(place, 'paper-eyebrow')
    const h = document.createElement('h2'); h.id = 'notebook-title'; h.textContent = title; content.append(h)
  }
  function contact() {
    const a = document.createElement('a'); a.href = 'mailto:christian@hiddenvillage.se'; a.textContent = 'Write to Christian'; content.append(a)
  }
  function show() {
    if (!dialog.open) {
      opener = document.activeElement as HTMLElement
      onReading(true)
      dialog.showModal()
    }
    close.focus({ preventScroll: true })
    dialog.scrollTop = 0
  }
  function read(id: string) {
    const page = pages[id]
    if (!page) return
    if (page.mark) {
      found.add(id)
      try { localStorage.setItem(storageKey, JSON.stringify(Array.from(found))) } catch { /* Optional persistence. */ }
      updateCount()
    }
    heading(page.place, page.title)
    page.paragraphs.forEach(text => paragraph(text))
    if (page.mark) paragraph(`${page.mark}  Compass mark copied into your field notes.`, 'paper-stamp')
    if (page.hint) paragraph(page.hint, 'paper-aside')
    if (id === 'home') {
      if (found.size === 3) {
        const open = document.createElement('button'); open.className = 'paper-action'; open.textContent = 'Match the three marks and unfold the letter'
        open.addEventListener('click', () => {
          heading('✳  ⌁  ≋     TO THE PERSON WHO TOOK THE LONG WAY', 'Make yourself at home.')
          paragraph('You found the workshop, the ridge and the music room. A few different parts of the same person.')
          paragraph('Thanks for spending a little time in my corner of the internet. I hope something here made you curious. If it did, I’d love to hear about it.')
          paragraph('Christian', 'paper-signature'); contact()
          document.body.dataset.letter = 'opened'
          show()
        }); content.append(open)
      } else paragraph(`${found.size} of 3 marks found. The ridge, the workshop and the music room each hold a page.`, 'paper-stamp')
      contact()
    }
    show()
  }
  function journal() {
    heading('NOTES FROM YOUR WALK', 'A few things left behind.')
    paragraph('Three marked pages, tucked into the places where I spend my time. Follow the long paths if you feel like looking.')
    for (const id of marked) {
      const page = pages[id]
      if (found.has(id)) {
        const button = document.createElement('button'); button.className = 'journal-entry'; button.textContent = `${page.mark}  ${page.title}`; button.addEventListener('click', () => read(id)); content.append(button)
      } else paragraph(id === 'making' ? '○  Where ideas begin. Look beside the workshop.' : id === 'curiosity' ? '○  Where the wind is strongest. Take Heather ridge.' : '○  Where it gets a little louder. Take the path towards Reed pond.', 'missing-page')
    }
    if (found.size === 3) paragraph('All three marks. Bring them to the postcard at the last light.', 'paper-stamp')
    paragraph('Your marks stay in this browser. Nothing is sent anywhere.', 'paper-footnote')
    show()
  }
  notesButton.addEventListener('click', journal)
  document.getElementById('about')!.addEventListener('click', () => {
    heading('A LITTLE ABOUT ME', 'Hi, I’m Christian.')
    about.forEach(text => paragraph(text)); contact(); show()
  })
  close.addEventListener('click', () => dialog.close())
  dialog.addEventListener('close', () => { onReading(false); opener?.focus({ preventScroll: true }) })
  const projected = new THREE.Vector3()
  const buttons = anchors.map(anchor => {
    const button = document.createElement('button')
    button.className = 'discovery-hit'; button.hidden = true
    button.textContent = '✧ Read note'
    button.setAttribute('aria-label', `Read ${pages[anchor.id]?.title ?? 'note'}`)
    button.addEventListener('click', () => read(anchor.id))
    document.getElementById('discoveries')!.append(button)
    return { ...anchor, button }
  })
  return {
    get reading() { return dialog.open },
    focus(camera: THREE.Camera, look: THREE.Vector3, z: number, choices: { ridge: boolean; pond: boolean }) {
      const anchor = anchors.find(a => (a.id === 'curiosity' ? choices.ridge : a.id === 'rhythm' ? choices.pond : true)
        && Math.abs(z - a.position.z - 2) < (a.id === 'rhythm' || a.id === 'curiosity' ? 6 : 7))
      if (!anchor || camera.position.distanceTo(anchor.position) > 21) return
      const range = anchor.id === 'rhythm' || anchor.id === 'curiosity' ? 6 : 7
      const distance = (z - anchor.position.z - 2) / range
      const weight = (window.innerWidth < 640 ? .97 : .7) * Math.pow(Math.max(0, 1 - distance * distance), 2)
      const normal = look.clone().sub(camera.position).normalize()
      normal.lerp(anchor.position.clone().add(new THREE.Vector3(0, .5, 0)).sub(camera.position).normalize(), weight).normalize()
      look.copy(camera.position).addScaledVector(normal, 7)
    },
    update(camera: THREE.Camera, blocked: boolean) {
      camera.updateMatrixWorld()
      active = null
      for (const anchor of buttons) {
        projected.copy(anchor.position).project(camera)
        const visible = !blocked && !dialog.open && camera.position.distanceTo(anchor.position) < 19 && projected.z < 1 && Math.abs(projected.x) < .86 && Math.abs(projected.y) < .72
        anchor.button.hidden = !visible
        if (visible) {
          active = anchor.id
          anchor.button.style.left = `${(projected.x + 1) * window.innerWidth / 2}px`
          anchor.button.style.top = `${(1 - projected.y) * window.innerHeight / 2}px`
        }
      }
      document.body.dataset.discovery = active ?? ''
    },
  }
}
