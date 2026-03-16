import { GameState } from '../types';

const STORAGE_KEY = 'virtual-saibai-game';

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}

export function loadGame(): GameState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as GameState;
  } catch {
    return null;
  }
}
