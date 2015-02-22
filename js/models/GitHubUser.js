define(["backbone"], function(Backbone) {
    'use strict';

    return Backbone.Model.extend({
        defaults: {
            name:"",
            login:"" // < This is the username, but for this endpoint only, it's called login instead.
        },
        url: function() {
            var login = this.get("login");

            if (!login) {
                throw new Error("Cannot get a users profile without their username.");
            }

            return "https://api.github.com/users/" + login;
        },
        processRateLimits: function(xhr) {
            if (xhr) { this.trigger("rateLimitedXHRComplete", xhr); }
        },
        fetch: function(options) {
            options = options ? _.clone(options) : {};

            var complete = options.complete;
            var error = options.error;
            var model = this;

            options.complete = function(jqXHR, textStatus) {
                model.processRateLimits(jqXHR);
                if (complete) complete(jqXHR, textStatus);
            };

            options.error = function(model, response, options) {
                model.processRateLimits(response);
                if (error) error(model, response, options);
            };

            return Backbone.Model.prototype.fetch.call(this, options);
        }
    });

});
