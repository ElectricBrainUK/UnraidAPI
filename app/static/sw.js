importScripts('/_nuxt/workbox.4c4f5ca6.js')

workbox.precaching.precacheAndRoute([
  {
    "url": "/_nuxt/230f2b388e3d9d4a7e31.js",
    "revision": "b8aa097ec52b97d0851f567964f16c41"
  },
  {
    "url": "/_nuxt/2c06513f640094a7efa4.js",
    "revision": "54207decb18cdea4b5c621d84fcfc99b"
  },
  {
    "url": "/_nuxt/4b52460e4684d5cc9f59.js",
    "revision": "9f6bffa3e5c1f279f4246c304c12b7ab"
  },
  {
    "url": "/_nuxt/6d42f5dd654fbd519365.js",
    "revision": "b6bd26e3a1852d6f3d22e0ff88bc58fe"
  },
  {
    "url": "/_nuxt/909c52b5360dd71db2c6.js",
    "revision": "b5576985b8ca0ac3c79e4ba4d5fc1062"
  },
  {
    "url": "/_nuxt/b7c5d1105155c3a38b24.js",
    "revision": "1d0650de2324a023a97103578cff7a63"
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
