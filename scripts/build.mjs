import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate } from './validate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = path.resolve(process.argv[2] || path.join(root, 'data/course.json'));
const output = path.resolve(process.argv[3] || path.join(root, 'index.html'));
const data = JSON.parse(fs.readFileSync(input, 'utf8').replace(/^\uFEFF/, ''));
validate(data);
const json = JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const template = fs.readFileSync(path.join(root, 'assets/template.html'), 'utf8');
if (template.split('__COURSE_JSON__').length !== 2) throw Error('Template must contain exactly one course placeholder');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, template.replace('__COURSE_JSON__', () => json));
console.log(`Built ${output}: ${data.modules.length} modules, ${data.questions.length} questions.`);
