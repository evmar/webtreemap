import * as treemap from './treemap';

/**
 * This file implements the "old" webtreemap API, which provided a single
 * "appendTreemap" function on window.
 */

/** OldData is the shape of the old data format. */
export interface OldData {
  data: {$area: number;};
  name: string;
  children?: OldData[];
}

/** transform transforms the old data format to the new one. */
export function transform(old: OldData): treemap.Node {
  return {
    id: old.name,
    size: old.data['$area'],
    children: old.children ? old.children.map(transform) : undefined,
  };
}

/** render implements the backward-compatible API. */
export function render(container: HTMLElement, oldData: OldData) {
  const tm = new treemap.TreeMap(transform(oldData), {});
  tm.render(container);
}
