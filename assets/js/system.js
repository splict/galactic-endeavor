/* jshint strict: true */
/* globals $, _, ge, chance, console */
(function() {
    'use strict';

    ge.system = function () {
        var i = 0,
            x = chance.integer({min: 4, max: 12}),
            planet = {},
            name = chance.capitalize(chance.pick([
                chance.word({syllables: 1}),
                chance.word({syllables: 2}),
                chance.word({syllables: 3})
            ]));

        this.id = 'system-' + chance.guid();
        this.planetIds = [];

        $('#galaxy').append(window.Mustache.render($('#tmpl-system').html(), this));

        // var offset = $('#board').offset();
        // var rect = $('.system[id="' + this.id + '"]')[0].getBoundingClientRect();

        // this.x = rect.left;
        // this.y = rect.top;
        // this.w = rect.width;
        // this.h = rect.height;

        ge.systems.push(this);

        for (i; i < x; i += 1) {
            planet = new ge.planet({
                systemName: name,
                systemId: this.id
            });
        }

        ge.positionPlanets($('.system[id="' + this.id + '"]')[0]);
    };

    //TODO
    // ge.buildGalaxyFromData = function (obj) {
    //     ge.systems = obj.ge.systems;

    //     _.each(obj.ge.systems, function (system) {
    //         $('#galaxy').append(window.Mustache.render($('#tmpl-system').html(), system));

    //         _.each(system.planets, function (planet) {
    //             $('#' + system.id).append(window.Mustache.render($('#tmpl-planet').html(), planet));
    //         });
    //     });

    //     _.each(obj.ge.players[0].ships, function (ship) {
    //         $('#board').append(window.Mustache.render($('#tmpl-ship').html(), ship));
    //     });

    //     $('.ship').each(function (index, el) {
    //         ge.ship.move({
    //             duration: 0,
    //             el: el,
    //             start: [0, 0],
    //             end: [obj.ge.players[0].ships[index].x, obj.ge.players[0].ships[index].y]
    //         });
    //     });
    // };

    ge.findSystem = function (x, y) {
        var obj = {};

        $('#galaxy').find('.system').each(function (index, el) {
            var offset = $('#board').offset();
            var rect = el.getBoundingClientRect();

            if (x > rect.left - offset.left &&
                x < rect.right - offset.left &&
                y > rect.top - offset.top &&
                y < rect.bottom - offset.top) {

                for (var i = 0; i < ge.systems.length; i += 1) {
                    if (ge.systems[i].id === $(el).attr('id')) {
                        obj = ge.systems[i];
                    }
                }
            }
        });

        return Object.keys(obj).length ? obj : false;
    };

    ge.findPlanet = function (x, y) {
        var obj = {};

        if (!ge.findSystem(x, y)) {
            return false;
        }

        $('#' + ge.findSystem(x, y).id + ' .planet .outer').each(function (index, el) {
            var offset = $('#board').offset();
            var rect = el.getBoundingClientRect();

            if (x > rect.left - offset.left &&
                x < rect.right - offset.left &&
                y > rect.top - offset.top &&
                y < rect.bottom - offset.top) {

                for (var i = 0; i < ge.planets.length; i += 1) {
                    if (ge.planets[i].id === $(el).parents('.planet').attr('id')) {
                        obj = ge.planets[i];
                    }
                }

            }
        });
        return Object.keys(obj).length ? obj : false;
    };

}());