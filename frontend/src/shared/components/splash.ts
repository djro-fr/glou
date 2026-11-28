// Splash screen (US13). The markup is static in index.html (styles inlined by the
// Vite splash plugin) so it shows before the JS bundle; this module drives the water level
// from the loading progress, then hides it.
// The minimum counts from navigation start (performance.now()), since the splash is visible from then;
// the safety net counts from when this module runs, so a slow JS download doesn't use it up.

/** Minimum display time, so the splash doesn't just flash. */
const MIN_DURATION_MS = 2000;
/**
 * Safety net only: the map page calls markAppReady() once the map is rendered or the API fails,
 * but if the basemap host never answers, MapLibre never fires `load` and the splash would stay forever.
 */
const MAX_DURATION_MS = 15000;
/** Fallback if `transitionend` never fires (pause + fade in Splash.scss is 0.7 s). */
const FADE_FALLBACK_MS = 1000;

/** Water level (translateY of .splash__level, in SVG units): empty and full. Keep in sync with Splash.scss. */
const LEVEL_EMPTY = 140;
const LEVEL_FULL = -6;
/** Rise duration for each loading step, and for the final fill. */
const STEP_RISE_MS = 800;
const FINAL_FILL_MS = 600;
/** Shine fade-in once full (transition in Splash.scss). */
const SHINE_MS = 400;

/** Progress when this module runs (the app JS has arrived). */
const APP_START_PERCENT = 15;

/**
 * Loading steps reported by the map page, weighted from a Slow 4G waterfall.
 * They add up in any order; the last 15 % is the final render (markAppReady).
 */
const STEP_WEIGHTS = {
  maplibre: 35,
  fountains: 10,
  mapLoaded: 25,
} as const;

export type SplashStep = keyof typeof STEP_WEIGHTS;

const splashEl = document.getElementById('splash');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const doneSteps = new Set<SplashStep>();
let ready = false;
let hidden = false;

/** Animates the water level from where it currently is (CSS or a previous step) to `percent`. */
function setLevel(percent: number, duration: number) {
  if (!splashEl || reducedMotion) return;
  const y = LEVEL_EMPTY + ((LEVEL_FULL - LEVEL_EMPTY) * percent) / 100;
  for (const level of splashEl.querySelectorAll<SVGGElement>('.splash__level')) {
    const from = getComputedStyle(level).transform;
    level.animate([{ transform: from }, { transform: `translateY(${y}px)` }], {
      duration,
      easing: 'ease-out',
      fill: 'forwards',
    });
  }
}

function hide() {
  if (hidden) return;
  hidden = true;
  clearTimeout(maxTimer);
  if (!splashEl) return;

  if (reducedMotion) {
    splashEl.remove();
    return;
  }
  // Ignore transitions bubbling from children (e.g. the shine)
  splashEl.addEventListener('transitionend', (e) => {
    if (e.target === splashEl) splashEl.remove();
  });
  setTimeout(() => splashEl.remove(), FADE_FALLBACK_MS);
  splashEl.classList.add('splash--hidden');
}

const maxTimer = setTimeout(hide, MAX_DURATION_MS);
setLevel(APP_START_PERCENT, STEP_RISE_MS);

/** Reports a finished loading step: the water rises accordingly. Each step counts once. */
export function reportProgress(step: SplashStep) {
  if (ready || doneSteps.has(step)) return;
  doneSteps.add(step);
  let percent = APP_START_PERCENT;
  for (const s of doneSteps) percent += STEP_WEIGHTS[s];
  setLevel(percent, STEP_RISE_MS);
}

/**
 * Signals the app is ready: fills the drop, shows the shine, then hides the splash
 * (not before the minimum time). Safe to call several times.
 */
export function markAppReady() {
  if (ready) return;
  ready = true;
  const untilMin = MIN_DURATION_MS - performance.now();

  if (reducedMotion) {
    setTimeout(hide, Math.max(0, untilMin));
    return;
  }
  setLevel(100, FINAL_FILL_MS);
  setTimeout(() => splashEl?.classList.add('splash--full'), FINAL_FILL_MS);
  setTimeout(hide, Math.max(FINAL_FILL_MS + SHINE_MS, untilMin));
}
