import * as treemap from '../treemap';
import demoData from './data/states';

let tm: treemap.TreeMap;

const controls = {
  captions: document.getElementById('captions') as HTMLInputElement,
  breadcrumbs: document.getElementById('breadcrumbs'),
};

function hover(this: HTMLElement, e: MouseEvent) {
  let dom: HTMLElement | null = e.target as HTMLElement;
  while (!treemap.isDOMNode(dom)) {
    dom = dom.parentElement;
  }
  if (!dom) return;

  let breadcrumbsDiv = document.getElementById('breadcrumbs')!;
  let address = tm.getAddress(dom);
  breadcrumbsDiv.innerText = tm
    .getNodeByAddress(address)
    .map(d => d.id)
    .join(' > ');
  e.stopPropagation();
}

function update() {
  let captions = (document.getElementById('captions') as HTMLInputElement)
    .checked;
  let dom = document.getElementById('tree')!;
  dom.innerHTML = '';
  let options: Partial<treemap.Options> = {};
  if (captions) {
    options.caption = node => node.id;
  }
  tm = new treemap.TreeMap(demoData, options);
  tm.render(dom);
  dom.onmouseover = hover;
}

function init() {
  const controls = (document.getElementsByClassName(
    'control'
  ) as any) as HTMLElement[];
  for (const control of controls) {
    control.onchange = update;
  }
  update();
}

init();
