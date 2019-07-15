importScripts('/_nuxt/workbox.4c4f5ca6.js')

workbox.precaching.precacheAndRoute([
  {
    "url": "/_nuxt/0af94e2983b569825422.js",
    "revision": "93240e309b7778b884e72898f0d3656c"
  },
  {
    "url": "/_nuxt/2c06513f640094a7efa4.js",
    "revision": "54207decb18cdea4b5c621d84fcfc99b"
  },
  {
    "url": "/_nuxt/476672ce685c5e2d8ad8.js",
    "revision": "2761f299cc4e139687d54ffbf9a0aa64"
  },
  {
    "url": "/_nuxt/7179d99857d858a6dc89.js",
    "revision": "e9a43392846875f2645998f596740dbb"
  },
  {
    "url": "/_nuxt/ac907b0b58e06c54d7a3.js",
    "revision": "3b7e5ee6fe1db6f66f0c3fa6127552dd"
  },
  {
    "url": "/_nuxt/ec7088e384a0ff459334.js",
    "revision": "1c4d3df3b4f09dad057803ac40868152"
  }
], {
  "cacheId": "unraidapi",
  "directoryIndex": "/",
  "cleanUrls": false
})

workbox.clientsClaim()
workbox.skipWaiting()

workbox.routing.registerRoute(new RegExp('/_nuxt/.*'), workbox.strategies.cacheFirst({}), 'GET')

workbox.routing.registerRoute(new RegExp('/.*'), workbox.strategies.networkFirst({}), 'GET')
