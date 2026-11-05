import { smooth, toPath, wavyRing, type Point } from '../geometry';

/**
 * The prologue's hands: held out toward the viewer, palms up and cupped together under the
 * light (storyboard P1). Drawn in a 960×540 frame; only the palms catch the light, the
 * forearms recede into darkness. These are the storyboard's points, smoothed.
 */
const SCALE = 1.45;
const CX = 480;
const CY = 370;
const place = ([x, y]: Point): Point => [CX + (x - CX) * SCALE, CY + (y - CY) * SCALE];
const mirror = ([x, y]: Point): Point => [960 - x, y];

const FINGERTIPS: readonly Point[] = [
  [470, 422],
  [451, 427],
  [431, 429],
  [411, 425],
];

function leftHand(): Point[] {
  const points: Point[] = [
    [392, 318],
    [452, 312],
    [474, 330],
    [480, 360],
    [479, 396],
  ];
  for (const [cx, cy] of FINGERTIPS) {
    for (const deg of [0, 45, 90, 135, 180]) {
      const a = (deg * Math.PI) / 180;
      points.push([cx + 10 * Math.cos(a), cy + 10 * Math.sin(a)]);
    }
  }
  points.push([392, 414], [374, 398], [366, 378], [370, 356], [380, 334]);
  return points;
}

const CREASES: readonly (readonly Point[])[] = [
  [
    [404, 362],
    [432, 352],
    [466, 364],
  ], // across the palm
  [
    [380, 404],
    [384, 372],
    [398, 346],
  ], // the thumb's inner edge
  [
    [394, 324],
    [424, 318],
    [452, 318],
  ], // the wrist
  ...FINGERTIPS.slice(0, 3).map(([cx, cy]): Point[] => [
    [cx - 10, cy - 2],
    [cx - 9, cy - 16],
  ]), // between the fingers
];

const FOREARM: readonly Point[] = [
  [392, 318],
  [452, 312],
  [440, 196],
  [404, 200],
];

/** Where the light floats, just above the cupped palms. */
export const LIGHT = { x: 480, y: 338 } as const;
/** The frame the SVG shows: the hands, the light and some darkness around them. */
export const VIEWBOX = { x: 240, y: 100, width: 480, height: 400 } as const;

export function palmShapes() {
  const left = smooth(leftHand(), true, 4).map(place);
  const right = left.map(mirror);
  const forearmLeft = FOREARM.map(place);
  return {
    palms: toPath(left, true) + toPath(right, true),
    forearms: [toPath(forearmLeft, true), toPath(forearmLeft.map(mirror), true)],
    creases: CREASES.flatMap((line) => {
      const pts = smooth(line, false, 6).map(place);
      return [toPath(pts), toPath(pts.map(mirror))];
    }),
    hintRing: wavyRing(LIGHT.x, LIGHT.y, 34, 2.5, 7),
  };
}
