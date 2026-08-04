import type { ActionDefinition } from "./action-models";
import { pathzyActionRegistry } from "./action-registry";

export function dependencyGraph(actions: ActionDefinition[] = pathzyActionRegistry) {
  return Object.fromEntries(actions.map((action) => [action.code, Array.from(new Set([...action.prerequisites, ...action.blockedByActionCodes]))]));
}

export function findDependencyCycles(actions: ActionDefinition[] = pathzyActionRegistry) {
  const graph = dependencyGraph(actions);
  const cycles: string[][] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(code: string, path: string[]) {
    if (visiting.has(code)) {
      cycles.push([...path.slice(path.indexOf(code)), code]);
      return;
    }
    if (visited.has(code)) return;
    visiting.add(code);
    for (const dependency of graph[code] ?? []) visit(dependency, [...path, dependency]);
    visiting.delete(code);
    visited.add(code);
  }

  for (const action of actions) visit(action.code, [action.code]);
  return cycles;
}

export function unmetActionDependencies(action: ActionDefinition, completed: Set<string>) {
  return Array.from(new Set([...action.prerequisites, ...action.blockedByActionCodes])).filter((code) => !completed.has(code));
}
