import type { EventId } from '../utils/strawberryEngine';

/** イベントIDの日本語表示名（デバッグメニュー等で共通利用） */
export const EVENT_DISPLAY_NAMES: Record<EventId, string> = {
  rain: '雨',
  longRain: '長雨',
  highTemp: '高温',
  lowTemp: '低温',
  sunnyContinue: '晴天続き',
  lowLight: '日照不足',
  strongWind: '強風',
  dryWeather: '乾燥',
  pest: '害虫発生',
  disease: '病気発生',
  birdDamage: '鳥害',
};

/** ヘッダー「現在の天気」に載せる対象（天候系イベント） */
const WEATHER_IDS = new Set<EventId>([
  'rain',
  'longRain',
  'highTemp',
  'lowTemp',
  'sunnyContinue',
  'lowLight',
  'strongWind',
  'dryWeather',
]);

export function isWeatherEventId(id: EventId): boolean {
  return WEATHER_IDS.has(id);
}

/** 天候以外（害虫・病気・鳥害）のバッジ文言 */
export const INCIDENT_BADGE_LABELS: Partial<Record<EventId, string>> = {
  pest: '害虫発生中',
  disease: '病気発生中',
  birdDamage: '鳥害発生中',
};
