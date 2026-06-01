import pino, { type LoggerOptions } from 'pino'
import env from '@/configs/env'

const isDev = env.NODE_ENV !== 'production'

const devTransport: LoggerOptions['transport'] = {
    target: 'pino-pretty',
    options: {
        colorize: true,
        colorizeObjects: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
        levelFirst: true,
        customColors:
            'trace:gray,debug:cyanBright,info:greenBright,warn:yellowBright,error:redBright,fatal:magentaBright',
        messageFormat: '  ▸  {msg}',
        errorLikeObjectKeys: ['err', 'error'],
        errorProps: 'stack,type,statusCode,isOperational',
        singleLine: false
    }
}

const prodOptions: LoggerOptions = {
    level: env.LOG_LEVEL,
    base: null,
    formatters: {
        level(label) {
            return { level: label.toUpperCase() }
        }
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: {
        err: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res
    },
    redact: {
        paths: [
            '*.password',
            '*.passwordHash',
            '*.token',
            '*.accessToken',
            '*.refreshToken',
            '*.secret',
            '*.authorization',
            'req.headers.cookie',
            'req.headers.authorization'
        ],
        censor: '[REDACTED]'
    }
}

export const logger = isDev
    ? pino({ level: env.LOG_LEVEL, transport: devTransport })
    : pino(prodOptions)
