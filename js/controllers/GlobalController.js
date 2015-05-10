define([
   "marionette",
   "views/RepositoryListCollection",
   "views/Header",
   "views/Footer",
   "views/UsageInstructions",
   "models/ApplicationError",
   "views/ContentError",
   "views/RepositoryDetailsLayout",
   "common/FillWithSampleData"
], function (Marionette, RepositoryListCollectionView, HeaderView, FooterView, UsageInstructionsView, ApplicationError, ContentErrorView, RepositoryDetailsLayout, fillWithSampleData) {
   "use strict";

   return Marionette.Controller.extend({
      initialize: function (/*options*/) {

         if (!this.options.application) {
            throw new Error("A controller needs a reference to the application that created it.");
         }
         this.application = this.options.application;

         if (!this.options.session) {
            throw new Error("A controller needs a reference to the session that it is running in.");
         }
         this.session = this.options.session;
      },
      repoList: function () {
         var that = this;

         this.application.router.navigate("user/" + this.session.get("username"));

         var collection = this.session.get("repositories");

         var listView = new RepositoryListCollectionView({collection: collection, model: this.session});

         this.listenToOnce(listView, "selectedItem", function (selectedItem) {
            that.viewRepositoryDetail(selectedItem);
         });

         this.application.rootLayout.content.show(listView);
         this.application.rootLayout.header.show(new HeaderView({model: this.session}));
         this.application.rootLayout.footer.show(new FooterView({model: this.session}));

      },
      index: function () {
         var that = this;
         this.application.rootLayout.header.show(new HeaderView());

         var welcomeScreen = new UsageInstructionsView();

         this.listenToOnce(welcomeScreen, "viewProfile", function (username) {
            that.indexWithUsername(username);
         });

         this.application.rootLayout.content.show(welcomeScreen);
      },
      executeUserLoad: function () {
         var collection = this.session.get("repositories");
         var gitHubUser = this.session.get("gitHubUser");
         var username = this.session.get("username");
         var that = this;

         gitHubUser.fetch({
            success: function () {
               collection.fetchAllPages();
            },
            timeout: 10000,
            error: function (model, response/*, options*/) {

               var error = null;

               if (response.statusText === "timeout") {
                  // The server did not respond...
                  error = new ApplicationError({message: "The request to download profile of GitHub user '" + username + "' has timed out."});

               } else {
                  if (response.status === 404) {
                     // The user account does not exist...

                     error = new ApplicationError({message: "The username '" + username + "' does not exist on GitHub."});

                  } else if (response.status === 403) {
                     // Rate limit has been hit...

                     error = new ApplicationError({message: "You have hit the API rate limit set by GitHub. Please try again later."});

                  } else if (response.status === 500) {
                     // API issues
                     error = new ApplicationError({message: "The GitHub API returned a server error. They might be down, try again?"});

                  }
               }

               if (!error) {
                  error = new ApplicationError({message: "Downloading profile '" + username + "' had an unexpected error."});
               }
               that.application.rootLayout.header.show(new HeaderView());
               that.application.rootLayout.content.show(new ContentErrorView({model: error}));
            }
         });
      },
      indexWithUsername: function (username) {

         if (this.session === null) {
            // There should always be a session.
         } else {
            var currentUsername = this.session.get("username");

            if (currentUsername === username) {
               // The session is still for the loaded user.
               // Use the cached data.
               this.repoList();
            } else {
               // Switch user and update the UI
               this.session.switchUser(username);

               if (username === "sample") {
                  fillWithSampleData(this.session);
               } else {
                  this.session.set("username", username);
                  this.executeUserLoad();
               }

               this.repoList();
            }
         }

      },
      viewRepositoryDetail: function (repository) {
         var that = this;

         this.application.router.navigate("user/" + repository.get("owner").login + "/repository/" + repository.id);

         var detailsView = new RepositoryDetailsLayout({model: repository, session: this.session});

         this.listenToOnce(detailsView, "goHome", function () {
            that.repoList();
         });

         this.application.rootLayout.content.show(detailsView);
      },
      viewRepositoryDetailById: function (username, repositoryId) {

         var repository = this.session.get("repositories").get(repositoryId);

         if (!repository) {
            this.application.router.navigate("user/" + username + "/repository/" + repositoryId);
            this.application.rootLayout.content.show(new ContentErrorView({model: new ApplicationError({message: "A repository with id '" + repositoryId + "' was not found."})}));
            return;
         }

         this.viewRepositoryDetail(repository);

      },
      defaultAction: function (path) {
         this.fileNotFound(path);
      },
      fileNotFound: function (path) {
         var error = new ApplicationError({message: "The file at '" + path + "' was not found."});
         this.application.rootLayout.header.show(new HeaderView());
         this.application.rootLayout.content.show(new ContentErrorView({model: error}));
      }
   });

});
