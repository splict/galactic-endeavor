/* jshint strict: true */
/* globals $, ge, chance */
(function() {
    'use strict';

    ge.ship = function (args) {
        this.id = 'ship-' + chance.guid();
        this.name = 'USS ' + chance.capitalize(chance.pick([
            chance.word({syllables: 1}),
            chance.word({syllables: 2}),
            chance.word({syllables: 3})
        ]));
        this.health = 100;
        this.faction  = args.faction;
        this.color = args.color;
        this.x = 0;
        this.y = 0;

        ge.ships.push(this);

        $('#board').append(window.Mustache.render($('#tmpl-ship').html(), this));

        ge.ship.move({
            duration: 0,
            el: $('#' + this.id)[0],
            start: [0, 0],
            end: [args.start[0], args.start[1]]
        });

        if (args.callback) {
            args.callback(this.id);
        }
    };

    ge.ship.prototype.remove = function () {
        for (var i = 0; i < ge.ships.length; i += 1) {
            if (ge.ships[i].id === this.id) {

                ge.explode({
                    selector: '#' + this.id,
                    color: this.color,
                    onStart: function () {
                    },
                    onFinish: function (el) {
                        ge.ships.splice(i, 1);
                    }
                });
            }
        }
    };

    $('body').on('touchstart touchmove touchend click', '.ship', function (ev) {
        if (ev.target.className === 'hull') {
            var shipEl = document.querySelector('#' + $(this).attr('id')),
                shipObj = ge.ship.objFromDOM(shipEl),
                dashObj = {
                    ship: shipObj
                };

            console.log(shipObj);

            if(ge.tapping(ev) || ev.type === 'click') {
                $(this).toggleClass('active');

                $('#dash')
                    .html(window.Mustache.render($('#tmpl-dash').html(), dashObj))
                    .addClass('open');
            }
        }
    });

    ge.ship.objFromDOM = function (el) {
        var obj = {};
        for (var i = 0; i < ge.ships.length; i += 1) {
            if (ge.ships[i].id === $(el).attr('id')) {
                obj = ge.ships[i];
            }
        }
        return obj;
    };

    ge.ship.move = function (args) {
        var w = args.el.offsetWidth,
            boardOffset = $('#board').offset(),
            steps = [],
            player = {},
            start = {},
            end = {},
            distance = 0,
            duration = 0,
            endMarker = document.createElement('div');

        if (!args.el) {
            return;
        }

        if (args.start) {
            start = {
                x: args.start[0],
                y: args.start[1]
            };
        } else {
            start = {
                x: args.el.getBoundingClientRect().left - boardOffset.left,
                y: args.el.getBoundingClientRect().top - boardOffset.top
            };
        }

        end = {
            x: args.end[0] - (w / 2),
            y: args.end[1]
        };

        //console.log(start.x, start.y, '-->', end.x, end.y)

        steps = [
            {transform: 'translate(' + start.x + 'px, ' + start.y + 'px)'},
            {transform: 'translate(' + end.x + 'px, ' + end.y + 'px)'}
        ];

        distance = ge.lineDistance({x: start.x, y: start.y}, {x: end.x, y: end.y});
        duration = distance / 2 * 10;

        ge.activePlayer[args.el.id] = args.el.animate(steps, {
            duration: typeof args.duration !== 'undefined' ? args.duration : duration,
            fill: 'forwards',
        });

        ge.activePlayer[args.el.id].addEventListener('finish', window.AnimationUtilApply(steps, args.el));

        endMarker.className = 'ship-end-marker';
        endMarker.style.top = end.y + 'px';
        endMarker.style.left = (end.x + (w / 2))  + 'px';
        endMarker.id = args.el.id + '-end';
        document.querySelector('#board').appendChild(endMarker);


        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

        line.setAttribute('data-id', args.el.id);
        line.setAttribute('x1', start.x + (w / 2));
        line.setAttribute('y1', start.y);
        line.setAttribute('x2', end.x + (w / 2) + (endMarker.offsetWidth / 2));
        line.setAttribute('y2', end.y + (endMarker.offsetWidth / 2));

        document.querySelector('svg').appendChild(line);

        player = ge.activePlayer[args.el.id];

        //console.log(player)
        player.onfinish = function () {
            //console.log(player)

            $(endMarker).remove();
            $('svg line[data-id="' + args.el.id + '"]').remove();
        };
    };

    $('#board').on('touchstart touchmove touchend click', function (ev) {
        var boardScale = parseFloat(ge.matrixToArray($('#board').css('-webkit-transform'))[0]),
            parentOffset = $(this).offset(),
            relX = 0,
            relY = 0,
            activeShips = document.querySelectorAll('.active');

        if (ev.type === 'touchend') {
            relX = ev.originalEvent.changedTouches[0].pageX;
            relY = ev.originalEvent.changedTouches[0].pageY;
        } else {
            relX = ev.pageX;
            relY = ev.pageY;
        }

        relX = relX - parentOffset.left;
        relY = relY - parentOffset.top;

        if ((ge.tapping(ev) || ev.type === 'click') &&
            boardScale === 1 &&
            activeShips.length &&
            !$(ev.target).hasClass('ship') &&
            !$(ev.target).parent().hasClass('ship')) {

            $('#board').find('.active').each(function () {
                ge.activePlayer[$(this).attr('id')].pause();
                $('#' + $(this).attr('id') + '-end').remove();
                $('svg line[data-id="' + $(this).attr('id') + '"]').remove();

                ge.ship.move({
                    el: $(this)[0],
                    end: [relX, relY]
                });
            });

            $('#board').find('.active').removeClass('active');
        }
    });

    ge.findShip = function (x, y) {
        var obj = {};

        $('.ship .outer').each(function (index, el) {
            var offset = $('#board').offset();
            var rect = el.getBoundingClientRect();

            if (x > rect.left - offset.left &&
                x < rect.right - offset.left &&
                y > rect.top - offset.top &&
                y < rect.bottom - offset.top) {

                for (var i = 0; i < ge.ships.length; i += 1) {
                    if (ge.ships[i].id === $(el).parents('.ship').attr('id')) {
                        obj = ge.ships[i];
                    }
                }
            }
        });
        return Object.keys(obj).length ? obj : false;
    };


    function svgDraw() {
        setTimeout(function() {
            window.requestAnimFrame(svgDraw);
            $('.ship').each(function () {
                var m = ge.matrixToArray($(this).css('-webkit-transform'));

                $('svg line[data-id="' + $(this).attr('id') + '"]').attr({
                    x1: parseFloat(m[4]) + ($(this).width() / 2),
                    y1: parseFloat(m[5]) + ($(this).height() / 2)
                });
            });
        }, 1000 / 20);
    }
    svgDraw();

    var health = 0;

    function shipTick() {
        setTimeout(function() {
            window.requestAnimFrame(shipTick);

            ge.battles = [];

            for (var k = 0; k < ge.ships.length; k += 1) {
                if (ge.ships[k].health < 100) {
                    health = ge.ships[k].health += 1;
                    $('#' + ge.ships[k].id).find('.health div').css('width', health + '%');
                }
            }

            $('.ship').removeClass('fight stack').each(function () {
                var m = ge.matrixToArray($(this).css('-webkit-transform')),
                    x = parseFloat(m[4]) + ($(this).width() / 2),
                    y = parseFloat(m[5]) + ($(this).height() / 2),
                    s = ge.findShip(x, y);

                for (var i = 0; i < ge.ships.length; i += 1) {
                    if (ge.ships[i].id === this.id) {
                        ge.ships[i].x = x;
                        ge.ships[i].y = y;
                    }

                    if (ge.ships[i].x === x &&
                        ge.ships[i].y === y &&
                        ge.ships[i].id !== this.id) {

                        $(this).addClass('stack');
                    }
                }

                if (s && s.id !== this.id &&
                    s.faction !== ge.ship.objFromDOM(this).faction) {

                    if (ge.battles.indexOf(this.id) === -1) {
                        ge.battles.push(this.id);
                    }
                    if (ge.battles.indexOf(s.id) === -1) {
                        ge.battles.push(s.id);
                    }
                }
            });

            for (var j = 0; j < ge.battles.length; j += 1) {
                $('#' + ge.battles[j]).addClass('fight');

                for (var k = 0; k < ge.ships.length; k += 1) {
                    if (ge.ships[k].id === ge.battles[j]) {
                        health = ge.ships[k].health - chance.d20();

                        if (health > 0) {
                            ge.ships[k].health = health;
                            $('#' + ge.ships[k].id).find('.health div').css('width', health + '%');
                        } else {
                            ge.ships[k].remove();
                        }
                    }
                }
            }
        }, 1000 / 1);
    }
    shipTick();

}());