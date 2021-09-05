import {promises as fs} from 'fs';
import * as readline from 'readline';
import * as tmp from 'tmp';

/** Write contents (utf-8 encoded) to a temp file, returning the path to the file. */
export async function writeToTempFile(contents: string): Promise<string> {
  const filename = tmp.tmpNameSync({prefix: 'webtreemap', postfix: '.html'});
  await fs.writeFile(filename, contents, {encoding: 'utf-8'});
  return filename;
}

/** Read from a list of files, concatenating the contents with newlines */
export async function readFromFiles(files: readonly string[]) {
  let out: string = '';
  for (const file of files) {
    if (out) {
      out += '\n';
    }
    out += await fs.readFile(file, 'utf-8');
  }
  return out;
}

/** Reads stdin into a string */
export async function readFromStdin() {
  return new Promise<string>((resolve, reject) => {
    const rl = readline.createInterface({input: process.stdin});
    const lines: string[] = [];
    rl.on('line', line => {
      lines.push(line);
    });
    rl.on('close', () => {
      resolve(lines.join('\n'));
    });
  });
}

export async function collectInputFromArgs(args: readonly string[]): Promise<string> {
  return args.length > 0
    ? readFromFiles(args)
    : readFromStdin();
}

export type ProcessorFn = (args: readonly string[]) => Promise<[string, number][]>;
