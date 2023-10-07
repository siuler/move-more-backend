import * as fs from 'fs-extra';
fs.copySync('src/config/config.prod.json', 'dist/config/config.json');
fs.removeSync('dist/config/config.prod.json');
