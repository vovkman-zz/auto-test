import {
  always,
  append,
  clone,
  compose,
  curry,
  evolve,
  flatten,
  identity,
  ifElse,
  init,
  join,
  last,
  map,
  o,
  prop,
  propEq,
  reduce,
  replace,
  slice,
  split,
  test,
  trim,
  assoc,
  converge,
} from 'ramda';
import {
  tab,
  j,
  imap,
  array,
  bt,
  arg,
  log,
  readFile,
  ireduce,
  importRegex,
  jestFnKey,
  wrapObj,
} from './auto-test.helpers';

export const fnArgs = numArgs =>
  o(
    j,
    imap((_, i) => `${arg(_, i)}${bt(i, numArgs - 1) ? ', ' : ''}`),
    array(numArgs),
  );

export const initArgs = numArgs =>
  imap((_, i) => `const ${arg(_, i)} = {};\n`, array(numArgs));

export const callFn = (fn, args, resName = 'result', type = 'const') =>
  `${type} ${resName} = ${fn.name}(${args});`;

export const wrapIn = curry(
  (type, level, title, content) =>
    `${type}('${title}', () => {\n${tab(level + 1)}${join(tab(level + 1))(
      flatten(content),
    )}\n${tab(level)}});\n`,
);

export const composeLines = (profileLineFn, sealFn) =>
  ireduce(
    (fileMeta, line, lineIndex) => {
      const lineProfile = profileLineFn(line, lineIndex);
      fileMeta.lineProfiles = append(lineProfile, fileMeta.lineProfiles);
      if (lineProfile.open) {
        fileMeta.sealingFns = append(sealFn(lineProfile), fileMeta.sealingFns);
      }
      if (lineProfile.close) {
        const sealingFn = last(fileMeta.sealingFns);
        if (sealingFn) {
          fileMeta = sealingFn(lineProfile, fileMeta);
        }
      }
      return fileMeta;
    },
    { sealingFns: [], lineProfiles: [], composedLines: [] },
  );

// ******************************
// TODO: Add cases for require and if open and close are on
// the same line
export const profileLine = (line, lineIndex) => {
  const openImport = test(/(import)/g)(line);
  const closeImport = test(/(from ')/g)(line);
  const lineProfile = {
    line,
    lineIndex,
    open: openImport,
    close: closeImport,
    type: openImport || closeImport ? 'import' : null,
  };
  return lineProfile;
};

export const seal = curry(
  (openingLineProfile, closingLineProfile, fileMeta) => {
    const lineComposingFn = compose(
      j,
      map(prop('line')),
      slice(openingLineProfile.lineIndex, closingLineProfile.lineIndex + 1),
      prop('lineProfiles'),
    );
    return evolve(
      {
        sealingFns: init,
        composedLines: append({
          lines: lineComposingFn(fileMeta),
          type: openingLineProfile.type || closingLineProfile.type,
        }),
      },
      fileMeta,
    );
  },
);

export const parseImports = composedLine =>
  compose(
    split(','),
    trim,
    replace(importRegex, ''),
    replace(/([^\.]\.\/)/, ', ../'),
    replace(/(\.{2}\/)/, '../../'),
    replace(/(\'+)|(\"+)/, ','),
    prop('lines'),
  )(composedLine);

export const mockFns = fns =>
  `jest.mock('${last(fns)}', () => ${ifElse(
    propEq('length', 2),
    always('jest.fn()'),
    compose(
      wrapObj,
      join(`\n${tab(1)}`),
      map(jestFnKey),
      init,
    ),
  )(fns)})\n`;

export const readFileIntoArray = o(split('\n'), readFile);

export const addNameToPrototype = (fn, name) => {
  fn.prototype = {
    name,
  };
  return fn;
};
