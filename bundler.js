const fs = require('fs-extra');
const path = require('path');
const download = require('download');
const rimraf = require('rimraf');
const git = require('nodegit');
const maven = require('maven');
const find = require('find');
const archiver = require('archiver');

const ROOT = __dirname;
const BUNDLE_DIR = 'bundle';

// set up bundle directory
const setup = () => {
    // clean up
    console.log(`Cleaning up previous builds`);
    rimraf.sync('bundle');
    rimraf.sync('git-*');
    rimraf.sync('*.zip');
    console.log(`Finished cleaning up previous builds`);

    // create bundle directory
    fs.mkdirSync(BUNDLE_DIR);

    // for nicer looking chaining
    return Promise.resolve();
};

// download or build each module specified in the config file
const downloadAndBuild = () => {
    // read the module config
    const modules = JSON.parse(fs.readFileSync('modules.json', 'utf8')).modules;

    // download or build each module
    return Promise.all(modules.map((module, index, array) => {
        if (module.url) {
            // download pre-built module
            console.log(`Downloading module: ${module.name}`);

            return download(module.url, BUNDLE_DIR).then(() => {
                console.log(`Finished downloading module: ${module.name}`);
                return Promise.resolve();
            });
        } else if (module.git) {
            // clone the repo
            console.log(`Cloning repo: ${module.git.repo}`);

            const checkoutOps = {
                checkoutBranch: module.git.branch || 'master'
            };

            let localDir = `git-${module.git.repo.match(new RegExp(/^.*\/(.*)\.git$/))[1]}`;

            if (module.git.path) {
                localDir = localDir + '-' + module.git.path;
            }

            return git.Clone(module.git.repo, localDir, checkoutOps).then((repo) => {
                console.log(`Finished cloning repo: ${module.git.repo}`);

                // checkout appropriate commit
                if (module.git.tag) {
                    return repo.getReference(module.git.tag).then((ref) => {
                        return repo.setHead(ref.name()).then((result) => {
                            return git.Checkout.head(repo, {
                                checkoutStrategy: git.Checkout.STRATEGY.FORCE
                            }).then(() => {
                                console.log(`Checked out tag: ${module.git.tag}`);
                            });
                        });
                    });
                } else if (module.git.commit) {
                    repo.setHeadDetached(git.Oid.fromString(module.git.commit));

                    return git.Checkout.head(repo, {
                        checkoutStrategy: git.Checkout.STRATEGY.FORCE
                    }).then(() => {
                        console.log(`Checked out commit: ${module.git.commit}`);
                    });
                }
            }).then(() => {
                // navigate to path if specified
                if (module.git.path) {
                    localDir = localDir + path.sep + module.git.path;
                }

                // build
                console.log(`Building Maven project at: ${ROOT + path.sep + localDir}`);

                const mvn = maven.create({
                    cwd: ROOT + path.sep + localDir
                });

                return mvn.execute(['clean', 'install']).then(() => {
                    console.log(`Finished building Maven project at: ${ROOT + path.sep + localDir}`);

                    // copy OMOD to bundle directory
                    return new Promise((resolve, reject) => {
                        find.file(/\.omod$/, ROOT + path.sep + localDir, (files) => {

                            if (files.length !== 1) {
                                const message = `Multiple .omod files found for module: ${module.name}`;
                                throw new Error(message);
                            }

                            const omodpath = files[0];
                            const omodname = path.basename(omodpath);

                            fs.copy(omodpath, ROOT + path.sep + BUNDLE_DIR + path.sep + omodname, (err) => {
                                if (err) {
                                    reject();
                                    throw err;
                                }
                                console.log(`Copied ${omodname} to bundle directory`);
                                resolve();
                            });
                        });
                    });
                });
            });
        } else {
            const message = `Don't know how to package module: ${module.name}`;
            throw new Error(message);
        }
    }));
};

// create the ZIP file
const packageBundle = () => {
    console.log('Creating module bundle ZIP file');

    // read the module config
    const modules = JSON.parse(fs.readFileSync('modules.json', 'utf8')).modules;

    // read the package.json file
    const package = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    var output = fs.createWriteStream(`esaude-platform-modules-${package.version}.zip`);

    var bundle = new archiver('zip');
    bundle.on('error', function(err) {
        throw err;
    });
    bundle.pipe(output);

    // add modules
    modules.map((module, index, array) => {
        // make sure file exists
        if (fs.statSync(BUNDLE_DIR + path.sep + module.filename).isFile()) {
            console.log(`Adding ${module.filename} to module bundle`);
            bundle.append(fs.createReadStream(BUNDLE_DIR + path.sep + module.filename), {
                name: module.filename
            });
        } else {
            const message = `Problem with OMOD file: ${module.filename}`;
            throw new Error(message);
        }
    });

    output.on('close', () => {
        console.log('Finished creating module bundle ZIP file');
    });

    bundle.finalize();
};

// do it
setup()
    .then(downloadAndBuild)
    .then(packageBundle)
    .catch((err) => {
        console.log(err);
    });
