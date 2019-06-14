const path = require('path')
const connect = require('connect')
const serveStatic = require('serve-static')
const WebSocket = require('ws')
const fs = require('fs-extra')

class LoadingUI {
  constructor({ baseURL }) {
    this.baseURL = baseURL

    this.serveIndex = this.serveIndex.bind(this)
    this.serveWS = this.serveWS.bind(this)
    this.serveJSON = this.serveJSON.bind(this)

    this._lastBroadCast = 0

    this.states = []
    this.allDone = true
    this.hasErrors = false
  }

  async init() {
    // Create a connect middleware stack
    this.app = connect()

    // Create and serve ws
    this.wss = new WebSocket.Server({ noServer: true })
    this.app.use('/ws', this.serveWS)

    // Serve dist
    this.app.use('/json', this.serveJSON)

    // Serve dist
    const distPath = path.resolve(__dirname, '..', 'app-dist')
    this.app.use('/', serveStatic(distPath))

    // Serve index.html
    const indexPath = path.resolve(distPath, 'index.html')
    this.indexTemplate = await fs.readFile(indexPath, 'utf-8')
    this.app.use('/', this.serveIndex)
  }

  get state() {
    return {
      states: this.states,
      allDone: this.allDone,
      hasErrors: this.hasErrors
    }
  }

  setStates(states) {
    this.states = states
    this.allDone = this.states.every(state => state.progress === 0 || state.progress === 100)
    this.hasErrors = this.states.some(state => state.hasErrors === true)
    this.broadcastState()
  }

  broadcastState() {
    const now = new Date()
    if ((now - this._lastBroadCast > 500) || this.allDone) {
      this._broadcastState()
      this._lastBroadCast = now
    }
  }

  _broadcastState() {
    const data = JSON.stringify(this.state)

    for (const client of this.wss.clients) {
      try {
        client.send(data)
      } catch (err) {
        // Ignore error (if client not ready to receive event)
      }
    }
  }

  serveIndex(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(this.indexTemplate
      .replace('{STATE}', JSON.stringify(this.state))
      .replace(/{BASE_URL}/g, this.baseURL)
    )
  }

  serveJSON(req, res) {
    res.end(JSON.stringify(this.state))
  }

  serveWS(req) {
    this.handleUpgrade(req, req.socket, undefined)
  }

  handleUpgrade(request, socket, head) {
    return this.wss.handleUpgrade(request, socket, head, (client) => {
      this.wss.emit('connection', client, request)
    })
  }
}

module.exports = LoadingUI
