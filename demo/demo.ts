/**
 * Copyright 2019 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as treemap from '../src';
import {Node} from '../src';
import demoData from './data/states';

let tm: treemap.TreeMap;

const controls = {
  captions: document.getElementById('captions') as HTMLInputElement,
  breadcrumbs: document.getElementById('breadcrumbs'),
};

function getNodesByAddress(node: Node, address: number[]): Node[] {
  const nodes: Node[] = [node];
  for (const i of address) {
    node = node.children![i];
    nodes.push(node);
  }
  return nodes;
}

function hover(e: MouseEvent) {
  let dom: HTMLElement | null = e.target as HTMLElement;
  while (dom && !treemap.isDOMNode(dom)) {
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
    options.caption = node => node.id || '';
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
