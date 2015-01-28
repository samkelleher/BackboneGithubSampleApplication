var app = window.app || {};

app.ApplicationLayout = Marionette.LayoutView.extend({
    regions: {
        content: "section.content",
        header: "header.header",
        footer: "section.footer"
    },
    template:"#template-appLayout",
    attributes: {
        "class":"profileAppWrapper"
    }
});

app.HeaderView = Marionette.ItemView.extend({
    template:"#template-headerView",
    attributes: {
        "class":"row"
    },
    initialize: function() {
        this.collection = this.model.get("repositories");

        if (!this.collection) {
            throw new Error("The header view requires access to the underlying collection to function.");
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
        console.log("session updated ", this.model.toJSON());
    },
    updateStatus: function() {
        var username = this.model.get("username");
        this.setStatusTitle(username);
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
        var username = this.model.get("username");
        this.setStatusTitle("Loading @" + username + ", " + progress.totalRepositoryCount + " loaded so far...");
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

        var gitHubUser = this.model.get("gitHubUser");

        if (gitHubUser) {
            extras._name = gitHubUser.get("name");
            extras._avatar_url = gitHubUser.get("avatar_url");
        }

        return extras;
    }
});

app.RepositoryListViewItem = Marionette.ItemView.extend({
    template:"#template-repositoryListViewItem",
    attributes: {
        "class":"row"
    },
    events: {
        "click h3":"selectDetailedView"
    },
    selectDetailedView: function(e) {
        e.preventDefault();
        this.trigger("selectedItem", this.model);
    }
});

app.FooterView = Marionette.ItemView.extend({
    template:"#template-listFooterView",
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
    template:"#template-contentErrorView",
    attributes: {
        "class":"row"
    }
});

app.RepositoryListViewItem = Marionette.ItemView.extend({
    template:"#template-repositoryListViewItem",
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
    template:"#template-repositoryDetailsView"
});