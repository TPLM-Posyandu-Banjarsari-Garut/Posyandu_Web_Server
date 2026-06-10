/** @type {import('jest').Config} */
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
    },
    extensionsToTreatAsEsm: ['.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/types/**',
        '!src/server.ts',
        '!src/app.ts'
    ],
    coverageThreshold: {
        global: {
            statements: 20,
            branches: 8,
            functions: 10,
            lines: 20
        }
    },
    coverageDirectory: 'coverage',
    verbose: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
    moduleNameMapper: {
        '\\.d\\.ts$': '<rootDir>/src/__tests__/setup.ts', // Map .d.ts imports to an empty file
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    reporters: [
        'default',
        [
            'jest-html-reporter',
            {
                pageTitle: 'Test Report',
                outputPath: 'test-report.html'
            }
        ]
    ]
}
