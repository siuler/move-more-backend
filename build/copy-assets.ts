import * as fs from 'fs-extra';
fs.copySync('src', 'dist', {
    filter: src => !src.endsWith('.ts'),
});
