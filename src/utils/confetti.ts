import confetti from 'canvas-confetti';

/**
 * Fires a subtle, elegant confetti burst for hen purchases.
 * Uses the Al Jadeed brand colors (pink, purple, gold, emerald, indigo).
 */
export function fireSubtlePurchaseConfetti() {
  try {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const brandColors = ['#ec4899', '#a855f7', '#fbbf24', '#10b981', '#6366f1'];

    // Primary central burst - subtle and gentle
    confetti({
      particleCount: 55,
      spread: 60,
      origin: { y: 0.65 },
      colors: brandColors,
      startVelocity: 30,
      scalar: 0.9,
      ticks: 200,
      shapes: ['circle', 'square'],
      zIndex: 99999,
      disableForReducedMotion: true,
    });

    // Secondary subtle dual-cannon flutter 150ms later
    setTimeout(() => {
      confetti({
        particleCount: 25,
        angle: 60,
        spread: 45,
        origin: { x: 0.15, y: 0.65 },
        colors: brandColors,
        startVelocity: 25,
        scalar: 0.8,
        ticks: 180,
        zIndex: 99999,
        disableForReducedMotion: true,
      });

      confetti({
        particleCount: 25,
        angle: 120,
        spread: 45,
        origin: { x: 0.85, y: 0.65 },
        colors: brandColors,
        startVelocity: 25,
        scalar: 0.8,
        ticks: 180,
        zIndex: 99999,
        disableForReducedMotion: true,
      });
    }, 150);
  } catch (err) {
    console.warn('Confetti trigger avoided:', err);
  }
}

/**
 * Fires a subtle emerald & gold confetti burst for cash withdrawal requests.
 */
export function fireSubtleWithdrawalConfetti() {
  try {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const payoutColors = ['#10b981', '#34d399', '#f59e0b', '#fbbf24', '#8b5cf6'];

    confetti({
      particleCount: 50,
      spread: 55,
      origin: { y: 0.65 },
      colors: payoutColors,
      startVelocity: 28,
      scalar: 0.9,
      ticks: 200,
      shapes: ['circle', 'square'],
      zIndex: 99999,
      disableForReducedMotion: true,
    });
  } catch (err) {
    console.warn('Confetti trigger avoided:', err);
  }
}
