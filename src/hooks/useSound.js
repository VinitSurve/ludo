import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * High-fidelity Web Audio API Sound Synthesizer for Ludo
 * No external files required! Works completely offline and on all modern browsers.
 */
export function useSound(initialMuted = false) {
  const [muted, setMuted] = useState(() => {
    try {
      const stored = localStorage.getItem('ludo_sound_muted');
      return stored !== null ? JSON.parse(stored) : initialMuted;
    } catch {
      return initialMuted;
    }
  });

  const audioCtxRef = useRef(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ludo_sound_muted', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // 1. Dice Roll Sound (multiple rhythmic clicks/rattles)
  const playDiceRoll = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const count = 5;
      for (let i = 0; i < count; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200 + Math.random() * 300, ctx.currentTime + i * 0.04);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + i * 0.04 + 0.03);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.04 + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.04);
        osc.stop(ctx.currentTime + i * 0.04 + 0.035);
      }
    } catch {}
  }, [muted, getAudioContext]);

  // 2. Piece Move / Jump Sound (Springy liftoff pop + solid wooden board landing click)
  const playPieceMove = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 1. Takeoff jump spring (rising tone)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(420, now);
      osc1.frequency.exponentialRampToValueAtTime(720, now + 0.08);

      gain1.gain.setValueAtTime(0.22, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.085);

      // 2. Landing tap on the wooden board
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(260, now + 0.32);
      osc2.frequency.exponentialRampToValueAtTime(90, now + 0.39);

      gain2.gain.setValueAtTime(0.18, now + 0.32);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.32);
      osc2.stop(now + 0.41);
    } catch {}
  }, [muted, getAudioContext]);

  // 3. Piece Capture Sound (low impact boom)
  const playCapture = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {}
  }, [muted, getAudioContext]);

  // 4. Safe Square or Bonus Turn Sound (sparkly chime)
  const playBonusChime = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.06 + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.16);
      });
    } catch {}
  }, [muted, getAudioContext]);

  // 5. Piece Finish Sound (triumphant double chime)
  const playFinishPiece = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [659.25, 880, 1174.66]; // E5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.22);
      });
    } catch {}
  }, [muted, getAudioContext]);

  // 6. Game Victory Fanfare
  const playVictory = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const fanfare = [
        { f: 523.25, t: 0.0, d: 0.15 },
        { f: 523.25, t: 0.16, d: 0.15 },
        { f: 523.25, t: 0.32, d: 0.15 },
        { f: 659.25, t: 0.48, d: 0.35 },
        { f: 587.33, t: 0.85, d: 0.15 },
        { f: 783.99, t: 1.02, d: 0.5 },
      ];

      fanfare.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.t);

        gain.gain.setValueAtTime(0.3, ctx.currentTime + n.t);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + n.t + n.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + n.t);
        osc.stop(ctx.currentTime + n.t + n.d + 0.05);
      });
    } catch {}
  }, [muted, getAudioContext]);

  return {
    muted,
    toggleMute,
    playDiceRoll,
    playPieceMove,
    playCapture,
    playBonusChime,
    playFinishPiece,
    playVictory,
  };
}
