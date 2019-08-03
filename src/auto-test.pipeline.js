import {
  compose,
  concat,
  cond,
  filter,
  identity,
  join,
  map,
  mapObjIndexed,
  match,
  replace,
  values,
  prop,
  propEq,
  T,
} from 'ramda';
import {
  fnArgs,
  initArgs,
  wrapIn,
  callFn,
  readFileIntoArray,
  composeLines,
  profileLine,
  seal,
  parseImports,
  mockFns,
  addNameToPrototype,
} from './auto-test.utils';
import { isFunction, fConcat } from './auto-test.helpers';

const fs = require('fs');

export const getFunctionsFromFile = filePath => () =>
  compose(
    filter(isFunction),
    values,
    mapObjIndexed(addNameToPrototype),
  )(require(filePath));

export const createDescribeBlocks = fileName =>
  compose(
    wrapIn('describe', 0, fileName),
    map(fn =>
      wrapIn('describe', 1, fn.prototype.name, [
        wrapIn('it', 2, '', [
          initArgs(fn.length),
          callFn(fn, fnArgs(fn.length)),
        ]),
      ]),
    ),
  );

export const addImports = file =>
  compose(
    fConcat(`\n} from '../${file}';\n\n`),
    concat(`import { `),
    join(''),
    map(fn => `\n  ${fn.prototype.name},`),
  );

export const writeToFile = file => data => {
  const fileType = match(/(\.js)|(\.ts)/, file)[0];
  const fileName = replace(/(\.js)|(\.ts)/, `.test${fileType}`, file);
  fs.writeFileSync(`./__tests__/${fileName}`, data, () => {
    console.log('done');
  });
};

export const createMocks = file => _ =>
  compose(
    join('\n'),
    map(mockFns),
    map(cond([[propEq('type', 'import'), parseImports], [T, identity]])),
    prop('composedLines'),
    composeLines(profileLine, seal),
  )(readFileIntoArray(file));
