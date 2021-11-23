/*
  Compile: npm run build
  Run: npm run start [path] [output]?
  npm run start C:\azure-repos\clientworks.account-attribute-mgmt.web
  node dist/find-missing-tests.js C:\azure-repos\clientworks.account-attribute-mgmt.web
*/

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const filePath = args[0] || __dirname;
const outputFilePath = args[1];

const excludedDirs = ['node_modules', 'dist', 'coverage', 'environments'];
const excludedFiles = ['index', 'public-api', 'test-setup', 'polyfills', 'main'];
const includedExts = ['ts', 'spec'];

const filesToProcess = {
  ts: [],
  spec: []
};

function compileFileMaps(dir: string) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      if (!excludedDirs.includes(file.name)) {
        compileFileMaps(path.join(dir, file.name));
      }
    } else {
      const [fileName, fileExt] = file.name.split('.');

      if (includedExts.includes(fileExt) && !excludedFiles.includes(fileName)) {
        filesToProcess[fileExt].push(path.join(dir.replace(filePath, ''), fileName));
      }
    }
  }
}

function compileMissingTests() {
  const { ts = [], spec } = filesToProcess;

  spec.forEach((file) => {
    const tsIndex = ts.indexOf(file);

    if (tsIndex > -1) {
      ts.splice(tsIndex, 1);
    }
  });
}

compileFileMaps(filePath);
compileMissingTests();

if (filesToProcess.ts.length > 0) {
  console.log('\n\x1b[31mFiles without tests:\x1b[0m\n');

  filesToProcess.ts.forEach((file) => {
    console.log(`\x1b[33m\t${file}.ts\x1b[0m`);
  });

  console.log('\nTotal files:', filesToProcess.ts.length);

  if (outputFilePath) {
    // TODO: export to file
  }
}

console.log('\nDone.');
