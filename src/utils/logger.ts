import pino, { type LoggerOptions } from 'pino'
import env from '@/configs/env'

const { NODE_ENV, LOG_LEVEL } = env
const isDev = NODE_ENV === 'development' && !process.env.VERCEL

const safeErrorSerializer = (error: unknown) => ({
    type: error instanceof Error ? error.name : 'UnknownError'
})

const devOptions: LoggerOptions = {
    level: LOG_LEVEL,
    serializers: {
        err: safeErrorSerializer,
        error: safeErrorSerializer
    },
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            colorizeObjects: true,
            singleLine: false,
            levelFirst: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
            messageFormat: '  ▸  {msg}',
            errorLikeObjectKeys: ['err', 'error'],
            errorProps: 'stack,type,statusCode,isOperational',
            customColors: [
                'trace:gray',
                'debug:cyanBright',
                'info:greenBright',
                'warn:yellowBright',
                'error:redBright',
                'fatal:magentaBright'
            ].join(',')
        }
    }
}

const prodOptions: LoggerOptions = {
    level: LOG_LEVEL,
    base: null,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level(label) {
            return { level: label.toUpperCase() }
        }
    },
    serializers: {
        err: safeErrorSerializer,
        error: safeErrorSerializer,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res
    },

    redact: {
        paths: [
            'email',
            'phone_number',
            'identity_number',
            'address_line',
            'employee_number',
            'license_number',
            'nik',
            'notes',
            'result_summary',
            'cancellation_reason',
            'symptoms',
            'action_taken',
            'special_condition_notes',
            'payload',
            'oldValue',
            'newValue',
            '*.password',
            '*.passwordHash',
            '*.token',
            '*.accessToken',
            '*.refreshToken',
            '*.secret',
            '*.authorization',
            '*.email',
            '*.phone_number',
            '*.identity_number',
            '*.address_line',
            '*.employee_number',
            '*.license_number',
            '*.nik',
            '*.notes',
            '*.result_summary',
            '*.cancellation_reason',
            '*.symptoms',
            '*.action_taken',
            '*.special_condition_notes',
            '*.payload',
            '*.oldValue',
            '*.newValue',
            'req.headers.cookie',
            'req.headers.authorization'
        ],
        censor: '[REDACTED]'
    }
}

export const logger = pino(isDev ? devOptions : prodOptions)
