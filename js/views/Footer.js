define(["marionette", "templates", "moment"], function (Marionette, templates, moment) {
   "use strict";

   return Marionette.ItemView.extend({
      template: templates.ListFooterView,
      attributes: {
         "class": "row"
      },
      templateHelpers: function () {
         var extras = {
            _hasRateLimit: false
         };

         var requestLimitRemaining = this.rateLimit.get("requestLimitRemaining");
         var requestLimit = this.rateLimit.get("requestLimit");
         var requestLimitExpires = this.rateLimit.get("requestLimitExpires");

         if (requestLimitRemaining !== null && requestLimit !== null) {
            extras._hasRateLimit = true;
            extras._requestLimitRemaining = requestLimitRemaining;
            extras._requestLimit = requestLimit;

            var timeLeft = moment.duration(-moment.utc().diff(requestLimitExpires));

            extras._secondsLeft = timeLeft.asSeconds();
            extras._minutesLeft = timeLeft.asMinutes();
            extras._humanizeLeft = timeLeft.humanize(true);

            extras._resetsAt = requestLimitExpires.format("h:mma");
         } else {
            extras._isPreloaded = this.model.get("preloaded") || false;

         }

         return extras;
      },
      updatedRateLimit: function () {
         this.render();
      },
      initialize: function () {
         this.rateLimit = this.model.get("rateLimit");
         this.listenTo(this.rateLimit, "rateLimitUpdated", this.updatedRateLimit);
      }
   });

});
