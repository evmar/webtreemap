import * as treemap from './treemap';
import demoData from './demo-data';

function update() {
  let captions =
      (document.getElementById('captions') as HTMLInputElement).checked;
  let dom = document.getElementById('tree');
  dom.innerHTML = '';
  treemap.render(
      dom, demoData,
      captions ? treemap.newCaptionOptions() : treemap.newOptions());
}

const controls =
    document.getElementsByClassName('control') as any as HTMLElement[];
for (const control of controls) {
  control.onchange = update;
}
update();
