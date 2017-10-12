import * as treemap from './treemap';

export * from './tree';
export {Node} from './treemap';

export function render(container: HTMLElement, node: treemap.Node, options: Partial<treemap.Options>) {
  const tm = new treemap.TreeMap(node, options);
  tm.render(container);
}
