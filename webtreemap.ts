import * as treemap from './treemap';
import * as tree from './tree';

export * from './tree';

export function render(container: HTMLElement, node: tree.Node, options: Partial<treemap.Options>) {
  const tm = new treemap.TreeMap(node, options);
  tm.render(container);
}
