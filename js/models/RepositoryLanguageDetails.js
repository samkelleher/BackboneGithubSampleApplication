define(["backbone", "underscore"], function (Backbone, _) {
   "use strict";

   return Backbone.Model.extend({
      url: function () {

         if (!this.id) {
            throw new Error("A repository id is required before its languages can be loaded.");
         }

         var owner = this.get("owner");

         if (!owner) {
            throw new Error("A repository owner username is required before its languages can be loaded.");
         }

         return "https://api.github.com/repos/" + owner + "/" + this.id + "/languages";
      },
      parseLanguageObject: function (response) {

         var totalBytes = 0;
         var languageData = _.map(response, function (byteLength, languageName) {
            totalBytes += byteLength;
            return {"languageName": languageName, "byteLength": byteLength};
         });

         if (!languageData.length) {
            return [];
         }

         languageData = _.each(languageData, function (language) {
            language.percentageFloat = (language.byteLength / totalBytes) * 100;
            language.percentage = ((Math.round(10 * language.percentageFloat) / 10).toFixed(1).toString()) * 1;

         });

         var getRemainder = function (languages) {

            var off = 100 - _.reduce(languages, function (acc, language) {
                  return acc + language.percentage;
               }, 0);

            off = (Math.round(10 * off) / 10).toFixed(1).toString() * 1;

            return off;

         };

         var remainder = getRemainder(languageData);

         languageData[0].percentage += remainder; // Could probably allocate the remainder a little more accuratly.

         return languageData;
      },
      setLanguageObject: function (model) {
         var languageData = this.parseLanguageObject(model);
         this.set("languageData", languageData);
         return this;
      },
      defaults: {
         languageData: null,
         owner: null
      },
      isFetched: false,
      isFetching: false,
      parse: function (response) {

         response.languageData = this.parseLanguageObject(response);
         response.id = this.id;
         response.owner = this.get("owner");

         return response;
      },
      withUrl: function (url) {
         this.url = function () {
            return url;
         };
         delete this.parse;
         return this;
      },
      processRateLimits: function (xhr) {
         if (xhr) {
            this.trigger("rateLimitedXHRComplete", xhr);
         }
      },
      fetch: function (options) {
         if (this.isFetching) {
            return null;
         }
         this.isFetching = true;
         options = options ? _.clone(options) : {};
         var success = options.success;
         var error = options.error;

         options.success = function (model, response, successOptions) {
            model.isFetched = true;
            model.isFetching = false;
            model.fetchError = false;
            model.processRateLimits(options.xhr);
            if (success) {
               success(model, response, successOptions);
            }
         };

         options.error = function (model, response, _options) {
            model.isFetched = true;
            model.isFetching = false;
            model.fetchError = true;
            model.processRateLimits(response);
            if (error) {
               error(model, response, _options);
            }
         };

         return Backbone.Model.prototype.fetch.call(this, options);
      }
   });

});

