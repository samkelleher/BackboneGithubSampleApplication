define(["marionette", "templates", "jquery"], function (Marionette, templates, $) {
   "use strict";

   return Marionette.ItemView.extend({
      template: templates.UsageInstructionsView,
      events: {
         "click .cmdViewUser": "cmdViewUser",
         "click .cmdSearch": "cmdSearch",
         "keydown .txtSearchUsername": "cmdSearchOnEnter"
      },
      ui: {
         "txtSearchUsername": ".txtSearchUsername"
      },
      cmdSearchOnEnter: function (e) {
         if (e.which === 13) {
            this.cmdSearch();
         }
      },
      isValidGitHubUsername: function (username) {
         return /^\w[\w-]+$/.test(username);
      },
      cmdSearch: function () {
         var username = this.ui.txtSearchUsername.val();

         if (!username || !username.length) {
            this.ui.txtSearchUsername.focus();
            return;
         }

         username = username.trim();

         if (!this.isValidGitHubUsername(username)) {
            this.ui.txtSearchUsername.focus();
            return;
         }

         this.trigger("viewProfile", username);
      },
      cmdViewUser: function (e) {
         e.preventDefault();

         var username = $(e.currentTarget).attr("href").split("/")[1];

         this.trigger("viewProfile", username);
      }
   });

});
