#!/usr/bin/env ts-node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import mjml2html from 'mjml';
import { extname } from 'path';

const rootDir = process.argv[2] ?? process.cwd();
const pattern = `${rootDir}/templates/email/**/*.mjml`;
const ignorePattern = `${rootDir}/templates/email/base/**/*.mjml`;

const run = async () => {
  const mjmlFilePaths = await glob(pattern, { ignore: ignorePattern });
  for (const filePath of mjmlFilePaths) {
    const fileContent = readFileSync(filePath);
    const { html, errors } = mjml2html(fileContent.toString(), {
      filePath,
    });
    if (errors.length) {
      throw new Error(`Errors in ${filePath}:\n${errors.map(({ formattedMessage }) => formattedMessage).join('\n')}`);
    }
    const outPath = filePath.replace(extname(filePath), '.twig');
    writeFileSync(outPath, html);
  }
};

run().catch((err) => {
  console.error('Error:', err);
  process.exitCode = 1;
});
