import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _91fcb6ce = () => interopDefault(import('../pages/docs.vue' /* webpackChunkName: "pages/docs" */))
const _366dadfc = () => interopDefault(import('../pages/mqtt.vue' /* webpackChunkName: "pages/mqtt" */))
const _70c73438 = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))

// TODO: remove in Nuxt 3
const emptyFn = () => {}
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onComplete = emptyFn, onAbort) {
  return originalPush.call(this, location, onComplete, onAbort)
}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: decodeURI('/'),
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/docs",
    component: _91fcb6ce,
    name: "docs"
  }, {
    path: "/mqtt",
    component: _366dadfc,
    name: "mqtt"
  }, {
    path: "/",
    component: _70c73438,
    name: "index"
  }],

  fallback: false
}

export function createRouter () {
  return new Router(routerOptions)
}
