/* jshint strict: true */
/* globals $, ge */
(function() {
    'use strict';

    var openClass = 'open';

    ge.dashboard = function (args) {
        this.$el = $('#dash');
    };

    ge.dashboard.prototype.open = function (selectedThing) {
        ge.selectedThing = selectedThing;

        selectedThing.isShip = selectedThing.id.match(/ship-/) ? true : false;
        selectedThing.isPlanet = selectedThing.id.match(/planet-/) ? true : false;

        this.$el
            .html(window.Mustache.render($('#tmpl-dash').html(), selectedThing))
            .addClass(openClass);
    };

    ge.dashboard.prototype.close = function () {
        this.$el.removeClass(openClass);
        ge.selectedThing = {};
    };

    $('body').on('click', '#dash-colonize', function (ev) {
         var planet = ge.planet.objFromID(ge.selectedThing.id);
         var ship = ge.ship.objFromID(ge.selectedThing.shipIds[0]);

         if (ge.tapping(ev) || ev.type === 'click') {
             planet.colonize({
                 faction: ship.faction,
                 color: ship.color,
                 callback: function (id) {
                     planet.colonized = true;
                 }
             });
         }
    });
}());
