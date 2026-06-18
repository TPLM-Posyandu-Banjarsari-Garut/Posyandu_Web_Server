import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'node:http'
import { Server } from 'node:http'
import { logger } from '@/utils/logger'

interface WsClient {
    ws: WebSocket
    user_id?: string
    posyandu_ids: Set<string>
    isAlive: boolean
}

const clients = new Map<WebSocket, WsClient>()

function broadcast(filter: (client: WsClient) => boolean, data: object): void {
    const message = JSON.stringify(data)
    for (const [ws, client] of clients) {
        if (filter(client) && ws.readyState === WebSocket.OPEN) {
            ws.send(message)
        }
    }
}

export const WsManager = {
    attach(server: Server): void {
        const wss = new WebSocketServer({ server, path: '/ws' })

        const heartbeatInterval = setInterval(() => {
            for (const [ws, client] of clients) {
                if (!client.isAlive) {
                    clients.delete(ws)
                    ws.terminate()
                    return
                }
                client.isAlive = false
                ws.ping()
            }
        }, 30_000)

        wss.on('close', () => clearInterval(heartbeatInterval))

        wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
            const client: WsClient = {
                ws,
                posyandu_ids: new Set(),
                isAlive: true
            }
            clients.set(ws, client)
            logger.debug('WebSocket client connected')

            ws.on('pong', () => {
                const c = clients.get(ws)
                if (c) c.isAlive = true
            })

            ws.on('message', (raw: Buffer) => {
                try {
                    const msg = JSON.parse(raw.toString()) as {
                        type: string
                        user_id?: string
                        posyandu_id?: string
                    }

                    if (msg.type === 'auth' && msg.user_id) {
                        client.user_id = msg.user_id
                        logger.debug(
                            { user_id: msg.user_id },
                            'WebSocket client authenticated'
                        )
                    }

                    if (msg.type === 'subscribe' && msg.posyandu_id) {
                        client.posyandu_ids.add(msg.posyandu_id)
                        logger.debug(
                            { posyandu_id: msg.posyandu_id },
                            'WebSocket client subscribed to posyandu'
                        )
                    }

                    if (msg.type === 'unsubscribe' && msg.posyandu_id) {
                        client.posyandu_ids.delete(msg.posyandu_id)
                    }
                } catch {
                    logger.warn('Invalid WebSocket message received')
                }
            })

            ws.on('close', () => {
                clients.delete(ws)
                logger.debug('WebSocket client disconnected')
            })

            ws.on('error', (err: Error) => {
                logger.error(err, 'WebSocket error')
                clients.delete(ws)
            })
        })

        logger.info('🔌 WebSocket server attached at path /ws')
    },

    broadcastSlotUpdate(
        posyandu_id: string,
        consultation_type: string,
        date: string
    ): void {
        broadcast(client => client.posyandu_ids.has(posyandu_id), {
            type: 'slot_update',
            posyandu_id,
            consultation_type,
            date
        })
    },

    broadcastNotification(user_id: string, data: object): void {
        broadcast(client => client.user_id === user_id, data)
    },

    getConnectedCount(): number {
        return clients.size
    }
}
