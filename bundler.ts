//import * as fs from 'fs';
declare function require(name: string): any;
const fs = require('fs');

console.log(`var modules = {};
function require(mod) {
    if (/^\\.\\//.test(mod)) mod = mod.substr(2);
    return modules[mod]();
}
`);

function emit(name: string) {
    console.log(`modules["${name}"] = function() {`);
    console.log(`var exports = {};`)
    console.log(fs.readFileSync(`${name}.js`, 'utf8'));
    console.log(`return exports;`);
    console.log('};');
}

console.log(fs.readFileSync(`old/demo/demo.json`, 'utf8'));
emit('treemap');
console.log(fs.readFileSync(`demo.js`, 'utf8'));
