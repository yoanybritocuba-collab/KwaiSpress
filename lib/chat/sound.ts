let unlocked = false

/** Los navegadores bloquean el audio hasta que el usuario interactúa. */
export function unlockAudio() {
  if (typeof window === 'undefined' || unlocked) return
  const unlock = () => {
    unlocked = true
    try {
      const a = new Audio('/notification.mp3')
      a.volume = 0
      a.play().then(() => a.pause()).catch(() => {})
    } catch {}
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
  window.addEventListener('pointerdown', unlock)
  window.addEventListener('keydown', unlock)
}

function beep() {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new AC()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g)
    g.connect(ctx.destination)
    o.frequency.value = 880
    g.gain.setValueAtTime(0.15, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4)
    o.start()
    o.stop(ctx.currentTime + 0.4)
  } catch {}
}

export function playNotificationSound() {
  try {
    const a = new Audio('/notification.mp3')
    a.volume = 0.7
    a.play().catch(beep) // si el mp3 falta o está bloqueado, suena un pitido
  } catch {
    beep()
  }
}