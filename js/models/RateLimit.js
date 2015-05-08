define(["backbone", "moment"], function (Backbone, moment) {
   "use strict";

   return Backbone.Model.extend({
      defaults: {
         requestLimit: null,
         requestLimitRemaining: null,
         requestLimitExpires: null, // < Intented to be a DateTime/moment
         requestLimitReset: null // < Intented to be the unix EPOCH.
      },
      triggerRateLimitUpdate: function (requestLimit, requestLimitRemaining, requestLimitReset) {
         if (requestLimit !== null || requestLimitRemaining !== null || requestLimitReset !== null) {
            var fetchResult = {
               requestLimit: requestLimit,
               requestLimitRemaining: requestLimitRemaining,
               requestLimitReset: requestLimitReset,
               requestLimitExpires: moment.unix(requestLimitReset)
            };

            this.set(fetchResult);
            this.trigger("rateLimitUpdated", fetchResult);
         }
      },
      processLimitsFromXHR: function (xhr) {

         if (!xhr) {
            return;
         }

         var requestLimit = xhr.getResponseHeader("X-RateLimit-Limit");
         var requestLimitRemaining = xhr.getResponseHeader("X-RateLimit-Remaining");
         var requestLimitReset = xhr.getResponseHeader("X-RateLimit-Reset");

         if (requestLimit !== null) {
            requestLimit = requestLimit * 1;
         }

         if (requestLimitRemaining !== null) {
            requestLimitRemaining = requestLimitRemaining * 1;
         }

         if (requestLimitReset !== null) {
            requestLimitReset = requestLimitReset * 1;
         }

         this.triggerRateLimitUpdate(requestLimit, requestLimitRemaining, requestLimitReset);

      },
      observeRateLimitedObject: function (obj) {
         this.listenTo(obj, "rateLimitedXHRComplete", this.processLimitsFromXHR);
      }
   });

});
