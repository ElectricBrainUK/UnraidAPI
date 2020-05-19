export default async function (ctx, inject) {
  const moduleOptions = {"accessibleIcons":true,"iconProperty":"$icon","icons":{"64":"\u002F_nuxt\u002Ficons\u002Ficon_64.cqjcmoLihGi.png","120":"\u002F_nuxt\u002Ficons\u002Ficon_120.cqjcmoLihGi.png","144":"\u002F_nuxt\u002Ficons\u002Ficon_144.cqjcmoLihGi.png","152":"\u002F_nuxt\u002Ficons\u002Ficon_152.cqjcmoLihGi.png","192":"\u002F_nuxt\u002Ficons\u002Ficon_192.cqjcmoLihGi.png","384":"\u002F_nuxt\u002Ficons\u002Ficon_384.cqjcmoLihGi.png","512":"\u002F_nuxt\u002Ficons\u002Ficon_512.cqjcmoLihGi.png"}}
  inject(moduleOptions.iconProperty.replace('$', ''), retrieveIcons(moduleOptions.icons))
}

const retrieveIcons = icons => size => icons[size] || ''
