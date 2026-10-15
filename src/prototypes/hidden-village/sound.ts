export type VoiceState = 'idle' | 'loading' | 'playing' | 'paused'
export type DrumPart = 'kick' | 'snare' | 'hihat' | 'crash' | 'ride' | 'rack-tom' | 'floor-tom'
const root = '/prototype/hidden-village/assets/audio/'
/** Real field recordings and acoustic hits, created/resumed only after an explicit sound gesture. */
export function createSound() {
  const button = document.getElementById('sound') as HTMLButtonElement
  const status = document.getElementById('sound-status')!
  let context: AudioContext | null = null, master: GainNode, ambience: GainNode
  let enabled = false, eventTimer = 0, voice: HTMLAudioElement | null = null, announcementTimer = 0
  let forestStarted = false, walkingZ = 210, walkingX = 0, ambientLevel = 0
  let voiceState: VoiceState = 'idle', voiceChanged: (() => void) | undefined
  let mutedByVisitor = false
  const raw = new Map<string, Promise<ArrayBuffer>>(), decoded = new Map<string, Promise<AudioBuffer>>()
  const alternates = new Map<string, number>()
  function announce(message: string) { clearTimeout(announcementTimer);status.textContent=message;announcementTimer=window.setTimeout(()=>{status.textContent=''},6500) }
  function paint() { button.textContent=enabled?'Sound on ♫':'Sound off';button.setAttribute('aria-pressed',String(enabled));document.body.dataset.sound=enabled?'on':'off' }
  function setVoiceState(state: VoiceState) {
    voiceState=state;document.body.dataset.narration=state
    if(master&&context)master.gain.setTargetAtTime(state==='playing'?.20:.7,context.currentTime,.2)
    voiceChanged?.()
  }
  function stopVoice() {
    const previous=voice;voice=null
    if(previous){previous.pause();previous.removeAttribute('src');previous.load()}
    setVoiceState('idle')
  }
  function pauseVoice() { if(voice){voice.pause();setVoiceState('paused')} }
  function fetchSound(name: string) {
    if(!raw.has(name))raw.set(name,fetch(`${root}${name}.mp3`).then(response=>{if(!response.ok)throw Error('Sound unavailable');return response.arrayBuffer()}).catch(error=>{raw.delete(name);throw error}))
    return raw.get(name)!
  }
  async function buffer(name: string) {
    if(!decoded.has(name))decoded.set(name,fetchSound(name).then(data=>context!.decodeAudioData(data.slice(0))).catch(error=>{decoded.delete(name);throw error}))
    return decoded.get(name)!
  }
  async function play(name: string, volume: number, pan=0, ambient=false) {
    if(!enabled||!context)return
    try {
      const clip=await buffer(name)
      if(!enabled||document.hidden)return
      const source=context.createBufferSource(),gain=context.createGain(),stereo=context.createStereoPanner()
      source.buffer=clip;gain.gain.value=volume;stereo.pan.value=pan
      source.connect(gain).connect(stereo).connect(ambient?ambience:master);source.start()
      source.onended=()=>{source.disconnect();gain.disconnect();stereo.disconnect()}
    }catch{announce('A sound could not load. You can try again.')}
  }
  function distantEvents() {
    if(!enabled||!context||document.hidden)return
    const nearTimber=walkingZ<46||walkingX<-75
    void play(nearTimber&&Math.random()>.55?'wood-creak':'owl',nearTimber?.22:.15,Math.random()>.5?.65:-.65,true)
    eventTimer=window.setTimeout(distantEvents,28000+Math.random()*26000)
  }
  async function enable() {
    mutedByVisitor=false
    try {
      if(!context){
        context=new AudioContext({latencyHint:'interactive'});master=context.createGain();master.gain.value=.7;master.connect(context.destination)
        ambience=context.createGain();ambience.gain.value=.23;ambience.connect(master)
      }
      await context.resume();enabled=context.state==='running';paint()
      if(enabled){
        if(!forestStarted){
          forestStarted=true
          void buffer('woodland').then(clip=>{const source=context!.createBufferSource();source.buffer=clip;source.loop=true;source.connect(ambience);source.start()}).catch(()=>{forestStarted=false;announce('The woodland recording could not load.')})
        }
        clearTimeout(eventTimer);eventTimer=window.setTimeout(distantEvents,8500)
      }
    }catch{announce('Sound could not start. Try the sound button again.')}
  }
  async function mute() { mutedByVisitor=true;enabled=false;clearTimeout(eventTimer);pauseVoice();await context?.suspend();paint();announce('Sound off.') }
  button.addEventListener('click',()=>{if(enabled)void mute();else void enable().then(()=>{if(enabled)announce('The woodland is listening.')})})
  document.addEventListener('visibilitychange',()=>{
    clearTimeout(eventTimer)
    if(document.hidden){pauseVoice();void context?.suspend()}
    else if(enabled)void context?.resume().then(()=>{eventTimer=window.setTimeout(distantEvents,10000)}).catch(()=>{enabled=false;paint()})
  })
  paint()
  return {
    enable,
    get enabled(){return enabled},
    get voiceState(){return voiceState},
    onVoiceChange(callback: () => void){voiceChanged=callback},
    update(x:number,z:number){walkingX=x;walkingZ=z;const level=z>70&&z<90?.31:x<-60?.24:.18;if(context&&ambience&&level!==ambientLevel){ambientLevel=level;ambience.gain.setTargetAtTime(level,context.currentTime,2)}},
    prepareDrums(){for(const part of ['kick','snare','hihat','crash','ride','rack-tom','floor-tom'])for(const hit of [1,2])void fetchSound(`${part}-${hit}`).catch(()=>{})},
    stopVoice,
    async listen(source?:string, automatic=false){
      if(automatic&&mutedByVisitor)return
      if(!source){announce('Christian’s recording is not here yet. Woodland sounds are available separately.');return}
      if(voice?.getAttribute('src')===source&&!voice.ended){
        if(voiceState==='loading'||!voice.paused){pauseVoice();return}
      }else{
        stopVoice();voice=new Audio(source)
        const clip=voice
        clip.onplaying=()=>{if(voice===clip)setVoiceState('playing')}
        clip.onpause=()=>{if(voice===clip&&!clip.ended)setVoiceState('paused')}
        clip.onended=()=>{if(voice===clip)stopVoice()}
        clip.onerror=()=>{if(voice===clip){stopVoice();announce('The recording could not load. Please try again.')}}
      }
      const clip=voice
      setVoiceState('loading')
      // Start both playback APIs inside the visitor's click, including on mobile Safari.
      const enabling=enable()
      try{
        await Promise.all([enabling,clip.play()])
        if(voice===clip&&(!enabled||document.hidden))pauseVoice()
      }catch{
        if(voice!==clip||voiceState==='paused')return
        stopVoice();announce('The recording could not play. Please try again.')
      }
    },
    page(){if(enabled)void play('page-turn',.32)},
    async drum(part:DrumPart='kick'){
      if(!enabled)await enable()
      const hit=((alternates.get(part)??0)+1)%2;alternates.set(part,hit)
      const pan=part==='hihat'?-.3:part==='floor-tom'||part==='ride'?.3:0
      await play(`${part}-${hit+1}`,part==='crash'?.6:.9,pan)
    },
  }
}
export type WoodlandSound=ReturnType<typeof createSound>
