/**
 * Node is the expected shape of input data.
 */
export interface Node {
  /**
   * id is optional but can be used to identify each node.
   * It should be unique among nodes at the same level.
   */
  id?: string;
  /** size should be >= the sum of the children's size. */
  size: number;
  /** children should be sorted by size in descending order. */
  children?: Node[];
  /** dom node will be created and associated with the data. */
  dom?: HTMLElement;
}

const CSS_PREFIX = 'webtreemap-';
const NODE_CSS_CLASS = CSS_PREFIX + 'node';

const DEFAULT_CSS = `	
.webtreemap-node {
  cursor: pointer;
  position: absolute;
  border: solid 1px #666;
  box-sizing: border-box;
  overflow: hidden;
  background: white;
  transition: left .15s, top .15s, width .15s, height .15s;
}

.webtreemap-node:hover {
  background: #ddd;
}

.webtreemap-caption {
  font-size: 10px;
  text-align: center;
}
`;
export function addCSS(parent: HTMLElement) {
  const style = document.createElement('style');
  style.innerText = DEFAULT_CSS;
  parent.appendChild(style);
}

export function isDOMNode(e: Element): boolean {
  return e.classList.contains(NODE_CSS_CLASS);
}

/**
 * Options is the set of user-provided webtreemap configuration.
 */
export interface Options {
  padding: [number, number, number, number];
  caption?(node: Node): string;
  showNode(node: Node, width: number, height: number): boolean;
  showChildren(node: Node, width: number, height: number): boolean;
}

/**
 * get the index of this node in its parent's children list.
 * O(n) but we expect n to be small.
 */
function getNodeIndex(target: Element): number {
  let index = 0;
  let node: Element | null = target;
  while ((node = node.previousElementSibling)) {
    if (isDOMNode(node)) index++;
  }
  return index;
}

function px(x: number) {
  // Rounding when computing pixel coordinates makes the box edges touch
  // better than letting the browser do it, because the browser has lots of
  // heuristics around handling non-integer pixel coordinates.
  return Math.round(x) + 'px';
}

function defaultOptions(options: Partial<Options>): Options {
  const opts = {
    padding: options.padding || [options.caption ? 14 : 2, 2, 2, 2],
    caption: options.caption,
    showNode:
      options.showNode ||
      ((node: Node, width: number, height: number): boolean => {
        return width > 20 && height >= opts.padding[0];
      }),
    showChildren:
      options.showChildren ||
      ((node: Node, width: number, height: number): boolean => {
        return width > 40 && height > 40;
      }),
  };
  return opts;
}

export class TreeMap {
  private readonly options: Options;
  constructor(private node: Node, options: Partial<Options>) {
    this.options = defaultOptions(options);
  }

  createDOM(node: Node): HTMLElement {
    const dom = document.createElement('div');
    dom.className = NODE_CSS_CLASS;
    if (this.options.caption) {
      const caption = document.createElement('div');
      caption.className = CSS_PREFIX + 'caption';
      caption.innerText = this.options.caption(node);
      dom.appendChild(caption);
    }
    return dom;
  }

  /**
   * Given a list of sizes, the 1-d space available
   * |space|, and a starting rectangle index |start|, compute a span of
   * rectangles that optimizes a pleasant aspect ratio.
   *
   * Returns [end, sum], where end is one past the last rectangle and sum is the
   * 2-d sum of the rectangles' areas.
   */
  private selectSpan(
    children: Node[],
    space: number,
    start: number
  ): {end: number; sum: number} {
    // Add rectangles one by one, stopping when aspect ratios begin to go
    // bad.  Result is [start,end) covering the best run for this span.
    // http://scholar.google.com/scholar?cluster=5972512107845615474
    let smin = children[start].size; // Smallest seen child so far.
    let smax = smin; // Largest child.
    let sum = 0; // Sum of children in this span.
    let lastScore = 0; // Best score yet found.
    let end = start;
    for (; end < children.length; end++) {
      const size = children[end].size;
      if (size < smin) smin = size;
      if (size > smax) smax = size;

      // Compute the relative squariness of the rectangles with this
      // additional rectangle included.
      const nextSum = sum + size;

      // Suppose you're laying out along the x axis, so "space"" is the
      // available width.  Then the height of the span of rectangles is
      //   height = sum/space
      //
      // The largest rectangle potentially will be too wide.
      // Its width and width/height ratio is:
      //   width = smax / height
      //   width/height = (smax / (sum/space)) / (sum/space)
      //                = (smax * space * space) / (sum * sum)
      //
      // The smallest rectangle potentially will be too narrow.
      // Its width and height/width ratio is:
      //   width = smin / height
      //   height/width = (sum/space) / (smin / (sum/space))
      //                = (sum * sum) / (smin * space * space)
      //
      // Take the larger of these two ratios as the measure of the
      // worst non-squarenesss.
      const score = Math.max(
        smax * space * space / (nextSum * nextSum),
        nextSum * nextSum / (smin * space * space)
      );
      if (lastScore && score > lastScore) {
        // Including this additional rectangle produces worse squareness than
        // without it.  We're done.
        break;
      }
      lastScore = score;
      sum = nextSum;
    }
    return {end, sum};
  }

  private layout(node: Node, level: number, width: number, height: number) {
    const total: number = node.size;
    const children = node.children;
    if (!children) return;

    let x1 = 0,
      y1 = 0,
      x2 = width,
      y2 = height;

    const spacing = 0; // TODO: this.options.spacing;
    const padding = this.options.padding;
    y1 += padding[0];
    x2 -= padding[1];
    y2 -= padding[2];
    x1 += padding[3];

    let i: number = 0;
    if (this.options.showChildren(node, x2 - x1, y2 - y1)) {
      const scale = Math.sqrt(total / ((x2 - x1) * (y2 - y1)));
      var x = x1,
        y = y1;
      children: for (let start = 0; start < children.length; ) {
        x = x1;
        const space = scale * (x2 - x1);
        const {end, sum} = this.selectSpan(children, space, start);
        if (sum / total < 0.1) break;
        const height = sum / space;
        const heightPx = height / scale;
        for (i = start; i < end; i++) {
          const child = children[i];
          const size = child.size;
          const width = size / height;
          const widthPx = Math.round(width / scale);
          if (
            !this.options.showNode(child, widthPx - spacing, heightPx - spacing)
          ) {
            break children;
          }
          const dom = child.dom || this.createDOM(child);
          const style = dom.style;
          style.left = px(x);
          style.width = px(widthPx - spacing);
          style.top = px(y);
          style.height = px(heightPx - spacing);
          if (!child.dom) {
            child.dom = dom;
            node.dom!.appendChild(child.dom);
          }

          // We lose 2px due to the border.
          this.layout(child, level + 1, widthPx - 2, heightPx - 2);

          // -1 so inner borders overlap.
          x += widthPx - 1;
        }
        // -1 so inner borders overlap.
        y += heightPx - 1;
        start = end;
      }
    }
    // Remove the DOM for any children we didn't visit.
    // These can be created if we zoomed in then out.
    for (; i < children.length; i++) {
      if (!children[i].dom) break;
      children[i].dom!.parentNode!.removeChild(children[i].dom!);
      children[i].dom = undefined;
    }
  }

  render(container: HTMLElement) {
    this.node.dom = this.createDOM(this.node);
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    this.node.dom.onclick = e => {
      let node: HTMLElement | null = e.target as HTMLElement;
      while (!isDOMNode(node)) {
        node = node.parentElement;
        if (!node) return;
      }
      let address = this.getAddress(node);
      this.zoom(address);
    };
    this.node.dom.style.width = width + 'px';
    this.node.dom.style.height = height + 'px';
    container.appendChild(this.node.dom);
    this.layout(this.node, 0, width, height);
  }

  getAddress(node: HTMLElement): number[] {
    let address: number[] = [];
    let n: HTMLElement | null = node;
    while (n && isDOMNode(n)) {
      address.unshift(getNodeIndex(n));
      n = n.parentElement;
    }
    address.shift(); // The first element will be the root, index 0.
    return address;
  }

  getNodeByAddress(address: number[]): Node[] {
    let data = this.node;
    const datas: Node[] = [data];
    for (const i of address) {
      data = data.children![i];
      datas.push(data);
    }
    return datas;
  }

  zoom(address: number[]) {
    let data = this.node;
    const [padTop, padRight, padBottom, padLeft] = this.options.padding;

    let width = data.dom!.offsetWidth;
    let height = data.dom!.offsetHeight;
    for (const index of address) {
      width -= padLeft + padRight + 2;
      height -= padTop + padBottom + 2;

      if (!data.children) throw new Error('bad address');
      for (const c of data.children) {
        if (c.dom) c.dom.style.zIndex = '0';
      }
      data = data.children[index];
      const style = data.dom!.style;
      style.zIndex = '1';
      style.left = px(padLeft);
      style.width = px(width);
      style.top = px(padTop);
      style.height = px(height);
    }
    this.layout(data, 0, width, height);
  }
}
