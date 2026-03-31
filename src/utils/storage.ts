import { GameState } from '../types';

const STORAGE_KEY = 'virtual-saibai-game';
const SCHEMA_VERSION = 4; // activeWeatherEffect を GameState に追加

interface VersionedState {
  version: number;
  state: GameState;
}

export function saveGame(state: GameState): void {
  try {
    const versioned: VersionedState = { version: SCHEMA_VERSION, state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(versioned));
  } catch {
    // localStorage full or unavailable
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // バージョンチェック: スキーマが変わっていたらリセット
    if (!parsed.version || parsed.version < SCHEMA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed.state as GameState;
  } catch {
    return null;
  }
}
