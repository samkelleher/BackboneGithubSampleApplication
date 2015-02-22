define(["backbone"], function(Backbone) {
    'use strict';

    return Backbone.Model.extend({
        defaults: {
            message:"Sorry, an error has occoured..."
        }
    });

});