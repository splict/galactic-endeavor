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