const colors = require('vuetify/es5/util/colors').default
const URLS = {
  LOGIN: '/api/login',
  GET_SERVERS: '/api/getServers',
  ARRAY_STATUS: '/api/arrayStatus',
  SERVER_STATUS: '/api/serverStatus',
  VM_STATUS: '/api/vmStatus',
  USB_ATTACH: '/api/usbAttach',
  PCI_ATTACH: '/api/pciAttach',
  GPU_SWAP: '/api/gpuSwap',
  VM_EDIT: '/api/editVM',
  VM_CREATE: '/api/createVM',
  DOCKER_STATUS: '/api/dockerStatus',
  MQTT_DEVICE_CHANGE: '/api/mqttDevices'
};

module.exports = {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: '%s - ' + process.env.npm_package_name,
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons'
      }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [],
  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/vuetify',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/eslint-module',
    '~/mqtt'
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},

  serverMiddleware: [
    // Will register file from project api directory to handle /api/* requires
    {path: URLS.LOGIN, handler: '~/api/login.js'},
    {path: URLS.GET_SERVERS, handler: '~/api/getServers.js'},
    {path: URLS.VM_STATUS, handler: '~/api/changeVMStatus.js'},
    {path: URLS.DOCKER_STATUS, handler: '~/api/changeDockerStatus.js'},
    {path: URLS.ARRAY_STATUS, handler: '~/api/changeArrayStatus.js'},
    {path: URLS.SERVER_STATUS, handler: '~/api/changeServerStatus.js'},
    {path: URLS.USB_ATTACH, handler: '~/api/usbAttach.js'},
    {path: URLS.PCI_ATTACH, handler: '~/api/pciAttach.js'},
    {path: URLS.GPU_SWAP, handler: '~/api/gpuSwap.js'},
    {path: URLS.VM_EDIT, handler: '~/api/editVM.js'},
    {path: URLS.VM_CREATE, handler: '~/api/createVM.js'},
    {path: URLS.MQTT_DEVICE_CHANGE, handler: '~/api/mqttDevices.js'}
  ],
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    theme: {
      primary: colors.blue.darken2,
      accent: colors.grey.darken3,
      secondary: colors.amber.darken3,
      info: colors.teal.lighten1,
      warning: colors.amber.base,
      error: colors.deepOrange.accent4,
      success: colors.green.accent3
    }
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {}
  }
}
