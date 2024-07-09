// ==UserScript==
// @name         Facebook like everything
// @namespace    https://github.com/3cm-app/tampermonkey-userscripts
// @version      2024-07-08
// @description  Auto click every like button!
// @author       https://github.com/up9cloud
// @match https://*.facebook.com/*
// @match https://www.facebook.com/*
// @exclude https://developers.facebook.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @updateURL https://raw.githubusercontent.com/3cm-app/tampermonkey-userscripts/master/src/facebook.com/like-everything.js
// @downloadURL https://raw.githubusercontent.com/3cm-app/tampermonkey-userscripts/master/src/facebook.com/like-everything.js
// ==/UserScript==

(async function() {
    'use strict';
    const id = 'like everything'
    const start = performance.now()
    function currentDuration() {
        return (performance.now() - start).toFixed(3)
    }
    function log(s) {
        console.log(`[${id}] [${currentDuration()}ms] ${s}`)
    }
    function error(s) {
        console.error(`[${id}] [${currentDuration()}ms] ${s}`)
    }
    async function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    async function smoothScroll(total, oneTime = 30) {
        const times = Math.floor(total / oneTime)
        const left = total % oneTime
        for(let i = 0; i < times; i++) {
            window.scrollBy({
                top: oneTime,
                behavior: "smooth",
            })
            await delay(getRandomInt(50, 150))
        }
        if (left) {
            window.scrollBy({
                top: left,
                behavior: "smooth",
            })
        }
    }
    async function removeParentLayer(selector, level) {
        let el = document.querySelector(selector)
        for(let i=0; i < level; i++) {
            el = el.parentElement
        }
        if (el) {
            el.remove()
        }
    }
    function getMode() {
        if (location.pathname === '/') {
            return '/'
        } else if (location.pathname.startsWith('/groups/')) {
            return '/groups'
        } else { return }
    }
    async function main(startIndex = 0) {
        log(`startIndex: ${startIndex}`)
        // for main
        let nodeList = []
        switch (getMode()) {
            case '/': {
                nodeList = document.querySelectorAll('body div[role="main"] h3[dir="auto"]')[1].parentElement.querySelector(':scope > div:not([aria-hidden="true"])').childNodes
                break
            }
            case '/groups': {
                nodeList = document.querySelector('body div[role="feed"]').parentElement.querySelectorAll('div[role="feed"]')
                break
            }
            default: return
        }
        log(`nodeList.length: ${nodeList.length}`)
        for (let i = startIndex; i<nodeList.length; i++) {
            let el = nodeList[i]
            if (!el.querySelector) {
                await smoothScroll(window.screen.height)
                // it's html comment, do nothing
                continue
            }
            let list = el.querySelectorAll(':scope div[aria-label="Like"]')
            if (list.length === 0) {
                log('no like element detect, do nothing')
                await smoothScroll(window.screen.height)
                continue
            }
            for (let ii = 0; ii < list.length; ii++) {
                let likeEl = list[ii]
                if (likeEl.clientWidth > 100) {
                    likeEl.click()
                    log('click like')
                } else {
                    log(`like element detected, it's comment element (width = ${likeEl.clientWidth}), do nothing`)
                }
            }
            await smoothScroll(window.screen.height)
            //el.remove()
        }
        return nodeList.length - 1 // end index
    }
    let count = 0
    let currentIndex = 0
    while(true) {
        //removeParentLayer('body div[role="main"] div[aria-label="Create a post"]', 3)
        //removeParentLayer('body div[role="main"] a[href="/stories/create/"]', 10)
        try {
            log(`loop: ${count}`)
            const processedEndIndex = await main(currentIndex)
            if (getMode() === '/') {
                currentIndex = processedEndIndex
            }
        } catch(e) {
            error(e)
        }
        await delay(getRandomInt(5000, 30000))
    }
})();
