import * as fs from 'fs';
import * as readline from 'readline';
import * as tree from './tree';

const template = `<!doctype html>
<style>
body {
  font-family: sans-serif;
}
#treemap {
  width: 800px;
  height: 600px;
}
</style>
<div id='treemap'></div>
`;

/** Reads stdin into an array of lines. */
async function readLines() {
  return new Promise<string[]>((resolve, reject) => {
    const rl = readline.createInterface({input: process.stdin});
    const lines: string[] = [];
    rl.on('line', (line) => {
      lines.push(line);
    });
    rl.on('close', () => {
      resolve(lines);
    });
  });
}

/** Constructs a tree from an array of lines. */
function treeFromLines(lines: string[]): tree.Node {
  const data: Array<[string, number]> = [];
  for (const line of lines) {
    const [sizeStr, path] = line.split(/\s+/);
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
  const node = treeFromLines(await readLines());
  console.log(template);
  console.log(`<script>const data = ${JSON.stringify(node)}</script>`);
  console.log('<script>' + fs.readFileSync('dist/webtreemap.js') + '</script>');
  console.log(
      `<script>webtreemap.render(document.getElementById("treemap"), data, {
  caption: ${humanSizeCaption},
});</script>`);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
