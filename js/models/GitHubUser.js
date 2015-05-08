define(["backbone", "underscore"], function (Backbone, _) {
   "use strict";

   return Backbone.Model.extend({
      defaults: {
         name: "",
         login: "" // < This is the username, but for this endpoint only, it's called login instead.
      },
      url: function () {
         var login = this.get("login");

         if (!login) {
            throw new Error("Cannot get a users profile without their username.");
         }

         return "https://api.github.com/users/" + login;
      },
      processRateLimits: function (xhr) {
         if (xhr) {
            this.trigger("rateLimitedXHRComplete", xhr);
         }
      },
      fetch: function (options) {
         options = options ? _.clone(options) : {};

         var complete = options.complete;
         var error = options.error;
         var model = this;

         options.complete = function (jqXHR, textStatus) {
            model.processRateLimits(jqXHR);
            if (complete) {
               complete(jqXHR, textStatus);
            }
         };

         options.error = function (errorModel, response, errorOptions) {
            errorModel.processRateLimits(response);
            if (error) {
               error(errorModel, response, errorOptions);
            }
         };

         return Backbone.Model.prototype.fetch.call(this, options);
      }
   });

});
