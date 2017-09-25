import {Node} from './treemap';

/**
 * treeify converts an array of [path, size] pairs into a tree.
 * Paths are /-delimited ids.
 */
export function treeify(data: Array<[string, number]>): Node {
  const tree: Node = {size: 0};
  for (const [path, size] of data) {
    const parts = path.split('/');
    let t = tree;
    while (parts.length > 0) {
      const id = parts.shift();
      if (!t.children) t.children = [];
      let child = t.children.find(c => c.id === id);
      if (!child) {
        child = {id: id, size: 0};
        t.children.push(child);
      } else {
        if (parts.length === 0) {
          throw new Error(`duplicate path ${path}`);
        }
      }
      t = child;
    }
  }
  return tree;
}

/**
 * rollup fills in the size attribute for nodes by summing their children.
 *
 * Note that it's legal for input data to have a node with a size larger
 * than the sum of its children, perhaps because some data was left out.
 */
export function rollup(n: Node) {
  if (!n.children) return;
  n.size = 0;
  for (const c of n.children) {
    rollup(c);
    n.size += c.size;
  }
}

/**
 * sort sorts a tree by size, descending.
 */
export function sort(n: Node) {
  if (!n.children) return;
  for (const c of n.children) {
    sort(c);
  }
  n.children.sort((a, b) => b.size - a.size);
}
