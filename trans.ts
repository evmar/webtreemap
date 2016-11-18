/**
 * trans translates data from the old format to the new format.
 */
import * as fs from 'fs';
import * as oldapi from './oldapi';

// Wow, you apparently can't slurp stdin synchronously?
// https://github.com/nodejs/node-v0.x-archive/issues/7412
let old: oldapi.OldData = JSON.parse(fs.readFileSync('demo.json', 'utf8'));
console.log(JSON.stringify(oldapi.transform(old)));