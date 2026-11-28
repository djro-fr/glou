// Splash screen (US13): shown on the first load of the app only.
// Module-level state, so client-side navigation never brings it back.

/** Minimum display time, so the splash doesn't just flash. */
const MIN_DURATION_MS = 800;
/** Maximum display time, so a slow or failed load never blocks the app. */
const MAX_DURATION_MS = 5000;

export const splash = $state({ visible: true });

const startedAt = performance.now();
let ready = false;

function hide() {
  splash.visible = false;
  clearTimeout(maxTimer);
}

const maxTimer = setTimeout(hide, MAX_DURATION_MS);

/** Signals the app is ready; hides the splash once the minimum time is reached. Safe to call several times. */
export function markAppReady() {
  if (ready) return;
  ready = true;
  const remaining = MIN_DURATION_MS - (performance.now() - startedAt);
  if (remaining > 0) {
    setTimeout(hide, remaining);
  } else {
    hide();
  }
}
