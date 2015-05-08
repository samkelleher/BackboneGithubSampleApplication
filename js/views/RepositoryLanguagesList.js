define(["marionette", "templates"], function (Marionette, templates) {
   "use strict";

   return Marionette.ItemView.extend({
      attributes: {
         "class": "repoLanguagesContainer"
      },
      template: templates.RepositoryLanguagesListView,
      templateHelpers: function () {

         var extras = {
            isFetched: this.model.isFetched,
            isFetching: this.model.isFetching,
            fetchError: this.model.fetchError
         };

         var languageData = this.model.get("languageData");

         if (languageData) {
            extras._numberOfLanguages = languageData.length;

            if (extras._numberOfLanguages > 12) {
               // Can't display each one in a column.
            } else {
               extras._columnSize = Math.floor(12 / extras._numberOfLanguages);

               if ((extras._columnSize * languageData._numberOfLanguages) < 12) {
                  extras._finalFillerColumn = 12 - (extras._columnSize * extras._numberOfLanguages);
               } else {
                  extras._finalFillerColumn = 0;
               }

            }

         }

         return extras;
      },
      modelEvents: {
         "change": "render",
         "sync": "render",
         "error": "render"
      }
   });

});
