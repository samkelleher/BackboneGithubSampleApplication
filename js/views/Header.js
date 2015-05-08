define(["marionette", "templates"], function (Marionette, templates) {
   "use strict";

   return Marionette.ItemView.extend({
      template: templates.HeaderView,
      attributes: {
         "class": "row"
      },
      initialize: function () {
         if (this.model) {
            this.collection = this.model.get("repositories");

            if (!this.collection) {
               throw new Error("The header view requires access to the underlying collection to function if there is a model set.");
            }
         }

      },
      userProfileUpdated: function () {

      },
      modelEvents: {
         "change": "sessionUpdates",
         "change:gitHubUser": "userProfileUpdated"
      },
      collectionEvents: {
         "requestAllPages": "setLoadingState",
         "requestAllPagesProgress": "setLoadingStateWithProgress",
         "syncAllPages": "updateStatus"
      },
      ui: {
         "title": "h2"
      },
      sessionUpdates: function () {
         //console.log("session updated ", this.model.toJSON());
      },
      updateStatus: function () {
         this.setStatusTitle("");
      },
      setLoadingState: function () {

         var username = this.model.get("username");

         if (username) {
            this.setStatusTitle("Loading @" + username + "...");
         } else {
            this.setStatusTitle("Loading...");
         }

      },
      setLoadingStateWithProgress: function (progress) {
         this.setStatusTitle("Loading (" + progress.totalRepositoryCount + " loaded so far)...");
      },
      setStatusTitle: function (newTitle) {
         this.statusTitle = newTitle;
         this.render();
      },
      statusTitle: "",
      templateHelpers: function () {
         var extras = {
            _statusTitle: this.statusTitle,
            _name: "Welcome"
         };

         if (this.model) {
            var gitHubUser = this.model.get("gitHubUser");

            if (gitHubUser) {
               extras._name = gitHubUser.get("name");
               extras._avatar_url = gitHubUser.get("avatar_url");
            }
         }

         return extras;
      }
   });

});
