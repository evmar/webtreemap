import * as treemap from './treemap';

declare var kTree: treemap.OldData;

function update() {
    let captions = (document.getElementById('captions') as HTMLInputElement).checked;
    let dom = document.getElementById('tree');
    dom.innerHTML = '';
    treemap.render(dom, kTree, captions ? treemap.newCaptionOptions() : treemap.newOptions());
}
for (const control of document.getElementsByClassName('control') as any as HTMLElement[]) {
    control.onchange = update;
}
update();
