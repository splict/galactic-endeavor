/* jshint strict: true */
/* globals ge, $, chance, console */
(function() {
    'use strict';

    ge.planet = function (args) {
        this.id = 'planet-' + chance.guid();
        this.systemName = args.systemName;
        this.systemId = args.systemId;
        this.name = chance.capitalize(chance.pick([
            chance.word({syllables: 1}),
            chance.word({syllables: 2}),
            chance.word({syllables: 3})
        ]));
        this.size = chance.pick(['small', 'medium', 'large', 'giant']);
        this.climate = chance.pick(['warm', 'cold', 'moderate', 'gas', 'ice', 'hot']);
        this.population = chance.integer({min: 0, max: 100000});
        this.minerals = chance.integer({min: 0, max: 10000});
        this.shipIds = [];
        this.colonized = false;

        //TODO: based on climate
        var hue = [];
        switch(this.climate) {
            case 'hot':
                hue = chance.integer({min: 0, max: 40});
                this.water = 0;
                break;
            case 'warm':
                hue = chance.integer({min: 40, max: 60});
                this.water = chance.integer({min: 0, max: 50});
                break;
            case 'moderate':
                hue = chance.integer({min: 90, max: 150});
                break;
            case 'cold':
                hue = chance.integer({min: 150, max: 240});
                break;
            case 'gas':
                hue = chance.integer({min: 0, max: 330});
                break;
            case 'ice':
                hue = chance.integer({min: 210, max: 250});
                break;
            default:
                this.water = chance.integer({min: 0, max: 10000});
        }

        // generate color
        var color2 = '#' + tinycolor('hsl(' + hue + ', 60%, 50%)').toHex();
        var color1 = tinycolor(color2).lighten(20).toString();
        var color3 = tinycolor(color2).darken(40).toString();

        this.gradientStr = ' radial-gradient(circle at 43% 34%, ' + color1 + ', ' + color2 + ', ' + color3 + ')';

        ge.planets.push(this);

        for (var i = 0; i < ge.systems.length; i += 1) {
            if (ge.systems[i].id === this.systemId) {
                ge.systems[i].planetIds.push(this.id);
            }
        }

        $('#' + this.systemId).append(window.Mustache.render($('#tmpl-planet').html(), this));
    };

    ge.planet.objFromDOM = function (el) {
        var obj = {};
        for (var i = 0; i < ge.planets.length; i += 1) {
            if (ge.planets[i].id === $(el).attr('id')) {
                obj = ge.planets[i];
            }
        }
        return obj;
    };

    ge.planet.prototype.colonize = function (args) {
        var el = document.createElement('div');
        el.className = 'colony';
        el.className += ' colony-' + args.color;

        $('.planet[id="' + this.id + '"] .orb').find('.colony').remove()
        $('.planet[id="' + this.id + '"] .orb').append(el);
        this.colonized = true;
        this.faction = args.faction;

        console.log('colonizing on ' + this.name);

        if (args.callback) {
            args.callback(this.id);
        }
    };

    // ge.planet.prototype.orbit = function () {
    //     console.log('orbiting, ', this);
    // };

    ge.planet.prototype.mine = function (amount) {
        this.mined = true;
        this.minerals -= amount;
        console.log('mining, ', this.minerals + ' remaining');
    };

    ge.planet.prototype.siphon = function (amount) {
        this.siphoned = true;
        this.water -= amount;
        console.log('siphoning: ', this.water);
    };

    $('#board').on('click', function (ev) {
        var className = 'selected';

        if (!$(ev.target).hasClass(className) && !$(ev.target).parent().hasClass(className)) {
            $('.' + className).removeClass(className);
        }
    });

    $('#board').on('touchstart touchmove touchend click', '.planet', function (ev) {
        var className = 'selected',
            menuObj = {
                planet: true
            };

        if(ge.tapping(ev) || ev.type === 'click') {
            var p = document.querySelector('#' + $(this).attr('id'))
            console.log(ge.planet.objFromDOM(p))

            $(this).toggleClass(className).siblings().removeClass(className)
                .parent().siblings().find('.' + className).removeClass(className);
        }
    });

    ge.positionPlanets = function (target) {
        var offset = 100;

        var min_x = offset;
        var max_x = target.offsetWidth - offset;
        var min_y = offset;
        var max_y = target.offsetHeight - offset;
        var filled_areas = [];

        $(target).find('.planet').each(function() {
            var rand_x = 0;
            var rand_y = 0;
            var area;

            do {
                rand_x = Math.round(min_x + ((max_x - min_x)*(Math.random() % 1)));
                rand_y = Math.round(min_y + ((max_y - min_y)*(Math.random() % 1)));
                area = {
                    x: rand_x,
                    y: rand_y,
                    width: $(this).width(),
                    height: $(this).height()
                };
            } while(check_overlap(area));

            filled_areas.push(area);

            $(this).css({
                left: rand_x,
                top: rand_y
            });
        });

        function check_overlap(area) {
            for (var i = 0; i < filled_areas.length; i++) {

                var check_area = filled_areas[i];

                var bottom1 = area.y + area.height;
                var bottom2 = check_area.y + check_area.height;
                var top1 = area.y;
                var top2 = check_area.y;
                var left1 = area.x;
                var left2 = check_area.x;
                var right1 = area.x + area.width;
                var right2 = check_area.x + check_area.width;

                if (bottom1 < top2 || top1 > bottom2 || right1 < left2 || left1 > right2) {
                    continue;
                }
                return true;
            }
            return false;
        }
    };

    function updatePlanetShipIds() {
        setTimeout(function() {
            window.requestAnimFrame(updatePlanetShipIds);

            for (var i = 0; i < ge.planets.length; i += 1) {
                ge.planets[i].shipIds = [];
            }

            $('.ship').each(function () {
                var m = ge.matrixToArray($(this).css('-webkit-transform')),
                    x = parseFloat(m[4]) + ($(this).width() / 2),
                    y = parseFloat(m[5]) + ($(this).height() / 2),
                    p = {};

                if (ge.findPlanet(x, y)) {
                    p = document.querySelector('#' + ge.findPlanet(x, y).id)
                    ge.planet.objFromDOM(p).shipIds.push($(this)[0].id);
                }
            });

        }, 1000 / 2);
    }
    updatePlanetShipIds();
}());