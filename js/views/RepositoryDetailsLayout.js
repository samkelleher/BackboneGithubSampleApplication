define([
   "marionette",
   "templates",
   "views/RepositoryDetails",
   "views/RepositoryLanguagesList"
], function (Marionette, templates, RepositoryDetailsView, RepositoryLanguagesListView) {
   "use strict";

   return Marionette.LayoutView.extend({
      template: templates.RepositoryDetailsLayout,
      attributes: {
         "class": "repositoryDetailsLayoutContainer"
      },
      regions: {
         repoDetailsSummaryHeaderContainer: ".repoDetailsSummaryHeaderContainer",
         repoDetailsLanguagesContainer: ".repoDetailsLanguagesContainer"
      },
      events: {
         "click .cmdGoHome": "cmdGoHome"
      },
      cmdGoHome: function (e) {
         e.preventDefault();
         this.trigger("goHome");
      },
      onShow: function () {
         this.repoDetailsSummaryHeaderContainer.show(new RepositoryDetailsView({
            model: this.model,
            session: this.options.session
         }));

         var languages = this.model.get("_languages");

         if (!languages) {
            languages = this.model.getLanguageModel();
            var rateLimit = this.options.session.get("rateLimit");
            this.model.set("_languages", languages);
            rateLimit.observeRateLimitedObject(languages);

            if (!this.options.session.get("preloaded")) {
               languages.fetch({
                  error: function () {

                  }
               });
            }

         }

         this.repoDetailsLanguagesContainer.show(new RepositoryLanguagesListView({
            model: languages,
            repository: this.model,
            session: this.options.session
         }));
      }
   });

});
