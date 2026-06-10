// Jest setup file
import { jest } from '@jest/globals'

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.PORT = '3000'
process.env.CORS_ORIGIN = 'http://localhost:3001'
process.env.DATABASE_URL =
    'postgres://postgres:postgres@localhost:5432/posyandu_test'
process.env.BETTER_AUTH_SECRET = 'ScyRLreDcKwCw854f5tqgKMMWODN8h6q'
process.env.BETTER_AUTH_URL = 'http://localhost:3000'

// Global test timeout
jest.setTimeout(10000)

jest.mock('better-auth', () => ({ betterAuth: jest.fn() }), { virtual: true })
jest.mock(
    'better-auth/adapters/drizzle',
    () => ({ drizzleAdapter: jest.fn() }),
    { virtual: true }
)

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
