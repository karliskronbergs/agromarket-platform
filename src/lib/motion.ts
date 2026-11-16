"use client";

import { useSyncExternalStore } from "react";
import type { Transition } from "motion/react";

// design_handoff_v2/FLUID.md "Motion: springs, not fixed-duration
// animations" -- shared spring presets and helpers, mirroring the
// prototype's spring() helper and Apple's fluid-interfaces guidance.

/** Default spring: critically damped (bounce 0), no overshoot. */
export const springDefault: Transition = { type: "spring", bounce: 0, duration: 0.4 };

/** Momentum spring: a little bounce -- use only after a flick/drag release. */
export const springMomentum: Transition = { type: "spring", bounce: 0.18, duration: 0.4 };

/**
 * Projects where a flick ends up, from its release velocity -- the same
 * exponential-decay formula iOS scroll views use, not v^2/(2*decel).
 */
export function projectMomentum(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Progressive resistance past an edge, instead of a hard stop. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/** Picks the snap point whose value is nearest the projected endpoint. */
export function nearestSnapPoint(projectedValue: number, points: number[]): number {
  return points.reduce((closest, point) =>
    Math.abs(point - projectedValue) < Math.abs(closest - projectedValue) ? point : closest,
  );
}

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Tracks `prefers-reduced-motion`. Components use this to swap a spring
 * slide/scale for a short opacity cross-fade (never no feedback at all).
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** A short cross-fade, used in place of a spring slide/scale under reduced motion. */
export const fadeTransition: Transition = { duration: 0.15, ease: "easeOut" };
