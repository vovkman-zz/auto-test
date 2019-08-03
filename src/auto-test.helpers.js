import {
  addIndex,
  and,
  append,
  composeWith,
  concat,
  converge,
  curry,
  flip,
  gte,
  identity,
  is,
  join,
  lt,
  map,
  mergeAll,
  o,
  reduce,
  tap,
  transduce,
  unapply,
} from 'ramda';
import fs from 'fs';

export const composePromise = composeWith(async (f, res) =>
  f.then ? await f(res) : f(res),
);

export const composeD = composeWith((f, res) => {
  console.log(f.toString());
  console.log(`${JSON.stringify(res)}\n\n`);
  return f(res);
});

export const isFunction = is(Function);

export const fConcat = flip(concat);

export const concatStrings = converge(unapply(reduce(concat, '')));

export const mergeResults = converge(unapply(mergeAll));

export const tab = repeat =>
  repeat === null ? process.env.TAB.repeat(1) : process.env.TAB.repeat(repeat);

export const j = join('');

export const imap = addIndex(map);

export const ireduce = addIndex(reduce);

export const array = length => new Array(length);

export const bt = (i, max) => and(gte(i, 0), lt(i, max));

export const arg = (name = 'arg', i = '') => `${name}${i}`;

export const jestFnKey = fnName => `${fnName}: jest.fn(),`;

export const wrapObj = keys => `({\n${tab(1)}${keys}\n})`;

export const log = o(tap(console.log), identity);

export const transduceArr = curry((transducer, init) =>
  transduce(transducer, flip(append), [], init),
);

export const importRegex = /(import)|(\s+)|(\*\s+as)|(\s+)|({)|(\s+)|(,*\s*})|(})|(\s+)|(from\s+)|(\'+)|(\"+)|(;)/g;

export const readFile = file =>
  fs.readFileSync(file, {
    encoding: 'utf8',
  });
