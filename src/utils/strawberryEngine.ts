/**
 * いちご栽培アドバンスドモデルのゲームエンジン
 * 仕様詳細: docs/strawberry_progress_design.md
 */
import { AdvancedCropState, ActionDegree, QualityRank, HarvestRecord } from '../types';

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

// ===== 初期値 =====

export function createInitialAdvancedCropState(): AdvancedCropState {
  return {
    modelType: 'advanced',
    cultivationStage: 1,
    daysInStage: 0,
    health: 70,
    moisture: 30,
    nutrition: 20,
    stress: 0,
    pestRisk: 0,
    diseaseRisk: 0,
    weedAmount: 30,
    rotRisk: 0,
    stageProgress: 0,
    flowerCount: 0,
    fruitCount: 0,
    fruitSize: 0,
    sweetness: 0,
    coloring: 0,
    qualityDamage: 0,
    qualityBonus: 0,
    overripeRisk: 0,
    isTilled: false,
    hasRidge: false,
    hasMulch: false,
    isPlanted: false,
    rootEstablishment: 0,
    todayPollinated: false,
    todayPollinationRate: 50,
    dailyAdvice: null,
    pendingStageTransition: false,
  };
}

// ===== 日次処理 =====

export function processOneDay(prev: AdvancedCropState): AdvancedCropState {
  let s: AdvancedCropState = {
    ...prev,
    pendingStageTransition: false,
    daysInStage: prev.daysInStage + 1,
  };

  // 1. 自然変化
  s = applyNaturalChanges(s);
  // 2. ステージ固有の効果
  s = applyStageEffects(s);
  // 3. 健全度更新
  s = updateHealth(s);
  // 4. ステージ進行度更新
  s = updateStageProgress(s);
  // 5. ステージ遷移チェック
  if (s.stageProgress >= 100 && checkTransitionConditions(s)) {
    s = advanceToNextStage(s);
  }
  // 6. デイリーアドバイス生成
  s = { ...s, dailyAdvice: generateDailyAdvice(s) };
  // 7. 当日フラグリセット
  s = { ...s, todayPollinated: false, todayPollinationRate: 50 };

  return s;
}

function applyNaturalChanges(s: AdvancedCropState): AdvancedCropState {
  // 共通ベース
  let moistureDelta = -5;
  let weedDelta = 2;
  let pestDelta = 1;
  let diseaseDelta = 1;

  // ステージ別上書き（strawberry_progress_design.md §4「日次自然変化」参照）
  switch (s.cultivationStage) {
    case 1: weedDelta = 3; break;
    case 2: moistureDelta = -6; break;
    case 3: moistureDelta = -7; weedDelta = 4; pestDelta = 2; diseaseDelta = 2; break;
    case 6: moistureDelta = -7; break;
    case 7: moistureDelta = -5; break;
    default: break;
  }

  // マルチ効果: 水分蒸発30%軽減・雑草増加50%軽減
  if (s.hasMulch) {
    moistureDelta = Math.ceil(moistureDelta * 0.7);
    weedDelta = Math.max(0, Math.floor(weedDelta * 0.5));
  }

  return {
    ...s,
    moisture: clamp(s.moisture + moistureDelta),
    weedAmount: clamp(s.weedAmount + weedDelta),
    pestRisk: clamp(s.pestRisk + pestDelta),
    diseaseRisk: clamp(s.diseaseRisk + diseaseDelta),
  };
}

function applyStageEffects(s: AdvancedCropState): AdvancedCropState {
  let next = { ...s };

  // 水分極端値によるストレス（全ステージ共通）
  if (s.moisture <= 24) next.stress = clamp(s.stress + 6);
  if (s.moisture >= 85) next.stress = clamp(s.stress + 5);

  switch (s.cultivationStage) {
    case 2: {
      next.stress = clamp(next.stress + 2);
      next.rootEstablishment = clamp(s.rootEstablishment + 5);
      break;
    }
    case 4: {
      // 花芽形成期: 条件に応じて花の数が増える
      const good = s.moisture >= 35 && s.moisture <= 70 && s.nutrition >= 40 && s.nutrition <= 75 && s.stress <= 39;
      const bad = s.moisture < 24 || s.moisture > 80 || s.stress > 60;
      next.flowerCount = s.flowerCount + (good ? 2 : bad ? 0 : 1);
      break;
    }
    case 5: {
      // 開花期: 花が実に変わる
      const newFruits = Math.max(0, Math.round(s.flowerCount * (next.todayPollinationRate / 100)));
      next.fruitCount = clamp(s.fruitCount + newFruits, 0, 9999);
      break;
    }
    case 6: {
      // 果実肥大期: 実が大きくなる
      next.rotRisk = clamp(s.rotRisk + 1);
      const goodCond = s.moisture >= 40 && s.moisture <= 69 && s.nutrition >= 40 && s.nutrition <= 69 && s.stress <= 39;
      const poorCond = s.moisture < 24 || s.stress > 60;
      const growth = goodCond ? 8 : poorCond ? 0 : 5;
      next.fruitSize = clamp(s.fruitSize + growth);
      break;
    }
    case 7: {
      // 成熟期: 色づき・甘さ・実の大きさが増す
      next.coloring = clamp(s.coloring + 3);
      next.sweetness = clamp(s.sweetness + 2);
      const goodCond = s.moisture >= 35 && s.moisture <= 65 && s.stress <= 39;
      next.fruitSize = clamp(s.fruitSize + (goodCond ? 5 : 3));
      break;
    }
    case 8: {
      // 収穫可能期: 熟しすぎリスク増加
      next.overripeRisk = clamp(s.overripeRisk + 10);
      break;
    }
    default:
      break;
  }

  return next;
}

function updateHealth(s: AdvancedCropState): AdvancedCropState {
  let delta = 0;
  if (s.moisture >= 40 && s.moisture <= 69) delta += 1;
  if (s.nutrition >= 40 && s.nutrition <= 69) delta += 1;
  if (s.stress >= 60) delta -= 3;
  if (s.diseaseRisk >= 60) delta -= 4;
  if (s.pestRisk >= 60) delta -= 3;
  if (s.rotRisk >= 60) delta -= 2;
  return { ...s, health: clamp(s.health + delta) };
}

function updateStageProgress(s: AdvancedCropState): AdvancedCropState {
  if (s.cultivationStage === 8) return s;

  let delta = 0;

  switch (s.cultivationStage) {
    case 1: {
      delta = 20;
      if (s.nutrition >= 40) delta += 10;
      break;
    }
    case 2: {
      delta = 10;
      if (s.moisture >= 40 && s.moisture <= 69) delta += 10;
      if (s.health >= 50) delta += 10;
      if (s.stress <= 39) delta += 5;
      delta += 5; // rootEstablishment の日次加算分
      if (s.moisture <= 24) delta -= 10;
      break;
    }
    case 3: {
      delta = 8;
      if (s.moisture >= 40 && s.moisture <= 69) delta += 8;
      if (s.nutrition >= 40 && s.nutrition <= 69) delta += 8;
      if (s.health >= 60) delta += 5;
      if (s.weedAmount > 50) delta -= 8;
      if (s.stress > 50) delta -= 10;
      break;
    }
    case 4: {
      delta = 7;
      if (s.moisture >= 35 && s.moisture <= 70) delta += 8;
      if (s.nutrition >= 40 && s.nutrition <= 75) delta += 8;
      if (s.stress <= 39) delta += 5;
      if (s.stress > 50) delta -= 10;
      break;
    }
    case 5: {
      delta = 8;
      if (s.health >= 50) delta += 5;
      if (s.stress <= 39) delta += 5;
      if (s.todayPollinated) delta += 5;
      break;
    }
    case 6: {
      delta = 7;
      if (s.moisture >= 40 && s.moisture <= 75) delta += 8;
      if (s.nutrition >= 40 && s.nutrition <= 70) delta += 5;
      if (s.fruitCount >= 9 && s.fruitCount <= 12) delta -= 3;
      if (s.fruitCount > 12) delta -= 5;
      if (s.rotRisk > 50) delta -= 8;
      break;
    }
    case 7: {
      delta = 10;
      if (s.coloring >= 60) delta += 5;
      if (s.sweetness >= 50) delta += 5;
      break;
    }
    default:
      break;
  }

  return { ...s, stageProgress: clamp(s.stageProgress + delta) };
}

function checkTransitionConditions(s: AdvancedCropState): boolean {
  switch (s.cultivationStage) {
    case 1: return s.hasRidge;
    case 2: return s.isPlanted && s.daysInStage >= 3 && s.rootEstablishment >= 30 && s.health >= 40;
    case 3: return s.daysInStage >= 5 && s.health >= 50 && s.nutrition >= 35;
    case 4: return s.daysInStage >= 4 && s.flowerCount >= 5 && s.health >= 45;
    case 5: return s.daysInStage >= 3 && s.fruitCount >= 1;
    case 6: return s.daysInStage >= 5 && s.fruitSize >= 60 && s.health >= 35 && s.fruitCount >= 1;
    case 7: return s.daysInStage >= 3 && s.fruitSize >= 80 && s.coloring >= 80 && s.sweetness >= 60;
    case 8: return false; // プレイヤーの収穫アクションのみ
    default: return false;
  }
}

function advanceToNextStage(s: AdvancedCropState): AdvancedCropState {
  return {
    ...s,
    cultivationStage: s.cultivationStage + 1,
    daysInStage: 0,
    stageProgress: 0,
    pendingStageTransition: true,
    todayPollinated: false,
    todayPollinationRate: 50,
  };
}

// ===== デイリーアドバイス =====

export function generateDailyAdvice(s: AdvancedCropState): string {
  // 優先度1: 危機状態
  if (s.health <= 20) return '⚠️ 株がとても弱っています。水やりと栄養補給を急ぎましょう';
  if (s.health <= 40) return '⚠️ 株が弱っています。パラメーターを確認しましょう';

  // 優先度2: ステージ固有の重要アクション
  if (s.cultivationStage === 8) {
    if (s.overripeRisk >= 30) return '⏰ 収穫が遅れています。早めに収穫しましょう！';
    return '🍓 いちごが赤く実りました！収穫のタイミングです！';
  }
  if (s.cultivationStage === 5) return '🌸 花が咲き始めました！受粉を助けてあげましょう';
  if (s.cultivationStage === 6 && s.fruitCount > 12) return '✂️ 実が多すぎます。摘果すると1粒が大きく甘くなります';
  if (s.cultivationStage === 7) return '🍓 実が色づいてきました。水は控えめにすると甘くなります';
  if (s.cultivationStage === 1 && !s.hasRidge) return '🏡 畝を作ると次のステージに進めます';
  if (s.cultivationStage === 2 && !s.isPlanted) return '🌱 苗を植えましょう！根付きが栽培の始まりです';

  // 優先度3: パラメーター改善
  if (s.moisture <= 24) return '💧 土がとても乾いています。水をあげましょう';
  if (s.moisture <= 39) return '💧 土が乾き気味です。水をあげましょう';
  if (s.pestRisk >= 60) return '🐛 害虫の被害が深刻です。害虫対策をしましょう';
  if (s.diseaseRisk >= 60) return '🦠 病気が広がっています。病気対策をしましょう';
  if (s.weedAmount >= 60) return '🌿 雑草が多くなっています。除草しましょう';
  if (s.nutrition <= 24) return '🧪 栄養がかなり不足しています。追肥しましょう';
  if (s.pestRisk >= 40) return '🐛 害虫が気になります。対策を検討しましょう';
  if (s.diseaseRisk >= 40) return '🦠 病気の気配があります。予防対策をしましょう';

  // 優先度4: ポジティブ
  return '✨ 順調に育っています。この調子で管理を続けましょう';
}

// ===== プレイヤーアクション（即時反映） =====

export function actionTillSoil(s: AdvancedCropState): AdvancedCropState {
  return {
    ...s,
    weedAmount: clamp(s.weedAmount - 10),
    isTilled: true,
    stageProgress: clamp(s.stageProgress + 20),
  };
}

export function actionMakeRidge(s: AdvancedCropState): AdvancedCropState {
  return {
    ...s,
    hasRidge: true,
    stageProgress: clamp(s.stageProgress + 20),
  };
}

export function actionLayMulch(s: AdvancedCropState): AdvancedCropState {
  return {
    ...s,
    hasMulch: true,
    stageProgress: clamp(s.stageProgress + 10),
  };
}

export function actionBaseFertilizer(s: AdvancedCropState): AdvancedCropState {
  return { ...s, nutrition: clamp(s.nutrition + 15) };
}

export function actionPlantSeedling(s: AdvancedCropState): AdvancedCropState {
  return {
    ...s,
    isPlanted: true,
    rootEstablishment: clamp(s.rootEstablishment + 10),
  };
}

export function actionWater(s: AdvancedCropState, degree: ActionDegree): AdvancedCropState {
  const WATER_AMOUNTS: Record<ActionDegree, number> = { light: 8, normal: 15, heavy: 25 };
  const amount = WATER_AMOUNTS[degree];
  const diseaseExtra = degree === 'heavy' ? 5 : 0;
  return {
    ...s,
    moisture: clamp(s.moisture + amount),
    diseaseRisk: clamp(s.diseaseRisk + diseaseExtra),
  };
}

export function actionFertilize(s: AdvancedCropState, degree: ActionDegree): AdvancedCropState {
  const AMOUNTS: Record<ActionDegree, { nutrition: number; stress: number }> = {
    light: { nutrition: 5, stress: 0 },
    normal: { nutrition: 10, stress: 0 },
    heavy: { nutrition: 20, stress: 5 },
  };
  const { nutrition, stress } = AMOUNTS[degree];
  return {
    ...s,
    nutrition: clamp(s.nutrition + nutrition),
    stress: clamp(s.stress + stress),
  };
}

export function actionWeed(s: AdvancedCropState): AdvancedCropState {
  return { ...s, weedAmount: clamp(s.weedAmount - 15) };
}

export function actionTrimLeaves(s: AdvancedCropState, degree: ActionDegree): AdvancedCropState {
  if (degree === 'heavy') {
    return { ...s, health: clamp(s.health - 5), diseaseRisk: clamp(s.diseaseRisk - 5) };
  }
  const coloringBonus = s.cultivationStage >= 7 ? 5 : 0;
  return {
    ...s,
    diseaseRisk: clamp(s.diseaseRisk - 5),
    coloring: clamp(s.coloring + coloringBonus),
  };
}

export function actionPestControl(s: AdvancedCropState): AdvancedCropState {
  const effect = s.cultivationStage >= 3 ? -10 : -8;
  return { ...s, pestRisk: clamp(s.pestRisk + effect) };
}

export function actionDiseaseControl(s: AdvancedCropState): AdvancedCropState {
  const effect = s.cultivationStage >= 3 ? -10 : -8;
  const rotBonus = s.cultivationStage >= 7 ? -5 : 0;
  return {
    ...s,
    diseaseRisk: clamp(s.diseaseRisk + effect),
    rotRisk: clamp(s.rotRisk + rotBonus),
  };
}

export function actionTempAdjust(s: AdvancedCropState): AdvancedCropState {
  const stressEffect = s.cultivationStage >= 7 ? -3 : -5;
  const coloringBonus = s.cultivationStage === 7 ? 3 : 0;
  return {
    ...s,
    stress: clamp(s.stress + stressEffect),
    coloring: clamp(s.coloring + coloringBonus),
  };
}

export function actionPollinate(s: AdvancedCropState): AdvancedCropState {
  if (s.cultivationStage !== 5) return s;
  return {
    ...s,
    todayPollinated: true,
    todayPollinationRate: clamp(s.todayPollinationRate + 20, 0, 100),
  };
}

export function actionThinFlowers(s: AdvancedCropState): AdvancedCropState {
  if (s.cultivationStage !== 5) return s;
  const removed = Math.min(s.flowerCount, 2 + Math.floor(Math.random() * 4)); // 2〜5本
  return {
    ...s,
    flowerCount: Math.max(0, s.flowerCount - removed),
    qualityBonus: s.qualityBonus + 5,
  };
}

export function actionThinFruits(s: AdvancedCropState): AdvancedCropState {
  if (s.cultivationStage < 5) return s;
  const removed = Math.min(s.fruitCount - 1, 1 + Math.floor(Math.random() * 3)); // 1〜3個
  if (removed <= 0) return s;
  const sizeBonus = 5;
  return {
    ...s,
    fruitCount: Math.max(1, s.fruitCount - removed),
    fruitSize: clamp(s.fruitSize + sizeBonus),
    qualityBonus: s.qualityBonus + 5,
  };
}

// ===== 収穫結果計算 =====

export interface HarvestResult {
  fruitCount: number;
  totalWeight: number;
  qualityScore: number;
  qualityRank: QualityRank;
  sweetness: number;
  exchangeQuantity: number;
  record: Omit<HarvestRecord, 'crop' | 'harvestedAt'>;
}

export function calculateHarvestResult(s: AdvancedCropState): HarvestResult {
  const fruitCount = Math.max(1, s.fruitCount);

  // 総重量 = 実の数 × 基本重さ × 大きさ補正 × 健全度補正
  const sizeMultiplier = 0.5 + s.fruitSize / 100;
  const healthMultiplier = 0.5 + s.health / 200;
  const totalWeight = Math.round(fruitCount * 15 * sizeMultiplier * healthMultiplier);

  // 品質スコア
  const sweetnessBonus = s.sweetness * 0.3;
  const coloringBonus = s.coloring * 0.2;
  const healthBonus = s.health * 0.1;
  const damagePenalty = s.qualityDamage;
  const rotPenalty = s.rotRisk * 0.2;
  const timingBonus = s.overripeRisk < 30 ? 10 : 0;
  const managementBonus = s.qualityBonus > 0 ? 5 : 0;

  const rawScore = 50 + sweetnessBonus + coloringBonus + healthBonus - damagePenalty - rotPenalty + timingBonus + managementBonus;
  const qualityScore = Math.round(clamp(rawScore, 0, 100));

  const qualityRank: QualityRank =
    qualityScore >= 85 ? 'A' :
    qualityScore >= 70 ? 'B' :
    qualityScore >= 50 ? 'C' : 'D';

  const QUALITY_MULTIPLIERS: Record<QualityRank, number> = { A: 1.2, B: 1.0, C: 0.8, D: 0.5 };
  const exchangeQuantity = Math.max(1, Math.floor(fruitCount * QUALITY_MULTIPLIERS[qualityRank]));

  return {
    fruitCount,
    totalWeight,
    qualityScore,
    qualityRank,
    sweetness: s.sweetness,
    exchangeQuantity,
    record: {
      exchangeQuantity,
      qualityRank,
      qualityScore,
      fruitCount,
      totalWeight,
      sweetness: s.sweetness,
    },
  };
}

// ===== ステージ遷移メッセージ =====

export const STAGE_TRANSITION_MESSAGES: Record<number, { title: string; body: string }> = {
  2: {
    title: '🎉 畑の準備ができました！',
    body: 'いよいよ苗を植えましょう。\nこの時期は苗がしっかり根付くことが大切です。\n水を切らさないよう注意しつつ、やりすぎにも気をつけましょう。',
  },
  3: {
    title: '🎉 苗が根付きました！',
    body: 'ここからぐんぐん育ちます。\n葉が茂って株が大きくなる時期です。\n水やり・追肥・除草をバランスよく行いましょう。',
  },
  4: {
    title: '🎉 株がしっかり育ちました！',
    body: '花の準備が始まります。\nこの時期の水・栄養・温度のバランスが、花の数を決めます。\n温度ストレスは花芽形成に大きく影響するので、温度調整が重要です。',
  },
  5: {
    title: '🌸 花芽ができました！',
    body: '白い花が咲き始めます。\n花が実になるかどうかは受粉にかかっています。\n「受粉補助」をすると実がつきやすくなります。',
  },
  6: {
    title: '🎉 実がつき始めました！',
    body: 'ここから実を大きく育てます。\n水と栄養をしっかり与えて、実をふくらませましょう。\n実が多すぎると1粒が小さくなります。摘果も検討しましょう。',
  },
  7: {
    title: '🎉 実が大きく育ちました！',
    body: 'あとは甘く色づくのを待ちます。\nこの時期は水を控えめにすると糖度が上がります。\n葉の整理で日光を当てると色づきがよくなります。',
  },
  8: {
    title: '🍓 いちごが赤く実りました！',
    body: 'いよいよ収穫です！\n収穫のタイミングが大切です。待ちすぎると熟しすぎて傷みます。\n天候にも注意し、良い状態のうちに収穫しましょう。',
  },
};

// ===== 改善ヒント =====

export function getImprovementHints(s: AdvancedCropState): string[] {
  const hints: Array<{ condition: boolean; hint: string }> = [
    { condition: s.sweetness < 50, hint: '成熟期に水を控えめにすると、糖度が上がりやすくなります' },
    { condition: s.coloring < 70, hint: '葉の整理で日光を当てると、もっときれいに赤くなります' },
    { condition: s.qualityDamage >= 20, hint: '害虫・病気対策をこまめに行うと、見た目がぐっとよくなります' },
    { condition: s.rotRisk >= 40, hint: '水やりを控えめにし、風通しを確保すると傷みにくくなります' },
    { condition: s.fruitCount > 12, hint: '実を8個程度に摘果すると、1粒が大きく甘くなります' },
    { condition: s.overripeRisk >= 30, hint: '収穫可能になったら早めに収穫すると、品質を保てます' },
    { condition: s.health < 50, hint: '水・栄養・ストレス管理を丁寧にすると、株が元気に育ちます' },
  ];

  return hints
    .filter(h => h.condition)
    .slice(0, 2)
    .map(h => h.hint);
}

// ===== ランダムイベント（日次処理内・デバッグメニューからも呼び出し可能） =====

export type EventId =
  | 'rain' | 'longRain' | 'highTemp' | 'lowTemp' | 'sunnyContinue'
  | 'lowLight' | 'strongWind' | 'dryWeather'
  | 'pest' | 'disease'
  | 'birdDamage';

export function applyEvent(s: AdvancedCropState, eventId: EventId): AdvancedCropState {
  let next = { ...s };
  switch (eventId) {
    case 'rain':
      next.moisture = clamp(s.moisture + 10);
      break;
    case 'longRain':
      next.moisture = clamp(s.moisture + 20);
      next.diseaseRisk = clamp(s.diseaseRisk + (s.cultivationStage >= 7 ? 8 : 5));
      if (s.cultivationStage >= 7) {
        next.rotRisk = clamp(s.rotRisk + 12);
        next.sweetness = clamp(s.sweetness - 3);
      }
      break;
    case 'highTemp':
      next.stress = clamp(s.stress + (s.cultivationStage <= 2 ? 8 : 10));
      next.moisture = clamp(s.moisture - (s.cultivationStage <= 2 ? 10 : 5));
      if (s.cultivationStage === 5) {
        next.todayPollinationRate = clamp(s.todayPollinationRate - 15, 0, 100);
      }
      if (s.cultivationStage === 8) {
        next.overripeRisk = clamp(s.overripeRisk + 8);
      }
      if (s.cultivationStage === 7) {
        next.sweetness = clamp(s.sweetness - 5);
      }
      break;
    case 'lowTemp':
      next.stress = clamp(s.stress + (s.cultivationStage === 2 ? 10 : 8));
      if (s.cultivationStage === 2) {
        next.rootEstablishment = clamp(s.rootEstablishment - 5);
      }
      break;
    case 'sunnyContinue':
      next.moisture = clamp(s.moisture - 8);
      break;
    case 'lowLight':
      next.stageProgress = clamp(s.stageProgress - 6);
      if (s.cultivationStage >= 7) {
        next.coloring = clamp(s.coloring - 3);
      }
      break;
    case 'strongWind':
      next.stress = clamp(s.stress + 2);
      break;
    case 'dryWeather':
      next.moisture = clamp(s.moisture - 10);
      if (s.cultivationStage === 6) {
        next.fruitSize = clamp(s.fruitSize - 3);
      }
      break;
    case 'pest':
      next.pestRisk = clamp(s.pestRisk + 8 + Math.floor(Math.random() * 5));
      if (s.cultivationStage === 5) {
        next.flowerCount = Math.max(0, s.flowerCount - 1 - Math.floor(Math.random() * 2));
      }
      if (s.cultivationStage === 6) {
        next.qualityDamage = clamp(s.qualityDamage + 5);
      }
      break;
    case 'disease':
      next.diseaseRisk = clamp(s.diseaseRisk + 10 + Math.floor(Math.random() * 3));
      if (s.cultivationStage === 4) {
        next.health = clamp(s.health - 8);
      }
      if (s.cultivationStage === 6) {
        next.fruitCount = Math.max(0, s.fruitCount - 1 - Math.floor(Math.random() * 2));
      }
      break;
    case 'birdDamage':
      if (s.cultivationStage >= 7) {
        next.qualityDamage = clamp(s.qualityDamage + 5 + Math.floor(Math.random() * 4));
      }
      break;
    default:
      break;
  }
  return next;
}
