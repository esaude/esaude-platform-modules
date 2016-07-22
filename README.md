<br/><br/><br/>
<img src="https://s3-eu-west-1.amazonaws.com/esaude/images/esaude-site-header.png" alt="OpenMRS"/>
<br/><br/><br/>

# eSaude EMR Platform Module Bundler

[![Build Status](https://travis-ci.org/esaude/esaude-platform-modules.svg?branch=master)](https://travis-ci.org/esaude/esaude-platform-modules)

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

Once you've made your changes, run `node bundler.js` to make sure that the new
bundle builds correctly.

:bulb: You need NodeJS `v6.3.1` or greater to run the script.

> ##### Step 2: Publish Bundle

Once you push your changes to GitHub, Travis will automatically build the
bundle, but it will not publish a new version to [Bintray](https://bintray.com/esaude/platform/modules). To publish to Bintray,
you must create and push a tag to Github. This can be done by first creating
the version as follows:

```sh
npm run create-version <OPTION>
```
where `<OPTION>` can be **major**, **minor**, **patch** or a specific [semver](http://semver.org/) version (like 1.2.3). This command basically just changes the version numbers is in the
[`package.json`](package.json) and [`bintray.json`](bintray.json) files (see [docs](https://docs.npmjs.com/cli/version)).

Finally, publish the version by running:

```sh
npm run publish version
```

:pushpin: Once you've published a new module bundle version, you may also want
to update the eSaude Platform [Tomcat Docker file](https://github.com/esaude/esaude-platform-docker/blob/master/tomcat/Dockerfile).
See the [eSaude EMR Platform release process documentation](https://paper.dropbox.com/doc/eSaude-EMR-Platform-Release-Process-sHAOkkPbH5oveFvtqvMkK) for more info.

## License

[MPL 2.0 w/ HD](http://openmrs.org/license/)
