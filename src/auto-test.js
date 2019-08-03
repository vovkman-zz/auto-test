import { compose } from 'ramda';

import {
  addImports,
  writeToFile,
  createDescribeBlocks,
  getFunctionsFromFile,
  createMocks,
} from './auto-test.pipeline';
import { concatStrings } from './auto-test.helpers';

const autoTest = compose(
  writeToFile(process.env.FILE_NAME),
  concatStrings([
    createMocks(process.env.FILE_TO_TEST),
    addImports(process.env.FILE_NAME),
    createDescribeBlocks(process.env.FILE_NAME),
  ]),
  getFunctionsFromFile(process.env.FILE_TO_TEST),
);

autoTest();
