import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import {
  EVENT_DISPLAY_NAMES,
  INCIDENT_BADGE_LABELS,
  isWeatherEventId,
} from '../data/eventLabels';

export function Header() {
  const { state } = useGame();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const gameDate = state.currentGameDate
    ? new Date(state.currentGameDate)
    : null;
  const dateLabel = gameDate
    ? `${gameDate.getFullYear()}年${gameDate.getMonth() + 1}月${gameDate.getDate()}日`
    : null;

  const activeId = state.activeEventId;
  const weatherLine =
    activeId && isWeatherEventId(activeId)
      ? EVENT_DISPLAY_NAMES[activeId]
      : null;
  const incidentBadge =
    activeId && !isWeatherEventId(activeId)
      ? INCIDENT_BADGE_LABELS[activeId]
      : null;
  const showStatusBar = Boolean(activeId);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  return (
    <>
      <header className="bg-farm-brown-dark text-white px-4 py-2.5 shadow-sm relative z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <h1 className="text-sm font-bold tracking-wider shrink-0">🌿 バーチャル栽培</h1>
            {dateLabel && (
              <span className="text-[11px] text-white/50 font-medium truncate">{dateLabel}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] shrink-0">
            <span className="flex items-center gap-1 bg-white/12 px-2.5 py-1 rounded-md">
              <span className="text-white/50">肥料</span>
              <span className="font-semibold">{state.fertilizer}g</span>
            </span>
            <Link
              to="/harvest"
              className="flex items-center gap-1 bg-white/12 px-2.5 py-1 rounded-md
                hover:bg-white/20 transition-colors"
            >
              <span className="text-white/50">収穫</span>
              <span className="font-semibold">{state.harvestLog.length}件</span>
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowMenu(v => !v)}
                className={`
                  w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-[3px]
                  transition-all duration-200 shadow-sm
                  ${showMenu
                    ? 'bg-white/25'
                    : 'bg-white/12 hover:bg-white/20'
                  }
                `}
                aria-label="メニュー"
                aria-expanded={showMenu}
              >
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="block w-4 h-[2px] rounded-full bg-white/90 transition-all duration-200"
                  />
                ))}
              </button>

              {showMenu && (
                <div
                  className="absolute top-11 right-0 bg-white rounded-xl shadow-lg border border-farm-border
                    min-w-[180px] py-1.5 animate-fade-in-down z-50"
                >
                  <div className="px-3 pt-1.5 pb-2">
                    <span className="text-[10px] font-semibold text-farm-text-secondary tracking-wider">
                      プロトタイプ
                    </span>
                  </div>
                  <Link
                    to="/prototype/thinning"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-farm-text
                      hover:bg-farm-green-light transition-colors"
                  >
                    <span className="text-base">✂️</span>
                    <span className="font-medium">摘果UI</span>
                  </Link>
                  <Link
                    to="/prototype/strawberry-parts"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-farm-text
                      hover:bg-farm-green-light transition-colors"
                  >
                    <span className="text-base">🍓</span>
                    <span className="font-medium">いちごパーツ座標</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showStatusBar && (
        <div
          className="bg-sky-50/95 border-b border-sky-200/70 px-4 py-2 z-30 relative"
          role="status"
        >
          <div className="max-w-lg mx-auto flex flex-wrap items-center justify-between gap-2 gap-y-1.5">
            <div className="min-w-0 flex-1 text-left">
              <span className="text-[11px] font-semibold text-sky-900/90">
                現在の天気：
                <span
                  className={`ml-1 font-bold text-sky-950`}
                >
                  {weatherLine ?? 'くもり'}
                </span>
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0">
              {incidentBadge && (
                <span
                  className="inline-flex items-center rounded-full border border-amber-300/90 bg-amber-100/90
                    px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-amber-950 shadow-sm"
                >
                  {incidentBadge}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
