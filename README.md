<br/><br/><br/>
<img src="https://s3-eu-west-1.amazonaws.com/esaude/images/esaude-site-header.png" alt="OpenMRS"/>
<br/><br/><br/>

# eSaude EMR Platform Module Bundler

[![Build Status](https://travis-ci.org/esaude/esaude-platform-modules.svg?branch=master)](https://travis-ci.org/esaude/esaude-platform-modules)
[ ![Download](https://api.bintray.com/packages/esaude/platform/modules/images/download.svg) ](https://bintray.com/esaude/platform/modules/_latestVersion)
[![eSaude Slack](https://slack.esaude.org/badge.svg)](https://slack.esaude.org)

Tool used to build and publish the eSaude Platform module bundle.

## Usage

> ##### Step 1: Update Config

To change the version of a module, edit the [`modules.json`](modules.json) file.
Each module is defined by a JSON object of the form:

```js
{
  "name": "Module Name", // module name
  "version": "1.2.3", // module version
  "git": { /* git object, defined below */ },
  "url": "https://domain.tld/filename.ext", // module download URL
  "filename": "modulename-1.2.3.omod" // expected filename (used during validation)
}
```
> **Note:** Only *one* of `git` or `url` are required, not both. If both are
supplied, then the URL will be used to download the module and it will not be
built from source.

The **`git`** JSON object looks like:

```js
{
  "repo": "https://github.com/esaude/repo.git", // path to repo
  "commit": "3dbbab2c4c0f3ce6173a18fe04175593b02b2f91", // commit hash [optional]
  "path": "path/to/pom.xml", // path within repo to run maven [optional]
  "tag": "version-1.0.0", // tag to build [optional]
  "branch": "1.0.x" // branch to build [optional]
}
```
> **Note:** Only the `repo` property is required. Only *one* of `commit` or `tag`
should be supplied. If both are specified, then `tag` will be used.

Once you've made your changes, test the build as described below.

> ##### Step 2: Test Build

:bulb: You need NodeJS `v6.3.1` or greater to build the module bundle.

To test the build, you first need to install the NodeJS dependencies. Do this by
executing the following command in the project root:

```sh
npm install
```

If you run into issues installing the dependencies, see the [Troubleshooting](#troubleshooting)
section below.

To build the module bundle, run:

```
node bundler.js
```

This will download and/or build all the modules defined in `modules.json` and
place them in the `bundle` directory. It will also create a file called
`esaude-platform-modules-x.y.z.zip`, which is the bundle.

Make _sure_ all the expected modules are contained in the bundle.

> ##### Step 3: Publish Bundle

Once you've tested your changes and pushed to GitHub, Travis will automatically build the
bundle, but it will not publish a new version to [Bintray](https://bintray.com/esaude/platform/modules). To publish to Bintray,
you must create and push a tag to Github. This can be done by first creating
the version as follows:

```sh
npm run create-version <OPTION>
```
where `<OPTION>` can be **major**, **minor**, **patch** or a specific [semver](http://semver.org/) version (like 1.2.3). This command changes the version numbers is in the
[`package.json`](package.json) and [`bintray.json`](bintray.json) files (see [docs](https://docs.npmjs.com/cli/version)) and creates a version commit.

Finally, publish the version by running:

```sh
npm run publish-version
```

:pushpin: Once you've published a new module bundle version, you may also want
to update the eSaude Platform [Tomcat Docker file](https://github.com/esaude/esaude-platform-docker/blob/master/tomcat/Dockerfile).
See the [eSaude EMR Platform release process documentation](https://paper.dropbox.com/doc/eSaude-EMR-Platform-Release-Process-sHAOkkPbH5oveFvtqvMkK) for more info.

## Troubleshooting

> Error: /usr/lib/x86_64-linux-gnu/libstdc++.so.6: version `GLIBCXX_3.4.20' not found

If you see this error, it's because you need a more recent version of `libstdc++`.
On Ubuntu, this can be installed as follows:

```sh
sudo add-apt-repository ppa:ubuntu-toolchain-r/test
sudo apt-get update
sudo apt-get install libstdc++-4.9-dev
```

See the NodeGit [README](https://github.com/nodegit/nodegit) for more information.

## License

[MPL 2.0 w/ HD](http://openmrs.org/license/)
