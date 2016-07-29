#!/bin/node
const fs = require('fs');
const child = require('child_process');

const npm = child.exec(`npm --no-git-tag-version version ${process.argv[2]}`);

npm.stdout.pipe(process.stdout);
npm.stderr.pipe(process.stderr);

npm.on('exit', () => {
  // update the Bintray config
  const bintray = JSON.parse(fs.readFileSync('bintray.json', 'utf8'));
  const package = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  bintray.version.name = package.version;
  fs.writeFileSync('bintray.json', JSON.stringify(bintray, null, 2));

  // commit version
  const commit = child.exec(`git add package.json && git add bintray.json && git commit -m "${package.version}"`);

  commit.on('exit', () => {
    process.exit();
  });
});
