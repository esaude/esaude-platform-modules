#!/bin/node
const fs = require('fs');

const child = require('child_process').exec(`npm --no-git-tag-version version ${process.argv[2]}`);

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

child.on('exit', () => {
  // update the Bintray config
  const bintray = JSON.parse(fs.readFileSync('bintray.json', 'utf8'));
  const package = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  bintray.version.name = package.version;
  fs.writeFileSync('bintray.json', JSON.stringify(bintray, null, 2));

  process.exit()
});
