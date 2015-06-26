/* jshint strict: true */
 (function () {
    'use strict';

    window.ge = {
        storeId: 'ge-store',
        activePlayer: {},
        systems: [],
        planets: [],
        ships: [],
        players: [],
        localStorageSupported: function () {
            var str = 'test';
            try {
                localStorage.setItem(str, str);
                localStorage.removeItem(str);
                return true;
            } catch(e) {
                return false;
            }
        },
        getRandomArbitary: function (min, max) {
            return Math.round(Math.random() * (max - min) + min);
        },
        shuffle: function (arr) {
            var tmp,
                current,
                top = arr.length;

            if(top) while(--top) {
                current = Math.floor(Math.random() * (top + 1));
                tmp = arr[current];
                arr[current] = arr[top];
                arr[top] = tmp;
            }

            return arr;
        },
        rangeArray: function (min, max) {
            var i,
                arr = [];

            for (i = min; i < max; i += 1) {
                arr.push(i);
            }
            return arr;
        },
        lineDistance: function (point1, point2) {
            var xs = 0;
            var ys = 0;

            xs = point2.x - point1.x;
            xs = xs * xs;

            ys = point2.y - point1.y;
            ys = ys * ys;

            return Math.sqrt(xs + ys);
        },
        collides: function(a, b) {
            var rect1 = a.getBoundingClientRect(),
                rect2 = b.getBoundingClientRect();

            return !(rect1.left > rect2.right || rect1.right < rect2.left ||
                rect1.top > rect2.bottom || rect1.bottom < rect2.top);
        },
        matrixToArray: function (matrix) {
            return matrix.substr(7, matrix.length - 8).split(', ');
        },
        save: function () {
            var now = new Date(),
                obj = {};

            if (!ge.localStorageSupported) {
                return;
            }

            $('.ship').each(function (index, el) {
                var offset = $('#board').offset();
                // var index = _.findIndex(ge.players[0].ships, function(obj) {
                //     return obj.id == $(el).attr('id');
                // });

                for (var i = 0; i < ge.players.length; i += 1) {

                }

                // console.log($(this)[0].getBoundingClientRect().left - offset.left)
                // console.log($(this)[0].getBoundingClientRect().top - offset.top)

                ge.players[0].ships[index].x = $(this)[0].getBoundingClientRect().left - offset.left;
                ge.players[0].ships[index].y = $(this)[0].getBoundingClientRect().top - offset.top;
            });

            obj = {
                date: now.getTime(),
                ge: ge
            };

            localStorage.setItem(ge.storeId, JSON.stringify(obj));
        },
        tapFlag: 0,
        tapping: function (ev) {
            var bool = false;
            if (ev.type === 'touchstart') {
                this.tapFlag = 1;
            }
            if (ev.type === 'touchmove') {
                this.tapFlag = 0;
            }
            if (ev.type === 'touchend') {
                if (this.tapFlag === 1) {
                    bool = true;
                } else if (this.tapFlag === 0) {
                    bool = false;
                }
            }
            return bool;
        },
        explode: function (args)  {
            var _this = document.querySelector(args.selector),
                par = {},
                rect = _this.getBoundingClientRect(),
                player = {},
                steps = [],
                xvel = 0,
                yvel = 0,
                spd = args.speed ? args.speed : 200,
                parct = args.particleCount ? args.particleCount : 20,
                diam = args.diameter ? args.diameter : 10,
                hol = document.createElement('div'),
                i = 0;

            if (args.onStart) {
                args.onStart(_this);
            }

            setTimeout(function () {
                _this.parentNode.removeChild(_this);
            }, 50);

            hol.style.position = 'absolute';
            hol.style.top = rect.top + 'px';
            hol.style.left = rect.left + 'px';
            hol.style.width = rect.width + 'px';
            hol.style.height = rect.height + 'px';
            hol.style.zIndex = 2;
            document.body.appendChild(hol);

            for (var i = 0; i < parct; i += 1) {
                par = document.createElement('div');
                par.style.width = diam + 'px';
                par.style.height = diam + 'px';
                par.style.background = args.color;
                par.style.position = 'absolute';
                par.style.borderRadius = '50%';
                par.dataset.particle = true;
                hol.appendChild(par);

                switch(Math.floor(Math.random() * 4)) {
                    case 0:
                        xvel -= Math.random() * spd;
                        yvel -= Math.random() * spd;
                        break;
                    case 1:
                        xvel += Math.random() * spd;
                        yvel -= Math.random() * spd;
                        break;
                    case 2:
                        xvel += Math.random() * spd;
                        yvel += Math.random() * spd;
                        break;
                    case 3:
                        xvel -= Math.random() * spd;
                        yvel += Math.random() * spd;
                        break;
                }

                steps = [
                    {transform: 'translate(' + rect.width / 2 + 'px, ' + rect.height / 2 + 'px)'},
                    {transform: 'translate(' + xvel + 'px, ' + yvel + 'px) scale(.1)'}
                ];

                player = par.animate(steps, {
                    duration: args.duration ? args.duration : 2000,
                    fill: 'forwards',
                });
            }

            player.onfinish = function () {
                hol.parentNode.removeChild(hol);
                if (args.onFinish) {
                    args.onFinish(_this);
                }
            };

            var tick = function () {
                var par = document.querySelectorAll('[data-particle=true]'),
                    rect = {},
                    margin = 0;

                if (par.length) {
                    for (i = 0; i < par.length; i += 1) {
                        rect = par[i].getBoundingClientRect();

                        if (rect.top <= 0 ||
                            rect.left <= 0 ||
                            rect.bottom >= (document.documentElement.clientHeight) ||
                            rect.right >= (document.documentElement.clientWidth)) {
                            par[i].parentNode.removeChild(par[i]);
                        }
                    }
                }
                window.requestAnimationFrame(tick);
            };
            window.requestAnimationFrame(tick);
        }
    };

    // requestAnim shim layer by Paul Irish
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(/* function */ callback, /* DOMElement */ element){
                  window.setTimeout(callback, 1000 / 60);
              };
    })();
}());