/* jshint strict: true */
/* globals $, ge, chance */
(function () {
    'use strict';

    ge.player = function (args) {
        var _this = this;
        this.id = 'player-' + chance.guid();
        this.shipIds = [];
        this.planetIds = [];
        this.faction = args.faction;
        this.color = args.color;

        var t1 = document.querySelector('#galaxy .system:nth-child(' + args.system + ') .planet:first-child');
        var t2 = document.querySelector('#galaxy .system:nth-child(' + args.system + ') .planet:last-child');
        var offset = $('#board').offset();

        var ship1 = new ge.ship({
            faction: this.faction,
            color: this.color,
            start: [
                t1.getBoundingClientRect().left - offset.left,
                t1.getBoundingClientRect().top - offset.top
            ],
            callback: function (id) {
                _this.shipIds.push(id);
            }
        });

        var ship2 = new ge.ship({
            faction: this.faction,
            color: this.color,
            start: [
                t2.getBoundingClientRect().left - offset.left,
                t2.getBoundingClientRect().top - offset.top
            ],
            callback: function (id) {
                _this.shipIds.push(id);
            }
        });

        ge.planet.objFromDOM(t1).colonize({
            faction: this.faction,
            color: this.color,
            callback: function (id) {
                _this.planetIds.push(id);
            }
        });
        ge.planet.objFromDOM(t2).colonize({
            faction: this.faction,
            color: this.color,
            callback: function (id) {
                _this.planetIds.push(id);
            }
        });
        ge.players.push(this);


        if (args.ai) {

            setTimeout(function () {
                var interval = setInterval(function () {
                    for (var i = 0; i < ge.ships.length; i += 1) {
                        if (ge.ships[i].faction === _this.faction) {
                            var boardOffset = $('#board').offset();
                            var ship = $('#' + ge.ships[i].id);
                            var system = ge.findSystem(ge.ships[i].x, ge.ships[i].y);
                            var x = chance.integer({min: 0, max: system.planetIds.length - 1});
                            var p = $('#' + system.id).find('.planet:eq(' + x + ')')[0];

                            ge.ship.move({
                                el: ship[0],
                                end: [
                                    p.getBoundingClientRect().left - boardOffset.left,
                                    p.getBoundingClientRect().top - boardOffset.top
                                ]
                            });
                        }
                    }
                }, 25000);

                setInterval(function () {
                    for (var j = 0; j < ge.planets.length; j += 1) {
                        if (ge.planets[j].shipIds.length) {

                            for (var k = 0; k < ge.ships.length; k += 1) {
                                if (ge.ships[k].faction === _this.faction) {

                                    if (!ge.planets[j].colonized) {
                                        ge.planets[j].colonize({
                                            faction: _this.faction,
                                            color: _this.color,
                                            callback: function (id) {
                                                _this.planetIds.push(id);
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    }
                }, 24000);


            }, 500);

        }
    };

}());