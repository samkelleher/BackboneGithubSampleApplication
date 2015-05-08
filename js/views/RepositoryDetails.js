define(["marionette", "templates", "moment"], function (Marionette, templates, moment) {
   "use strict";

   return Marionette.ItemView.extend({
      template: templates.RepositoryDetailsView,
      attributes: {
         "class": "repoDetailsContainer"
      },
      templateHelpers: function () {

         var extras = {};

         var updated_at = this.model.get("updated_at");

         if (updated_at) {
            extras._lastUpdated = "Last updated " + moment.utc(updated_at).fromNow();
         } else {
            extras._lastUpdated = "Last update information not available. ";
         }

         return extras;
      }
   });

});
