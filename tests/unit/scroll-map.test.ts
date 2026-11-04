import { describe, expect, it } from 'vitest';
import {
  ANCHORS,
  REST_POINTS,
  SCENES,
  TOTAL_VH,
  beatAt,
  formatYear,
  sceneAt,
  yearAt,
} from '../../src/scenes/registry';

describe('scroll map', () => {
  it('runs from 0 to 1,100 vh with no gaps or overlaps', () => {
    expect(SCENES[0]!.from).toBe(0);
    expect(TOTAL_VH).toBe(1100);
    SCENES.forEach((scene, i) => {
      expect(scene.to).toBeGreaterThan(scene.from);
      if (i > 0) expect(scene.from).toBe(SCENES[i - 1]!.to);
    });
  });

  it('alternates acts and transitions, newest era first', () => {
    expect(SCENES.map((s) => s.kind)).toEqual([
      'act',
      'transition',
      'act',
      'transition',
      'act',
      'transition',
      'act',
    ]);
    expect(SCENES.filter((s) => s.kind === 'act').map((s) => s.era)).toEqual([
      '2099',
      '1999',
      '1888',
      '1350',
    ]);
  });

  it('keeps every beat inside its scene, with unique ids', () => {
    for (const scene of SCENES) {
      const ids = scene.beats.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const beat of scene.beats) {
        expect(beat.from).toBeGreaterThanOrEqual(scene.from);
        expect(beat.to).toBeLessThanOrEqual(scene.to);
        if (beat.rest !== undefined) {
          expect(beat.rest).toBeGreaterThanOrEqual(beat.from);
          expect(beat.rest).toBeLessThanOrEqual(beat.to);
        }
      }
    }
  });

  it('shows no content during transitions: rest points live only in acts', () => {
    for (const rest of REST_POINTS) {
      expect(SCENES.find((s) => s.id === rest.scene)!.kind).toBe('act');
    }
  });

  it('lists rest points in scroll order, each one beat apart', () => {
    const vhs = REST_POINTS.map((r) => r.vh);
    expect(vhs).toEqual([...vhs].sort((a, b) => a - b));
    expect(new Set(vhs).size).toBe(vhs.length);
  });

  it('maps every deep link in the spec to a rest point', () => {
    expect(ANCHORS).toEqual({ top: 0, works: 300, engine: 640, origin: 960, contact: 1080 });
  });

  it('finds the scene and beat under a scroll position', () => {
    expect(sceneAt(0).id).toBe('act-2099');
    expect(sceneAt(150).id).toBe('shatter');
    expect(sceneAt(1100).id).toBe('act-1350');
    expect(beatAt(300)?.id).toBe('project-1');
    expect(beatAt(640)?.id).toBe('overview');
  });
});

describe('gauge year readout', () => {
  it('starts at 2099.00 and ticks down as scrolling begins', () => {
    expect(formatYear(0)).toBe('2099.00');
    expect(formatYear(10)).toBe('2098.97');
  });

  it('lands on each era year at the start of its act and ends at 1350', () => {
    expect(yearAt(250)).toBe(1999);
    expect(yearAt(600)).toBe(1888);
    expect(yearAt(900)).toBe(1350);
    expect(yearAt(1100)).toBe(1350);
  });

  it('never runs forward in time', () => {
    for (let vh = 1; vh <= TOTAL_VH; vh++) expect(yearAt(vh)).toBeLessThanOrEqual(yearAt(vh - 1));
  });
});
