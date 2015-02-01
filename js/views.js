var app = window.app || {};

app.ApplicationLayout = Marionette.LayoutView.extend({
    regions: {
        content: "section.content",
        header: "header.header",
        footer: "section.footer"
    },
    template: app.templates.AppLayout,
    attributes: {
        "class":"profileAppWrapper"
    }
});

app.HeaderView = Marionette.ItemView.extend({
    template: app.templates.HeaderView,
    attributes: {
        "class":"row"
    },
    initialize: function() {
        if (this.model) {
            this.collection = this.model.get("repositories");

            if (!this.collection) {
                throw new Error("The header view requires access to the underlying collection to function if there is a model set.");
            }
        }

    },
    userProfileUpdated: function() {

    },
    modelEvents: {
        "change":"sessionUpdates",
        "change:gitHubUser":"userProfileUpdated"
    },
    collectionEvents: {
        "requestAllPages":"setLoadingState",
        "requestAllPagesProgress":"setLoadingStateWithProgress",
        "syncAllPages":"updateStatus"
    },
    ui: {
        "title":"h2"
    },
    sessionUpdates: function() {
        //console.log("session updated ", this.model.toJSON());
    },
    updateStatus: function() {
        this.setStatusTitle("");
    },
    setLoadingState: function() {

        var username = this.model.get("username");

        if (username) {
            this.setStatusTitle("Loading @" + username + "...");
        } else {
            this.setStatusTitle("Loading...");
        }

    },
    setLoadingStateWithProgress: function(progress) {
        this.setStatusTitle("Loading (" + progress.totalRepositoryCount + " loaded so far)...");
    },
    setStatusTitle: function(newTitle) {
        this.statusTitle = newTitle;
        this.render();
    },
    statusTitle: "",
    templateHelpers: function() {
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

app.RepositoryListViewItem = Marionette.ItemView.extend({
    template: app.templates.RepositoryListViewItem,
    attributes: {
        "class":"row"
    },
    events: {
        "click":"selectDetailedView"
    },
    selectDetailedView: function(e) {
        e.preventDefault();
        this.trigger("selectedItem", this.model);
    }
});

app.FooterView = Marionette.ItemView.extend({
    template: app.templates.ListFooterView,
    attributes: {
        "class":"row"
    },
    templateHelpers: function() {
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
    updatedRateLimit: function() {
        this.render();
    },
    initialize: function() {
        this.rateLimit = this.model.get("rateLimit");
        this.listenTo(this.rateLimit, "rateLimitUpdated", this.updatedRateLimit);
    }
});

app.ContentErrorView = Marionette.ItemView.extend({
    template: app.templates.ContentErrorView,
    attributes: {
        "class":"row"
    }
});

app.RepositoryListCollectionView = Marionette.CollectionView.extend({
    childView: app.RepositoryListViewItem,
    childEvents: {
        selectedItem: function (view, selectedItem) {
            this.trigger("selectedItem", selectedItem);
        }
    },
    attributes: {
        "class":"repoListCollectionContainer"
    },
    initialize: function() {

        if (this.collection.isSynced) {
            this.trimPagesAfterFullSync();
        }

    },
    trimPagesAfterFullSync: function() {
        this.collection.keepFirstTwenty();
    },
    collectionEvents: {
        "syncAllPages":"trimPagesAfterFullSync"
    }
});

app.RepositoryDetailsView =  Marionette.ItemView.extend({
    template: app.templates.RepositoryDetailsView,
        attributes: {
            "class":"repoDetailsContainer"
        },
    templateHelpers: function() {

        var extras = {};

        var updated_at = this.model.get("updated_at");

        if(updated_at) {
            extras._lastUpdated = "Last updated " + moment.utc(updated_at).fromNow();
        } else {
            extras._lastUpdated = "Last update information not available. ";
        }



        return extras;
    }
});

app.RepositoryLanguagesListView =  Marionette.ItemView.extend({
    attributes: {
        "class":"repoLanguagesContainer"
    },
    template: app.templates.RepositoryLanguagesListView,
    templateHelpers: function() {

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
        "change":"render",
        "sync":"render",
        "error":"render"
    }
});

app.RepositoryDetailsLayout =  Marionette.LayoutView.extend({
    template: app.templates.RepositoryDetailsLayout,
    attributes: {
        "class":"repositoryDetailsLayoutContainer"
    },
    regions: {
        repoDetailsSummaryHeaderContainer: ".repoDetailsSummaryHeaderContainer",
        repoDetailsLanguagesContainer: ".repoDetailsLanguagesContainer"
    },
    events: {
        "click .cmdGoHome":"cmdGoHome"
    },
    cmdGoHome: function(e) {
        e.preventDefault();
        this.trigger("goHome");
    },
    onShow: function() {
        this.repoDetailsSummaryHeaderContainer.show(new app.RepositoryDetailsView({model: this.model, session: this.options.session}));

        var languages = this.model.get("_languages");

        if (!languages) {
            languages = this.model.getLanguageModel();
            var rateLimit = this.options.session.get("rateLimit");
            this.model.set("_languages", languages);
            rateLimit.observeRateLimitedObject(languages);

            if (!this.options.session.get("preloaded")) {
                languages.fetch({
                    error: function() {

                    }
                });
            }

        }

        this.repoDetailsLanguagesContainer.show(new app.RepositoryLanguagesListView({model: languages, repository: this.model, session: this.options.session}));
    }
});

app.UsageInstructionsView =  Marionette.ItemView.extend({
    template: app.templates.UsageInstructionsView,
    events: {
        "click .cmdViewUser":"cmdViewUser",
        "click .cmdSearch":"cmdSearch",
        "keydown .txtSearchUsername":"cmdSearchOnEnter"
    },
    ui: {
        "txtSearchUsername":".txtSearchUsername"
    },
    cmdSearchOnEnter: function(e) {
        if(e.which == 13) {
            this.cmdSearch();
        }
    },
    isValidGitHubUsername: function(username) {
        return /^\w[\w-]+$/.test(username);
    },
    cmdSearch: function() {
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
    cmdViewUser: function(e) {
        e.preventDefault();

        var username = $(e.currentTarget).attr("href").split("/")[1];

        this.trigger("viewProfile", username);
    }
});