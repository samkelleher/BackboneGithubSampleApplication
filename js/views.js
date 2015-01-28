var app = window.app || {};

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
    modelEvents: {
        "change":"sessionUpdates"
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
    statusTitle: "Loading...",
    templateHelpers: function() {
        var extras = {
            _statusTitle: this.statusTitle
        };

        return extras;
    }
});

app.RepositoryListViewItem = Marionette.ItemView.extend({
    template:"#template-repositoryListViewItem",
    attributes: {
        "class":"row"
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
    childView: app.RepositoryListViewItem
});