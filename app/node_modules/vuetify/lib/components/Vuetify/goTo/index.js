var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

import * as easingPatterns from './easing-patterns';
import { getContainer, getOffset } from './util';
import Vue from 'vue';
export default function goTo(_target) {
    var _settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var settings = _extends({
        container: document.scrollingElement || document.body || document.documentElement,
        duration: 500,
        offset: 0,
        easing: 'easeInOutCubic',
        appOffset: true
    }, _settings);
    var container = getContainer(settings.container);
    if (settings.appOffset) {
        var isDrawer = container.classList.contains('v-navigation-drawer');
        var isClipped = container.classList.contains('v-navigation-drawer--clipped');
        settings.offset += Vue.prototype.$vuetify.application.bar;
        if (!isDrawer || isClipped) settings.offset += Vue.prototype.$vuetify.application.top;
    }
    var startTime = performance.now();
    var targetLocation = getOffset(_target) - settings.offset;
    var startLocation = container.scrollTop;
    if (targetLocation === startLocation) return Promise.resolve(targetLocation);
    var ease = typeof settings.easing === 'function' ? settings.easing : easingPatterns[settings.easing];
    if (!ease) throw new TypeError('Easing function "' + settings.easing + '" not found.');
    // tslint:disable-next-line:promise-must-complete
    return new Promise(function (resolve) {
        return requestAnimationFrame(function step(currentTime) {
            var timeElapsed = currentTime - startTime;
            var progress = Math.abs(settings.duration ? Math.min(timeElapsed / settings.duration, 1) : 1);
            container.scrollTop = Math.floor(startLocation + (targetLocation - startLocation) * ease(progress));
            if (progress === 1 || container.clientHeight + container.scrollTop === container.scrollHeight) {
                return resolve(targetLocation);
            }
            requestAnimationFrame(step);
        });
    });
}
//# sourceMappingURL=index.js.map