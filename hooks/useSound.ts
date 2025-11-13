"use client";

import { useEffect } from 'react';
import { soundManager, SoundType } from '@/lib/sounds';

export function useSound(type: SoundType, enabled: boolean = true) {
  useEffect(() => {
    if (enabled) {
      soundManager.loadPreferences();
    }
  }, [enabled]);

  const play = () => {
    if (enabled) {
      soundManager.play(type);
    }
  };

  return { play, soundManager };
}

