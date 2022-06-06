// eslint-disable-next-line no-undef
globalThis.ngJest = {
    tsconfig: 'tsconfig.spec.json',
};

module.exports = {
    collectCoverageFrom: [
        'src/**/*.generator.ts',
        'src/**/*.parser.ts',
        'src/**/*.error.ts',
    ],
    coverageThreshold: {
        global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80
        }
    }
};
