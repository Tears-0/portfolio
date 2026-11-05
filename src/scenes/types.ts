import type { SceneDef } from './registry';

export interface SceneContext {
  /** The scene's layer inside the pinned stage. */
  layer: HTMLElement;
  scene: SceneDef;
}

/**
 * Every act and transition is a module with this shape. The engine mounts it when it
 * loads, adds its timeline to the master timeline at the scene's vh range (positions are
 * in vh, relative to the scene's start), and unmounts it when it is no longer needed.
 */
export interface SceneModule {
  mount(ctx: SceneContext): void;
  timeline(ctx: SceneContext): gsap.core.Timeline;
  unmount(ctx: SceneContext): void;
}
