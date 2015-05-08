define([
   "backbone",
   "models/RateLimit",
   "models/GitHubUser",
   "collections/RepositoryCollection"
], function (Backbone, RateLimit, GitHubUser, RepositoryCollection) {
   "use strict";

   /**
    * Represents an application session for a given application. Each instance has one of these for storing session variables.
    */

   return Backbone.Model.extend({
      defaults: function () {
         return {
            username: null,
            repositories: null,
            gitHubUser: null,
            lastRefreshed: null,
            baseContainer: "#appContainer",
            totalRepositoryCount: null,
            rateLimit: new RateLimit(),
            preloaded: false
         };
      },
      validate: function (attributes) {
         if (!attributes.baseContainer) {
            return "The application requires a selector for a DOM element in which it should render.";
         }
      },
      createChildren: function () {

         var username = this.get("username");

         if (!username) {
            return;
         }

         var that = this;
         var gitHubUser = new GitHubUser({login: username});
         this.set("gitHubUser", gitHubUser);

         var repositories = new RepositoryCollection([], {gitHubUser: gitHubUser, owner: this});
         this.set("repositories", repositories);

         this.listenTo(repositories, "syncAllPages", function (syncResult) {
            that.set("totalRepositoryCount", syncResult.totalItemsLoaded);
         });

         var rateLimit = this.get("rateLimit");
         rateLimit.observeRateLimitedObject(repositories);
         rateLimit.observeRateLimitedObject(gitHubUser);
      },
      switchUser: function (newUsername) {
         // Ideally we'll replace the session instance with a new one.
         // But since this is still a single instance style session, we'll just update it.

         this.stopListening();
         this.set({
            username: newUsername,
            preloaded: false,
            repositories: null,
            gitHubUser: null,
            lastRefreshed: null,
            totalRepositoryCount: null
         });

         this.createChildren();

         this.trigger("switchedUser");

      },
      initialize: function () {
         this.createChildren();
      }
   });

});
