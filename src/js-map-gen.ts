import fs from 'fs';
import { execSync } from 'child_process';
import { basename } from 'path';
import { safeLoad } from 'js-yaml';
import { sync as glob } from 'glob';

const friends = glob(`${__dirname}/../yml/{en,es}/*.yml`)
  .map((path) => [
    path.includes(`/es/`) ? `es` : `en`,
    basename(path).replace(/\.yml$/, ``),
    fs.readFileSync(path, `utf-8`),
  ])
  .map(([lang, friendSlug, yml]) => [lang, `${lang}/${friendSlug}`, safeLoad(yml)])
  .map(([lang, key, friend]: any) => [key, { lang, ...friend }]);

const mapJson = JSON.stringify(friends, null, 2);
const mapCode = [
  `/* eslint-disable */`,
  `// prettier_ignore`,
  `import { FriendData } from './types';`,
  ``,
  `// prettier_ignore`,
  `const map = new Map(${mapJson});`,
  ``,
  `export default (map as unknown) as Map<string, FriendData>;`,
  ``,
].join(`\n`);

const mapPath = `${__dirname}/js-friend-map.ts`;
fs.writeFileSync(mapPath, mapCode);
execSync(`prettier --write ${mapPath}`);
const firstPass = fs.readFileSync(mapPath, `utf-8`);
fs.writeFileSync(mapPath, firstPass.replace(/prettier_ignore/g, `prettier-ignore`));
