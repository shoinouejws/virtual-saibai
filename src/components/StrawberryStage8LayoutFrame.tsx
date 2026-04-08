import { forwardRef, type ReactNode } from 'react';

/**
 * いちご段階8のレイアウト基準は **FarmPage → FarmGrid → FarmCell** のマス内と同じく
 * `aspect-square`（縦横比 1:1）のスロットとする。
 * セル詳細・座標調整ページでもこのスロットで囲み、相対座標の意味を統一する。
 */
export const STRAWBERRY_STAGE8_REFERENCE_ASPECT_RATIO = 1;

const REFERENCE_OUTER =
  'relative aspect-square h-full max-h-full w-auto max-w-full min-h-0 min-w-0';
const REFERENCE_INNER = 'absolute inset-0 flex items-center justify-center';

export function StrawberryStage8ReferenceSlot({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${REFERENCE_OUTER} ${className}`.trim()}>
      <div className={REFERENCE_INNER}>{children}</div>
    </div>
  );
}

/**
 * fillContainer 時と同じ: 基準正方形の内側で二重フルラッパー＋ 88% のパーツ座標コンテナ。
 * ref は 88% 内側の div（StrawberryStage8LayeredCrop と同じ計測対象）に付与する。
 */
export const StrawberryStage8FillContent = forwardRef<HTMLDivElement, { children: ReactNode }>(
  function StrawberryStage8FillContent({ children }, ref) {
    return (
      <div className="relative flex h-full w-full min-h-0 min-w-0 items-center justify-center">
        <div className="relative z-10 flex h-full w-full min-h-0 min-w-0 items-center justify-center object-contain">
          {/*
            h-[88%] と w-[88%] だけだと親の高さが未確定な列 flex などで縦が 0 に近づき、
            横長の計測矩形になり y がずれる。幅基準の aspect-square で内側を必ず正方形にする。
          */}
          <div
            ref={ref}
            className="relative mx-auto aspect-square w-[88%] max-w-[88%] min-h-0 min-w-0 shrink-0"
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);
