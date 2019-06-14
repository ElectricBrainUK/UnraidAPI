module.exports = async function NuxtLoadingScreen() {
  if (!this.options.dev) {
    return
  }

  const baseURL = this.options.router.base

  const LoadingUI = require('./loading')
  const loading = new LoadingUI({ baseURL })
  await loading.init()

  this.addServerMiddleware({
    path: '/_loading', // baseURL will be prepended by nuxt for middleware
    handler: loading.app
  })

  this.nuxt.hook('bundler:progress', (states) => {
    loading.setStates(states)
  })

  this.nuxt.hook('server:nuxt:renderLoading', (req, res) => {
    loading.serveIndex(req, res)
  })

  this.nuxt.hook('listen', (server) => {
    server.on('upgrade', (request, socket, head) => {
      if (request.url === `${baseURL}_loading/ws`) {
        loading.handleUpgrade(request, socket, head)
      }
    })
  })
}
