export default async function (ctx, inject) {
  const moduleOptions = {"accessibleIcons":true,"iconProperty":"$icon","icons":{"64":"\u002F_nuxt\u002Ficons\u002Ficon_64.9mld2VBMsQ$.png","120":"\u002F_nuxt\u002Ficons\u002Ficon_120.9mld2VBMsQ$.png","144":"\u002F_nuxt\u002Ficons\u002Ficon_144.9mld2VBMsQ$.png","152":"\u002F_nuxt\u002Ficons\u002Ficon_152.9mld2VBMsQ$.png","192":"\u002F_nuxt\u002Ficons\u002Ficon_192.9mld2VBMsQ$.png","384":"\u002F_nuxt\u002Ficons\u002Ficon_384.9mld2VBMsQ$.png","512":"\u002F_nuxt\u002Ficons\u002Ficon_512.9mld2VBMsQ$.png"}}
  inject(moduleOptions.iconProperty.replace('$', ''), retrieveIcons(moduleOptions.icons))
}

const retrieveIcons = icons => size => icons[size] || ''
