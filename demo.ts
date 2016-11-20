import * as treemap from './treemap';
import demoData from './demo-data';

let tm: treemap.TreeMap;

function hover(this: HTMLElement, e: MouseEvent) {
  let breadcrumbsDiv = document.getElementById('breadcrumbs');
  breadcrumbsDiv.innerText = tm.getAddress(this).map(d => d.caption).join(' > ');
  e.stopPropagation();
}

function update() {
  let captions =
      (document.getElementById('captions') as HTMLInputElement).checked;
  let dom = document.getElementById('tree');
  dom.innerHTML = '';
  let options = captions ? treemap.newCaptionOptions() : treemap.newOptions();
  let createNode = options.createNode;
  options.createNode = (data: treemap.Data) => {
    let dom = createNode(data);
    dom.onmouseover = hover;
    return dom;
  };
  tm = new treemap.TreeMap(
      demoData, options);
  tm.render(dom);
}

const controls =
    document.getElementsByClassName('control') as any as HTMLElement[];
for (const control of controls) {
  control.onchange = update;
}
update();
