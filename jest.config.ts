import type { Config } from "jest";

const config: Config = {
    rootDir: __dirname,
    preset: 'ts-jest/presets/js-with-ts-esm',
    resetMocks: true,
    clearMocks: true,
    testEnvironment: 'node',
    transformIgnorePatterns: ['node_modules/(?!node-fetch|fetch-blob|data-uri-to-buffer|formdata-polyfill)'],
    testMatch: ['**/*.spec.ts'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {isolatedModules: true, useESM: true}]
    },
};

module.exports = config;
