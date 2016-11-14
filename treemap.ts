export interface Options {
  getPadding(): [number, number, number, number];
}

export function newOptions(): Options {
  return {
    getPadding() {
      return [0, 0, 0, 0];
    }
  };
}

interface Data {
  data: {
    '$area': number,
  };
  name: string;
  children: Data[];
}

export class TreeMap {
  options: Options;
  construtor(options = newOptions()) { }

  /**
   * Given a list of sizes, the 1-d space available
   * |space|, and a starting rectangle index |start|, compute a span of
   * rectangles that optimizes a pleasant aspect ratio.
   *
   * Returns [end, sum], where end is one past the last rectangle and sum is the
   * 2-d sum of the rectangles' areas.
   */
  private selectSpan(
    sizes: number[], space: number, start: number): { end: number, sum: number } {
    // Add rectangles one by one, stopping when aspect ratios begin to go
    // bad.  Result is [start,end) covering the best run for this span.
    // http://scholar.google.com/scholar?cluster=5972512107845615474
    let smin = sizes[start];  // Smallest seen child so far.
    let smax = smin;          // Largest child.
    let sum = 0;              // Sum of children in this span.
    let lastScore = 0;        // Best score yet found.
    let end = start;
    for (; end < sizes.length; end++) {
      const size = sizes[end];
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
      //                = smax * space * space / (sum * sum)
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
        1 * smax * space * space / (nextSum * nextSum),
        1 * nextSum * nextSum / (smin * space * space));
      // console.log('end', end, 'score', score);
      if (lastScore && score > lastScore) {
        // Including this additional rectangle produces worse squareness than
        // without it.  We're done.
        break;
      }
      lastScore = score;
      sum = nextSum;
    }
    return { end, sum };
  }

  layout(container: HTMLElement, data: Data, width: number, height: number) {
    const total: number = data.data['$area'];
    const children = data.children;
    if (!children) return;
    const sizes = children.map(c => c.data['$area']);

    let x1 = 0, y1 = 0, x2 = width, y2 = height;
    y1 += 14;
    if ((x2 - x1) < 40) return;
    if ((y2 - y1) < 100) return;
    const scale = Math.sqrt(total / ((x2 - x1) * (y2 - y1)));
    function px(x: number) {
      // Rounding here makes the box edges touch better than letting the browser do it.
      return Math.round(x) + 'px';
    }
    var x = x1, y = y1;
    for (let start = 0; start < children.length;) {
      x = x1;
      const space = scale * (x2 - x1);
      const {end, sum} = this.selectSpan(sizes, space, start);
      if (sum / total < 0.1) break;
      height = sum / space;
      for (let i = start; i < end; i++) {
        const size = sizes[i];
        width = size / height;
        const dom = document.createElement('div');
        dom.className = 'webtreemap-node';
        dom.style.left = px(x);
        dom.style.width = px(width / scale);
        dom.style.top = px(y);
        dom.style.height = px(height / scale);
        container.appendChild(dom);

        const caption = document.createElement('div');
        caption.className = 'webtreemap-caption';
        caption.innerText = children[i].name;
        dom.appendChild(caption);

        this.layout(dom, children[i], width / scale, height / scale);

        x += width / scale;
      }
      y += height / scale;
      start = end;
    }
  }
}

export function render(container: HTMLElement, data: any) {
  const treemap = new TreeMap();
  treemap.layout(container, data, container.offsetWidth, container.offsetHeight);
}