/* Drive module for engines/capture.mjs: flies the live Bike Logger page through the reel's shots.
 *
 *   node engines/capture.mjs https://murathanyildirim.com/bike-logger /tmp/bl-frames \
 *     --duration 28 --size 540x960 --scale 2 --drive productions/bike-logger/REEL-001-kit/capture/drive.mjs
 *
 * 540×960 CSS px at 2x = 1080×1920 output, and the site uses its phone layout (< 860 px).
 * The site's own captions are hidden; the composition adds the kit copy on top.
 */

// [video time s, scene position s]. Scene s = chapter index + progress
// (1 bike, 2 box, 3 camera, 4 distance, 5 wheel, 6 lean, 7 replay, 8 specs).
// Linear between keys; the site's own smoothing eases the transitions.
// Copy timing lives in BEATS in ../composition/index.html: change both together.
export const SHOTS = [
  [0.0, 0.2], [3.0, 1.2],      // lights on
  [3.6, 1.5], [7.4, 2.75],     // box opens, tray rises
  [8.0, 3.1], [10.6, 3.65],    // camera view cone
  [11.2, 3.95], [15.2, 4.98],  // car overtakes, ultrasonic pings
  [15.8, 5.25], [18.2, 5.75],  // wheel + hall sensor
  [18.8, 6.25], [21.2, 6.75],  // lean
  [21.8, 7.25], [24.4, 7.85],  // replay timeline
  [25.4, 8.3], [28.0, 8.42],   // hero for the end card (past ~8.5 the ground shows a hard edge)
];

function sceneAt(t) {
  if (t <= SHOTS[0][0]) return SHOTS[0][1];
  for (let i = 0; i < SHOTS.length - 1; i++) {
    const [t0, s0] = SHOTS[i], [t1, s1] = SHOTS[i + 1];
    if (t <= t1) return s0 + (s1 - s0) * (t - t0) / (t1 - t0);
  }
  return SHOTS[SHOTS.length - 1][1];
}

// Scene position -> scrollY (inverse of the page's scrollS()), and the replay card's opacity:
// the card scrolls up through the frame after its chapter, so it fades out first.
async function go(page, s) {
  await page.evaluate((s) => {
    const secs = [...document.querySelectorAll("main > section")];
    const i = Math.min(secs.length - 1, Math.floor(s));
    const y = Math.max(0, secs[i].offsetTop + (s - i) * secs[i].offsetHeight - innerHeight * 0.5);
    document.querySelector(".replay").style.opacity = Math.max(0, Math.min(1, (7.95 - s) / 0.1));
    window.scrollTo(0, y);
  }, s);
}

export async function setup(page) {
  await page.addStyleTag({ content: `
    .card > :not(.replay), #rail { visibility: hidden !important; }
    .replay { visibility: visible; }
    .specs .inner { visibility: hidden !important; }
  ` });
  // Settle at the first position so the smoothed camera has converged. Step at 1/60 s: the site
  // times 90 frames after t = 1.5 s and drops to 1.5x resolution if they average over 1/40 s,
  // which 1/30 s steps always do (the original capture was soft from 1.5 s on because of it).
  for (let i = 0; i < 300; i++) {
    await go(page, sceneAt(0));
    await page.evaluate(() => window.__step(1 / 60));
  }
  await checkResolution(page);
}

export async function frame(page, t) {
  await go(page, sceneAt(t));
  if (t > 0 && Math.abs(t % 5) < 1e-6) await checkResolution(page);
}

// The 3D canvas must render at device resolution (1080 px wide at 540 CSS px, 2x).
async function checkResolution(page) {
  const [w, css, dpr] = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    return [c.width, c.clientWidth, devicePixelRatio];
  });
  if (w < css * dpr) throw new Error(`3D canvas is ${w} px wide, expected ${css * dpr}: the site lowered its resolution`);
}
