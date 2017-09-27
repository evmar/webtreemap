import * as treemap from '../treemap';
import demoData from './data/states';

let tm: treemap.TreeMap;

const controls = {
  captions: document.getElementById('captions') as HTMLInputElement,
  breadcrumbs: document.getElementById('breadcrumbs'),
};

function getNodesByAddress(node: treemap.Node, address: number[]): treemap.Node[] {
  const nodes: treemap.Node[] = [node];
  for (const i of address) {
    node = node.children![i];
    nodes.push(node);
  }
  return nodes;
}

function hover(this: HTMLElement, e: MouseEvent) {
  let dom: HTMLElement | null = e.target as HTMLElement;
  while (!treemap.isDOMNode(dom)) {
    dom = dom.parentElement;
  }
  if (!dom) return;

  let breadcrumbsDiv = document.getElementById('breadcrumbs')!;
  let address = treemap.getAddress(dom);
  breadcrumbsDiv.innerText = getNodesByAddress(tm.node, address)
    .map(d => d.id)
    .join(' > ');
  e.stopPropagation();
}

function update() {
  let captions = (document.getElementById('captions') as HTMLInputElement)
    .checked;
  let dom = document.getElementById('tree')!;
  dom.innerHTML = '';
  let options: Partial<treemap.Options> = {
    padding: [14, 0, 0, 0],
  };
  if (captions) {
    options.caption = node => node.id;
  }
  tm = new treemap.TreeMap(demoData, options);
  tm.render(dom);
  dom.onmouseover = hover;
}

function init() {
  treemap.addCSS(document.head);
  const controls = (document.getElementsByClassName(
    'control'
  ) as any) as HTMLElement[];
  for (const control of controls) {
    control.onchange = update;
  }
  update();
}

init();
