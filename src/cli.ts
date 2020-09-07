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

import {Command} from 'commander';
import * as fs from 'fs';
import * as readline from 'readline';

import * as tree from './tree';

/** Reads stdin into an array of lines. */
async function readLines() {
  return new Promise<string[]>((resolve, reject) => {
    const rl = readline.createInterface({input: process.stdin});
    const lines: string[] = [];
    rl.on('line', line => {
      lines.push(line);
    });
    rl.on('close', () => {
      resolve(lines);
    });
  });
}

/** Reads a file to a string. */
async function readFile(path: string) {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(path, {encoding: 'utf-8'}, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

/** Constructs a tree from an array of lines. */
function treeFromLines(lines: string[]): tree.Node {
  const data: Array<[string, number]> = [];
  for (const line of lines) {
    const [, sizeStr, path] = line.match(/(\S+)\s+(.*)/) || ['', '', ''];
    const size = Number(sizeStr);
    data.push([path, size]);
  }
  let node = tree.treeify(data);

  // If there's a common empty parent, skip it.
  if (node.id === undefined && node.children && node.children.length === 1) {
    node = node.children[0];
  }

  // If there's an empty parent, roll up for it.
  if (node.size === 0 && node.children) {
    for (const c of node.children) {
      node.size += c.size;
    }
  }

  tree.rollup(node);
  tree.sort(node);
  tree.flatten(node);

  return node;
}

function plainCaption(n: tree.Node): string {
  return n.id || '';
}

function sizeCaption(n: tree.Node): string {
  return `${n.id || ''} (${n.size})`;
}

function humanSizeCaption(n: tree.Node): string {
  let units = ['', 'k', 'm', 'g'];
  let unit = 0;
  let size = n.size;
  while (size > 1024 && unit < units.length - 1) {
    size = size / 1024;
    unit++;
  }
  return `${n.id || ''} (${size.toFixed(1)}${units[unit]})`;
}

async function main() {
  const args = new Command()
    .description(
      `Generate web-based treemaps.

  Reads a series of
    size path
  lines from stdin, splits path on '/' and outputs HTML for a treemap.
`
    )
    .option('-o, --output [path]', 'output to file, not stdout')
    .option('--title [string]', 'title of output HTML')
    .parse(process.argv);
  const node = treeFromLines(await readLines());
  const treemapJS = await readFile(__dirname + '/../webtreemap.js');
  const title = args.title || 'webtreemap';

  let output = `<!doctype html>
<title>${title}</title>
<style>
html, body {
  height: 100%;
}
body {
  font-family: sans-serif;
  margin: 0;
}
#treemap {
  top: 10px;
  bottom: 10px;
  left: 10px;
  right: 10px;
  position: absolute;
  cursor: pointer;
  -webkit-user-select: none;
}
</style>
<div id='treemap'></div>
<script>const data = ${JSON.stringify(node)}</script>
<script>${treemapJS}</script>
<script>webtreemap.render(document.getElementById("treemap"), data, {
  caption: ${humanSizeCaption},
});</script>
`;
  if (args.output) {
    fs.writeFileSync(args.output, output, {encoding: 'utf-8'});
  } else {
    console.log(output);
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
