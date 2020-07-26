const { dependencies, devDependencies } = require('./package.json');
const { exec } = require('child_process');
const allDependencies = [];
let yarnVersion = '';

const start = async () => {
    const version = await checkYarnVersion();
    if (version) {
        await removeModulesAndSetDep();
        await execDependencies();
    }
};

const checkYarnVersion = () => {
    return new Promise((resolve, reject) => {
        exec('yarn --version', (error, stdout, stderr) => {
            if (error) return reject(error);
            if (stderr) return reject(stderr);
            yarnVersion = stdout.substr(0, 1);
            console.log('Yarn version =>', stdout.trim());
            resolve(stdout)
        });
    })
};

const removeModulesAndSetDep = () => {
    console.log('Removing lock & state files');
    return new Promise((resolve, reject) => {
        exec('rm -rf yarn.lock package-lock.json .yarn/build-state.yml .yarn/install-state.gz', (error, stdout, stderr) => {
            if (error) return reject(error);
            if (stderr) return reject(stderr);
            if (dependencies) {
                Object.keys(dependencies).map(dep => {
                    allDependencies.push({ dep: dep, type: 'default' });
                });
            }
            if (devDependencies) {
                Object.keys(devDependencies).map(dep => {
                    allDependencies.push({ dep: dep, type: 'dev' });
                });
            }
            resolve();
        });
    });

};

const execDependencies = async () => {
    let index = 0;
    while (index < allDependencies.length) {
        await execDependency(index);
        index++;
    };
    console.log('----- UPDATED -----');
    console.log('');
};

const execDependency = (index) => {
    console.log('Updating =>', allDependencies[index].dep);
    let execStr = '';
    execStr = 'yarn add ' + allDependencies[index].dep + (yarnVersion === '2' ? '' : '@latest');
    execStr = allDependencies[index].type === 'default' ? execStr : execStr + ' --dev';
    return new Promise((resolve, reject) => {
        exec(execStr, (err, stdout, stderr) => {
            if (err) return reject(err);
            if (stdout) console.log(stdout);
            if (stderr) return console.log(stderr);
            resolve();
        });
    });
};

start();
