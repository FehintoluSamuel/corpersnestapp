/**
 * lib/socket.js
 *
 * WebSocket singleton. Connect once after login, reuse everywhere.
 * Usage:
 *   import { socket } from '@/lib/socket'
 *   socket.connect(token)
 *   socket.send({ type: 'message', recipient_id: 5, content: 'Hey!' })
 *   socket.on('message', handler)
 *   socket.off('message', handler)
 *   socket.disconnect()
 */

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws'

class SocketClient {
  constructor() {
    this._ws       = null
    this._handlers = {}   // { eventType: Set<fn> }
    this._queue    = []   // messages queued while connecting
  }

  connect(token) {
    if (this._ws?.readyState === WebSocket.OPEN) return
    this._ws = new WebSocket(`${WS_BASE}?token=${token}`)

    this._ws.onopen = () => {
      this._queue.forEach(msg => this._ws.send(JSON.stringify(msg)))
      this._queue = []
    }

    this._ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        const handlers = this._handlers[data.type] || new Set()
        handlers.forEach(fn => fn(data))
        // Also fire wildcard listeners
        ;(this._handlers['*'] || new Set()).forEach(fn => fn(data))
      } catch {}
    }

    this._ws.onclose  = () => { this._ws = null }
    this._ws.onerror  = (e) => console.error('WS error', e)
  }

  disconnect() {
    this._ws?.close()
    this._ws = null
  }

  send(payload) {
    if (this._ws?.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify(payload))
    } else {
      this._queue.push(payload)
    }
  }

  on(type, fn) {
    if (!this._handlers[type]) this._handlers[type] = new Set()
    this._handlers[type].add(fn)
  }

  off(type, fn) {
    this._handlers[type]?.delete(fn)
  }

  get connected() {
    return this._ws?.readyState === WebSocket.OPEN
  }
}

export const socket = new SocketClient()