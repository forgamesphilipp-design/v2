// FILE: src/entities/quiz/mapContext.ts

import type { QuizTarget } from "./model";
import { levelOfGeoId, type GeoLevel } from "../geo/ids";

/**
 * Liefert die Map-Konfiguration für eine Quiz-Frage.
 *
 * Grundprinzip:
 * - gefragt ist immer das LETZTE Element der path[] (answerId)
 * - scopeId ist der Parent-Knoten (damit die Karte die richtigen Shapes zeigt)
 * - level entspricht dem scope (country/canton/district/community)
 *
 * Beispiele:
 * - path ["1"]                       -> scope "ch"       level "country"  answerId "1"
 * - path ["1","d-1-110"]             -> scope "1"        level "canton"   answerId "d-1-110"
 * - path ["1","d-1-110","m-1-261"]   -> scope "d-1-110"  level "district" answerId "m-1-261"
 */
export function computeMapContext(
  target: QuizTarget | null,
  fallbackStartScopeId: string
): { scopeId: string; level: GeoLevel; answerId: string } {
  // fallback: show base scope (usually "ch")
  const startScope = String(fallbackStartScopeId || "ch");

  if (!target || !Array.isArray(target.path) || target.path.length === 0) {
    return { scopeId: startScope, level: (levelOfGeoId(startScope) ?? "country") as GeoLevel, answerId: "" };
  }

  const path = target.path.map(String);

  const answerId = path[path.length - 1] ?? "";
  const parentScopeId = path.length >= 2 ? path[path.length - 2] : startScope;

  // Map level is determined by the scopeId (parent node), not the answerId.
  // scope "ch" -> level "country"
  // scope "<cantonId>" -> level "canton"
  // scope "d-..." -> level "district"
  // scope "m-..." -> level "community" (selten im Quiz, aber korrekt)
  const lvl = (levelOfGeoId(parentScopeId) ?? "country") as GeoLevel;

  return { scopeId: parentScopeId, level: lvl, answerId };
}
