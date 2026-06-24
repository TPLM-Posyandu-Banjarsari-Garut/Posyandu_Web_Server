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
            statements: 80,
            branches: 70,
            functions: 75,
            lines: 80
        },
        './src/services/': {
            statements: 90,
            branches: 85,
            functions: 90,
            lines: 90
        },
        './src/repositories/': {
            statements: 85,
            branches: 80,
            functions: 85,
            lines: 85
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
