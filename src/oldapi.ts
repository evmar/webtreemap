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

import {Node} from './tree';
import * as treemap from './treemap';

/**
 * This file implements the "old" webtreemap API, which provided a single
 * "appendTreemap" function on window.
 */

/** OldData is the shape of the old data format. */
export interface OldData {
  data: {$area: number};
  name: string;
  children?: OldData[];
}

/** transform transforms the old data format to the new one. */
export function transform(old: OldData): Node {
  return {
    id: old.name,
    size: old.data['$area'],
    children: old.children ? old.children.map(transform) : undefined,
  };
}

/** render implements the backward-compatible API. */
export function render(container: HTMLElement, oldData: OldData) {
  const tm = new treemap.TreeMap(transform(oldData), {});
  tm.render(container);
}
