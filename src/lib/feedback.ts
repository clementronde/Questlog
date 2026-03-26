/** Trigger haptic feedback via Vibration API (mobile only, silently ignored elsewhere). */
export function haptic(pattern: number | number[] = [10, 5, 20]) {
  if ('vibrate' in navigator) navigator.vibrate(pattern);
}

/** Play a short ascending chime using Web Audio API. */
export function playComplete() {
  try {
    const ctx = new AudioContext();
    const notes = [523.25, 659.25, 783.99]; // C5 E5 G5

    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.09);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.22);

      osc.start(ctx.currentTime + i * 0.09);
      osc.stop(ctx.currentTime + i * 0.09 + 0.25);
    });
  } catch {
    // AudioContext unavailable — ignore silently
  }
}

/** Play a short error buzz. */
export function playError() {
  try {
    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.value = 110;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch { /* ignore */ }
}

/** Dispatch a custom event to trigger a floating XP number on screen. */
export function spawnXPFloat(xp: number, clientX: number, clientY: number) {
  window.dispatchEvent(
    new CustomEvent<{ xp: number; x: number; y: number }>('ql:xpfloat', {
      detail: { xp, x: clientX, y: clientY },
    })
  );
}
