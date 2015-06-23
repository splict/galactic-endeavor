/* jshint strict: true */
/* globals $, ge, moment, console */
 (function () {
    'use strict';

    if (localStorage.getItem(ge.storeId)) {
        //TODO
        //ge.buildGalaxyFromData(JSON.parse(localStorage.getItem(ge.storeId)));
    } else {

        for (var i = 0; i < 25; i += 1) {
            new ge.system();
        }

        console.log('galaxy with ' + ge.planets.length + ' planets');
    }

    window.iScrollObj = new window.IScroll('#wrap', {
        freeScroll: true,
        //zoom: true,
        //mouseWheel: true,
        //wheelAction: 'zoom',
        //zoomMax: 1,
        //zoomMin: 0.2,
        //zoomStart: 4,
        scrollX: true
    });

    new ge.player({
        faction: 'user',
        color: 'green',
        //ai: true,
        system: 1
    });

    new ge.player({
        faction: 'opfor',
        color: 'red',
        ai: true,
        difficulty: 1,
        system: 2
    });

    function tick() {
        setTimeout(function() {
            window.requestAnimFrame(tick);

            document.querySelector('#clock').innerHTML = moment().format('MMMM Do YYYY, h:mm:ss a');

        }, 1000 / 1);
    }
    tick();
})();