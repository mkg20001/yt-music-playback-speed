// ==UserScript==
// @name         YouTube Music Playback Speed
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Allows to adjust the playback speed on youtube music web
// @author       Maciej Krüger (mkg20001@gmail.com)
// @match        https://music.youtube.com/*
// @icon         https://www.google.com/s2/favicons?domain=music.youtube.com
// @grant GM_setValue
// @grant GM_getValue
// ==/UserScript==

// Contrib at https://github.com/mkg20001/yt-music-playback-speed

(function() {
    'use strict';

    let playbackSpeed = GM_getValue('speed') || 1

    const log = console.log.bind(console)

    function applySpeed() {
        if (!v) return
        log('reset rate: was %o, is %o', v.playbackRate, playbackSpeed)
        v.playbackRate = playbackSpeed
    }

    function storeSpeed(speed) {
        log('ratechange: was %o, is %o', speed, v.playbackRate)
        playbackSpeed = speed
        GM_setValue('speed', speed)
        if (s) {
            s.textContent = playbackSpeed.toFixed(2) + 'x'
        }
    }

    function signBtn(sign, fnc) {
        const btn = document.createElement('p')
        btn.style.fontWeight = 'bold'
        btn.style.fontSize = '4em'
        btn.style.margin = '0.2em 0.4em'
        btn.style.cursor = 'pointer'
        btn.textContent = sign
        btn.onclick = fnc

        return btn
    }

    let v
    let s

    function adjRate(amount) {
        storeSpeed(parseFloat((playbackSpeed + amount).toFixed(10), 10))
        applySpeed()
    }

    function registerBar() {
        const bar = document.querySelector('#left-controls')

        if (!bar) return alert('yt music playback speed had an error while intializing: register couldnt find bar')

        const div = document.createElement('div')
        div.style.display = 'flex'
        div.style.alignItems = 'center'

        s = document.createElement('p')
        s.style.fontSize = '2em'
        storeSpeed(playbackSpeed)

        div.append(signBtn('-', (e) => {
          e.preventDefault()
          adjRate(e.shiftKey ? -0.01 : -0.1)
        }))
        div.append(s)
        div.append(signBtn('+', (e) => {
          e.preventDefault()
          adjRate(e.shiftKey ? 0.01 : 0.1)
        }))

        bar.append(div)
    }

    function register() {
        v = document.querySelector('video')

        log('registering')

        /*
        TODO: interopability with other playback speed controller extensions
        currently this causes trouble as ratechange sometimes fires because of yt music's code

        v.addEventListener('ratechange', (e) => {
            storeSpeed(v.playbackRate)
        })
        */

        v.addEventListener('loadeddata', (e) => {
            applySpeed()
        })

        registerBar()
    }

    const intv = setInterval(() => {
        if (!document.querySelector('video')) return // didn't load yet
        register()
        clearInterval(intv)
    }, 100)
 })();
