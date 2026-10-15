/** Sound is opt-in, local and quiet. No audio context or media is created before a click. */
export function createSound() {
  const button = document.getElementById('sound') as HTMLButtonElement
  const status = document.getElementById('sound-status')!
  let context: AudioContext | null = null, master: GainNode, wind: GainNode
  let enabled = false, birdTimer = 0, voice: HTMLAudioElement | null = null
  let announcementTimer = 0
  function announce(message: string) {
    clearTimeout(announcementTimer); status.textContent = message
    announcementTimer = window.setTimeout(() => { status.textContent = '' }, 6500)
  }
  function paint() { button.textContent = enabled ? 'Sound on ♫' : 'Sound off'; button.setAttribute('aria-pressed', String(enabled)); document.body.dataset.sound = enabled ? 'on' : 'off' }
  function birds() {
    if (!context || !enabled || document.hidden) return
    const t = context.currentTime, oscillator = context.createOscillator(), gain = context.createGain()
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(680, t)
    oscillator.frequency.exponentialRampToValueAtTime(480, t + .22)
    oscillator.frequency.exponentialRampToValueAtTime(640, t + .45)
    gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(.025, t + .08); gain.gain.exponentialRampToValueAtTime(.0001, t + .65)
    oscillator.connect(gain).connect(master); oscillator.start(t); oscillator.stop(t + .7)
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
    birdTimer = window.setTimeout(birds, 14000 + Math.random() * 18000)
  }
  async function enable() {
    try {
      if (!context) {
        context = new AudioContext()
        master = context.createGain(); master.gain.value = .65; master.connect(context.destination)
        const buffer = context.createBuffer(1, context.sampleRate * 8, context.sampleRate), channel = buffer.getChannelData(0)
        let previous = 0
        for (let i = 0; i < channel.length; i++) { previous = (previous + (Math.random() * 2 - 1) * .02) / 1.02; channel[i] = previous * 3.5 }
        const noise = context.createBufferSource(); noise.buffer = buffer; noise.loop = true
        const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 900
        wind = context.createGain(); wind.gain.value = .13
        noise.connect(filter).connect(wind).connect(master); noise.start()
        const gust = context.createOscillator(), depth = context.createGain(); gust.frequency.value = .075; depth.gain.value = .045
        gust.connect(depth).connect(wind.gain); gust.start()
      }
      await context.resume(); enabled = context.state === 'running'; paint()
      if (enabled) { clearTimeout(birdTimer); birdTimer = window.setTimeout(birds, 6000); announce('Wind and distant birds enabled.') }
    } catch { announce('Sound could not start. Try the sound button again.') }
  }
  async function mute() { announce('Sound off.'); enabled = false; clearTimeout(birdTimer); voice?.pause(); await context?.suspend(); paint() }
  button.addEventListener('click', () => { void (enabled ? mute() : enable()) })
  document.addEventListener('visibilitychange', () => {
    clearTimeout(birdTimer)
    if (document.hidden) { voice?.pause(); void context?.suspend() }
    else if (enabled) void context?.resume().then(() => { birdTimer = window.setTimeout(birds, 9000) }).catch(() => { enabled = false; paint() })
  })
  paint()
  return {
    enable,
    get enabled() { return enabled },
    stopVoice() { voice?.pause(); voice = null; if (master && context) master.gain.setTargetAtTime(.65, context.currentTime, .2) },
    async listen(source?: string) {
      if (!source) { announce('Christian’s recording is not here yet. You can enable the woodland sounds separately.'); return }
      await enable()
      if (!enabled) return
      voice?.pause(); voice = new Audio(source)
      try {
        await voice.play(); master.gain.setTargetAtTime(.18, context!.currentTime, .2)
        voice.onended = () => master.gain.setTargetAtTime(.65, context!.currentTime, .2)
      } catch { announce('The recording could not play. Please try again.') }
    },
    drum() {
      void enable().then(() => {
        if (!context || !enabled) return
        const t = context.currentTime, tone = context.createOscillator(), gain = context.createGain()
        tone.frequency.setValueAtTime(150,t);tone.frequency.exponentialRampToValueAtTime(45,t+.2)
        gain.gain.setValueAtTime(.35,t);gain.gain.exponentialRampToValueAtTime(.001,t+.6)
        tone.connect(gain).connect(master);tone.start();tone.stop(t+.65)
        tone.onended = () => { tone.disconnect(); gain.disconnect() }
      })
    },
  }
}
export type WoodlandSound = ReturnType<typeof createSound>
