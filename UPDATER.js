const { dependencies, devDependencies } = require('./package.json');
const { exec } = require('child_process');
const allDependencies = [];

exec('rm -rf yarn.lock node_modules package-lock.json', () => {
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
    execDependencies();
});

function execDependencies(index = 0) {
    let execStr = 'yarn add ' + allDependencies[index].dep + '@latest';
    execStr = allDependencies[index].type === 'default' ? execStr : execStr + ' --dev';
    exec(execStr, (err, stdout, stderr) => {
        if (err) console.log('ERROR: ', err);
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);
        if (allDependencies[index + 1]) {
            execDependencies(index + 1);
        }
        else {
            console.log('----- UPDATED -----');
            console.log('');
        }
    });
}
