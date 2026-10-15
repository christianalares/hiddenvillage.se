import * as THREE from 'three'
export type Page = { title: string; place: string; paragraphs: string[]; mark?: string; hint?: string; audio?: string }
export const pages: Record<string, Page> = {
  invitation: {
    title: 'For the one who wandered in.', place: 'AT THE EDGE OF THE WOODS',
    paragraphs: ['Hi, I’m Christian. You found my little corner of the internet.', 'Some of me is scattered here. A thing that did not exist. A question without an answer. A rhythm that followed me home.', 'Three marks. Three places. Gather them if you like. The last light has a letter for you.'],
    hint: 'Begin where the wind has nothing left to lean against.',
  },
  making: {
    title: 'It began with a missing thing.', place: 'FROM THE WORKSHOP', mark: '✳',
    paragraphs: ['A task with too many steps. An idea with nowhere to stay. Two things that ought to speak.', 'That is usually how I begin building software. I make the thing I wish I had, then keep returning to the parts that do not feel quite right.', 'The small details leave the longest shadows.'],
    hint: 'Keep this mark. Another waits above the trees.',
  },
  curiosity: {
    title: 'What passes between things?', place: 'A QUESTION FROM THE RIDGE', mark: '⌁',
    paragraphs: ['A lot of my curiosity goes into AI. I keep joining it to the tools around me, wondering what might happen between them.', 'Sometimes a useful answer. Sometimes a better question. Both are reasons to leave the notebook open.'],
    hint: 'Look through the brass eye. Then seek the room that remembers a rhythm.',
  },
  rhythm: {
    title: 'The room remembers.', place: 'BESIDE THE RECORDS', mark: '≋',
    paragraphs: ['Before these keys, there were others. I used to produce music. I still play drums. Some habits keep their own time.', 'Beyond this room, the blue court is slowly returning to the woods. I love a game of padel 🎾. Mine are usually on less overgrown courts.'],
    hint: 'Three marks belong together. Carry them to the last light.',
  },
  home: {
    title: 'A light left on.', place: 'THE LAST HOUSE',
    paragraphs: ['Home is Stockholm, with my family. This is another sort of home. My little corner of the internet.', 'The paths bend. The work is rarely finished. There is usually something I meant to come back to.', 'If you found a little of me along the way, the place is doing its job. Make yourself at home.'],
    hint: 'Three marks open the folded letter beneath this one.',
  },
  letter: {
    title: 'You took the long way.', place: '✳   ⌁   ≋',
    paragraphs: ['A missing thing, a question, a rhythm. A few parts of the same person.', 'Thank you for spending a little time here. I hope you found something that made you curious.', 'You know where to find me. Leave a word if you like.\nChristian'],
  },
}

/** Handwritten ink on a physical, slightly worn sheet. Text remains real and accessible. */
export function createLetter(page: Page) {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1280
  const ctx = canvas.getContext('2d')!
  const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4
  const material = new THREE.MeshBasicMaterial({ map, transparent: false, alphaTest: .5, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, side: THREE.DoubleSide })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(.66, .825, 32, 20), material); mesh.rotation.x = -Math.PI / 2
  const rest = mesh.geometry.attributes.position.array.slice() as Float32Array
  const curlShade={value:0}
  material.onBeforeCompile=shader=>{
    shader.uniforms.curlShade=curlShade
    shader.fragmentShader='uniform float curlShade;\n'+shader.fragmentShader
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb *= 1.0 - sin(vMapUv.x * 3.14159) * curlShade * .22;')
  }
  let fold = 1, pendingSheet = 0, switched = true, canUnfold = false
  const regions = { back: [770, 18, 225, 130], next: [610, 1125, 390, 125], listen: [45, 1125, 560, 125], unfold: [70, 1030, 590, 110], contact: [700, 1030, 290, 110] }
  let sheets: string[][] = []
  function wrap(text: string) {
    ctx.font = '54px Kalam, cursive'
    const lines: string[] = []
    for (const paragraph of text.split('\n')) {
      let line = ''
      for (const word of paragraph.split(' ')) {
        if (ctx.measureText(`${line} ${word}`).width > 844 && line) { lines.push(line); line = word }
        else line += (line ? ' ' : '') + word
      }
      lines.push(line)
    }
    return lines
  }
  function prepare(next: Page) {
    page = next; sheets = [[]]
    for (const paragraph of [...page.paragraphs, ...(page.hint ? [page.hint] : [])]) {
      const lines = wrap(paragraph)
      // Keep a paragraph together whenever it fits on a sheet.
      if (lines.length <= 11 && sheets[sheets.length - 1].length + lines.length > 11) sheets.push([])
      for (const line of [...lines, '']) {
        if (sheets[sheets.length - 1].length >= 11) sheets.push([])
        sheets[sheets.length - 1].push(line)
      }
    }
    if (sheets[sheets.length - 1].every(line => !line)) sheets.pop()
  }
  function draw(index: number) {
    ctx.clearRect(0, 0, 1024, 1280)
    // Deterministic fibres, water rings and irregular edges, generated once per page change.
    let seed = 9183; const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
    ctx.save(); ctx.beginPath(); ctx.moveTo(20, 17)
    for (let x = 20; x <= 1004; x += 12) ctx.lineTo(x, 16 + rand() * 5)
    for (let y = 20; y <= 1260; y += 12) ctx.lineTo(1005 - rand() * 5, y)
    for (let x = 1004; x >= 20; x -= 12) ctx.lineTo(x, 1263 - rand() * 5)
    for (let y = 1260; y >= 20; y -= 12) ctx.lineTo(16 + rand() * 5, y)
    ctx.closePath(); ctx.clip()
    const wash = ctx.createRadialGradient(480, 570, 100, 512, 640, 820)
    wash.addColorStop(0, '#e9d8af'); wash.addColorStop(.7, '#ddc99e'); wash.addColorStop(1, '#9c7548')
    ctx.fillStyle = wash; ctx.fillRect(0,0,1024,1280)
    for (let i=0;i<22000;i++) { ctx.fillStyle = `rgba(${rand()>.5?'255,249,224':'100,70,36'},${rand()*.08})`;ctx.fillRect(rand()*1024,rand()*1280,rand()*3+1,rand()*2+1) }
    ctx.strokeStyle = '#7a502912';ctx.lineWidth = 5;ctx.beginPath();ctx.ellipse(988,1025,115,138,.2,0,Math.PI*2);ctx.stroke()
    ctx.strokeStyle='#7e5c2420';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(20,650);ctx.bezierCurveTo(300,633,730,671,1005,647);ctx.stroke()
    ctx.fillStyle='#49331e';ctx.font='30px Kalam, cursive';ctx.fillText(page.place,88,92,650)
    ctx.font='44px Kalam, cursive';ctx.textAlign='right';ctx.fillText('Close ×',938,85);ctx.textAlign='left'
    ctx.font='64px Kalam, cursive'
    // A short second line preserves the handwriting rather than squeezing long titles.
    const words = page.title.split(' '); let title = '', titleY = 190
    for (const word of words) {
      if (ctx.measureText(`${title} ${word}`).width > 850 && title) { ctx.fillText(title,86,titleY); titleY+=72; title=word }
      else title+=(title?' ':'')+word
    }
    ctx.fillText(title,86,titleY)
    ctx.font='54px Kalam, cursive';ctx.fillStyle='#3e2b1e'
    const y = Math.max(320,titleY+94)
    sheets[index].forEach((line,i)=>{ ctx.save();ctx.translate(88,y+i*70);ctx.rotate((rand()-.5)*.003);ctx.fillText(line,0,0);ctx.restore() })
    ctx.font='32px Kalam, cursive';ctx.fillStyle='#806340'
    ctx.fillText(page.mark ? `${page.mark}  Keep this mark.` : canUnfold ? '✳ ⌁ ≋  Unfold the letter' : 'C.',88,1110)
    if (page === pages.home || page === pages.letter) { ctx.textAlign='right';ctx.fillText('Leave a word',935,1110);ctx.textAlign='left' }
    ctx.strokeStyle='#80634050';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(86,1140);ctx.lineTo(936,1140);ctx.stroke()
    ctx.font='44px Kalam, cursive';ctx.fillStyle=page.audio?'#49331e':'#8b785d';ctx.fillText(page.audio?'♫ Listen':'♫ Listen · coming soon',88,1200)
    ctx.fillStyle='#49331e';ctx.textAlign='right';ctx.fillText(`${index+1} / ${sheets.length}${sheets.length>1?'   Turn ↻':''}`,935,1200);ctx.textAlign='left'
    ctx.restore(); map.needsUpdate=true
  }
  prepare(page); draw(0)
  return { mesh, draw, prepare, regions,
    setUnfold(value: boolean) { canUnfold = value },
    turn(index: number, immediate: boolean) {
      pendingSheet=index;fold=immediate?1:0;switched=immediate
      if(immediate){mesh.geometry.attributes.position.array.set(rest);mesh.geometry.attributes.position.needsUpdate=true;curlShade.value=0;draw(index)}
    },
    get animating() { return fold<1 },
    update(delta: number, reducedMotion: boolean) {
      if(fold>=1)return
      fold=reducedMotion?1:Math.min(1,fold+delta/.85)
      if(fold>=.5&&!switched){draw(pendingSheet);switched=true}
      // Lift and roll the real sheet around its left edge, then let the next page settle.
      const bend=Math.sin(fold*Math.PI), positions=mesh.geometry.attributes.position
      curlShade.value=bend
      for(let i=0;i<positions.count;i++){
        const x=rest[i*3],y=rest[i*3+1],u=(x+.33)/.66
        const angle=bend*u*1.7
        positions.setXYZ(i,angle ? -.33+Math.sin(angle)/angle*(x+.33) : x,y,Math.sin(angle)*.19+bend*u*.025)
      }
      positions.needsUpdate=true;mesh.geometry.computeVertexNormals()
    },
    get count() { return sheets.length },
  }
}
