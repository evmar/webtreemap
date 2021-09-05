import path from 'path';
import {promises as fs, statSync} from 'fs';

import { ProcessorFn } from "../util";

// Adapted from https://stackoverflow.com/a/45130990/388951
async function getFiles(dir: string): Promise<[string, number][]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map(async (dirent) => {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      return getFiles(res);
    }
    const stat = statSync(res);
    return [[res, stat.size]] as [string, number][];
  }));
  return Array.prototype.concat(...files);
}

export const processDir: ProcessorFn = async args => {
  return (await Promise.all(args.map(getFiles))).flat();
};
