import type { ActionDef, SaveState } from '../types';

const STAT_MAX = 100;

const STYLE = `
#hud-panel-tl {
  position: absolute; top: 16px; left: 16px;
  background: rgba(0,0,0,0.55); border-radius: 10px; padding: 12px 16px;
  min-width: 180px; backdrop-filter: blur(4px);
}
#hud-day {
  font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px;
}
#hud-streaks { font-size: 12px; color: #aaa; }
.hud-streak-row { margin: 2px 0; }
.hud-streak-name { color: #ccc; }
.hud-streak-count { color: #ffd700; font-weight: 600; margin-left: 4px; }

#hud-panel-tr {
  position: absolute; top: 16px; right: 16px;
  background: rgba(0,0,0,0.55); border-radius: 10px; padding: 12px 16px;
  min-width: 200px; backdrop-filter: blur(4px);
}
.hud-stat-row { display: flex; align-items: center; margin: 6px 0; gap: 8px; }
.hud-stat-label { font-size: 11px; color: #aaa; width: 80px; text-transform: uppercase; letter-spacing: 0.5px; }
.hud-bar-bg { flex: 1; height: 8px; background: rgba(255,255,255,0.12); border-radius: 4px; overflow: hidden; }
.hud-bar-fill { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
.hud-bar-health { background: #4ade80; }
.hud-bar-wealth { background: #60a5fa; }
.hud-bar-relationships { background: #f472b6; }
.hud-stat-val { font-size: 11px; color: #ddd; width: 28px; text-align: right; }

#hud-prompt {
  position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.7); border-radius: 8px; padding: 10px 20px;
  font-size: 14px; color: #fff; white-space: nowrap;
  border: 1px solid rgba(255,255,255,0.15); backdrop-filter: blur(4px);
  transition: opacity 0.2s ease;
}
#hud-prompt.hidden { opacity: 0; pointer-events: none; }

@keyframes hud-float-up {
  0%   { transform: translateY(0);    opacity: 1; }
  100% { transform: translateY(-70px); opacity: 0; }
}
.hud-float {
  position: absolute; font-size: 15px; font-weight: 700;
  pointer-events: none; animation: hud-float-up 1.4s ease-out forwards;
  text-shadow: 0 1px 4px rgba(0,0,0,0.8);
}
`;

export class HUDOverlay {
  private readonly dayEl: HTMLElement;
  private readonly streaksEl: HTMLElement;
  private readonly healthFill: HTMLElement;
  private readonly wealthFill: HTMLElement;
  private readonly relFill: HTMLElement;
  private readonly healthVal: HTMLElement;
  private readonly wealthVal: HTMLElement;
  private readonly relVal: HTMLElement;
  private readonly promptEl: HTMLElement;

  constructor(container: HTMLElement, state: SaveState) {
    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = STYLE;
    document.head.appendChild(styleEl);

    container.innerHTML = `
      <div id="hud-panel-tl">
        <div id="hud-day">Day 1</div>
        <div id="hud-streaks"></div>
      </div>
      <div id="hud-panel-tr">
        <div class="hud-stat-row">
          <span class="hud-stat-label">Health</span>
          <div class="hud-bar-bg"><div class="hud-bar-fill hud-bar-health" id="hud-health-fill"></div></div>
          <span class="hud-stat-val" id="hud-health-val">0</span>
        </div>
        <div class="hud-stat-row">
          <span class="hud-stat-label">Wealth</span>
          <div class="hud-bar-bg"><div class="hud-bar-fill hud-bar-wealth" id="hud-wealth-fill"></div></div>
          <span class="hud-stat-val" id="hud-wealth-val">0</span>
        </div>
        <div class="hud-stat-row">
          <span class="hud-stat-label">Social</span>
          <div class="hud-bar-bg"><div class="hud-bar-fill hud-bar-relationships" id="hud-rel-fill"></div></div>
          <span class="hud-stat-val" id="hud-rel-val">0</span>
        </div>
      </div>
      <div id="hud-prompt" class="hidden">[E] to interact</div>
    `;

    this.dayEl = container.querySelector('#hud-day')!;
    this.streaksEl = container.querySelector('#hud-streaks')!;
    this.healthFill = container.querySelector('#hud-health-fill')!;
    this.wealthFill = container.querySelector('#hud-wealth-fill')!;
    this.relFill = container.querySelector('#hud-rel-fill')!;
    this.healthVal = container.querySelector('#hud-health-val')!;
    this.wealthVal = container.querySelector('#hud-wealth-val')!;
    this.relVal = container.querySelector('#hud-rel-val')!;
    this.promptEl = container.querySelector('#hud-prompt')!;

    this.update(state);
  }

  update(state: SaveState): void {
    this.dayEl.textContent = `Day ${state.day}`;

    const { health, wealth, relationships } = state.stats;
    this.healthFill.style.width = `${(health / STAT_MAX) * 100}%`;
    this.wealthFill.style.width = `${(wealth / STAT_MAX) * 100}%`;
    this.relFill.style.width = `${(relationships / STAT_MAX) * 100}%`;
    this.healthVal.textContent = String(Math.round(health));
    this.wealthVal.textContent = String(Math.round(wealth));
    this.relVal.textContent = String(Math.round(relationships));

    // Top 3 non-zero streaks
    const streakEntries = Object.entries(state.streaks)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    if (streakEntries.length === 0) {
      this.streaksEl.textContent = '';
    } else {
      this.streaksEl.innerHTML = streakEntries
        .map(([id, count]) => {
          const name = id.replace(/_/g, ' ');
          return `<div class="hud-streak-row">
            <span class="hud-streak-name">${name}</span>
            <span class="hud-streak-count">🔥 ${count}</span>
          </div>`;
        })
        .join('');
    }
  }

  setPrompt(action: ActionDef | null): void {
    if (action) {
      this.promptEl.textContent = `[E]  ${action.name}`;
      this.promptEl.classList.remove('hidden');
    } else {
      this.promptEl.classList.add('hidden');
    }
  }

  showFloatingText(msg: string, color: string): void {
    const el = document.createElement('div');
    el.className = 'hud-float';
    el.textContent = msg;
    el.style.color = color;
    el.style.left = `${40 + Math.random() * 20}%`;
    el.style.bottom = '120px';
    document.getElementById('hud')?.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}
