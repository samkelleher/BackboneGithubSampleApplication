var app = window.app || {};

app.ParseQueryString = function (str) {
    if (typeof str !== 'string') {
        return {};
    }

    str = str.trim().replace(/^(\?|#)/, '');

    if (!str) {
        return {};
    }

    return str.trim().split('&').reduce(function (ret, param) {
        var parts = param.replace(/\+/g, ' ').split('=');
        var key = parts[0];
        var val = parts[1];

        key = decodeURIComponent(key);
        // missing `=` should be `null`:
        // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
        val = val === undefined ? null : decodeURIComponent(val);

        if (key == "page") {
            if ($.isNumeric(val)) {
                val = val * 1;
            }
        }

        if (!ret.hasOwnProperty(key)) {
            ret[key] = val;
        } else if (Array.isArray(ret[key])) {
            ret[key].push(val);
        } else {
            ret[key] = [ret[key], val];
        }

        return ret;
    }, {});
};

app.CreateQueryString = function (obj) {
    return obj ? Object.keys(obj).map(function (key) {
        var val = obj[key];

        if (Array.isArray(val)) {
            return val.map(function (val2) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
            }).join('&');
        }

        return encodeURIComponent(key) + '=' + encodeURIComponent(val);
    }).join('&') : '';
};

app.GlobalController = Marionette.Controller.extend({
    initialize: function(options) {
        if (!this.options.application) {
            throw new Error("A controller needs a reference to the application that created it.");
        }
        this.application = this.options.application;

        if (!this.options.session) {
            throw new Error("A controller needs a reference to the session that it is running in.");
        }
        this.session = this.options.session;
    },
    index: function () {

        var that = this;
        this.application.router.navigate("index.html");
        var username = this.session.get("username");
        var collection =  this.session.get("repositories");
        var gitHubUser = this.session.get("gitHubUser");

        var listView = new app.RepositoryListCollectionView({collection: collection, model: this.session});

        this.listenToOnce(listView, "selectedItem", function(selectedItem) {
            that.viewRepositoryDetail(selectedItem);
        });

        this.application.rootLayout.content.show(listView);
        this.application.rootLayout.header.show(new app.HeaderView({model: this.session }));
        this.application.rootLayout.footer.show(new app.FooterView({model: this.session }));

        var preloaded = this.session.get("preloaded");

        if (!preloaded) {
            var userLoadXhr = gitHubUser.fetch({
                success: function() {
                    collection.fetchAllPages();
                },
                timeout: 10000,
                error: function(model, response, options) {

                    var error = null;

                    if (response.statusText == "timeout") {
                        // The server did not respond...
                        error = new app.Error({message:"The request to download profile of GitHub user '" + username + "' has timed out."});

                    } else {
                        if (response.status === 404) {
                            // The user account does not exist...

                            error = new app.Error({message:"The username '" + username + "' does not exist on GitHub."});


                        } else  if (response.status === 403) {
                            // Rate limit has been hit...

                            error = new app.Error({message:"You have hit the API rate limit set by GitHub. Please try again later."});


                        } else  if (response.status === 500) {
                            // API issues
                            error = new app.Error({message:"The GitHub API returned a server error. They might be down, try again?"});

                        }
                    }

                    if (!error) {
                        error = new app.Error({message:"Downloading profile '" + username + "' had an unexpected error."});
                    }
                    that.application.rootLayout.content.show(new app.ContentErrorView({model: error}));
                }
            });
        }

    },
    viewRepositoryDetail: function(repository) {
        this.application.router.navigate("repository/" + repository.id);
        this.application.rootLayout.content.show(new app.RepositoryDetailsView({model: repository, session: this.session}));
    },
    viewRepositoryDetailById: function(id) {

        var repository = this.session.get("repositories").get(id);

        if (!repository) {
            this.application.router.navigate("repository/" + id);
            this.application.rootLayout.content.show(new app.ContentErrorView({model: new app.Error({message:"A repository with id '" + id + "' was not found."})}));
            return;
        }

        this.viewRepositoryDetail(repository);

    },
    defaultAction: function (path) {
        console.log("UNKNOWN PATH:", path);
        //window.location = "/" + path;
    }
});

app.GlobalRouter = Marionette.AppRouter.extend({
    appRoutes: {
        "": "index",
        "index.html": "index",
        "repository/:id":"viewRepositoryDetailById",
        "*path": "defaultAction"
    }
});

Backbone.Marionette.TemplateCache.prototype.compileTemplate = function (rawTemplate) {
    // Add a model attribute for performance.
    return _.template(rawTemplate, { variable: "model" });
};

app.Application = Marionette.Application.extend({
    initialize: function (options) {

        if (!this.options) {
            throw new Error("An application needs a session object to be able to run.");
        }

        if (!this.options.model) {

            throw new Error("An application needs a session object to be able to run.");

            if (!this.options.model.isValid()) {
                throw new Error(this.options.model.validationError);
            }
        }

        if (this.options.singleInstance) {
            if (app.current && app.current.isStarted) {
                throw new Error("Another instance has already been started, cannot start another.");
            }
            app.currentSingleInstance = this;
        }

        this.router = new app.GlobalRouter({ controller: new app.GlobalController({application: this, session: this.model}) });

    },
    stop: function() {
        this.triggerMethod('before:stop');
        this.removeApplicationLayout();
        this.stopPushState();
        this.triggerMethod('stop');
    },
    removeApplicationLayout: function() {
        if (!this.isStarted || !this.rootRegion) return;

        this.rootRegion.reset();

        //this.rootLayout.destroy();
        //this.rootLayout = null;

        this.rootRegion = null;

        this.isStarted = false;
    },
    isStarted: false,
    setupApplicationLayout: function() {
        this.rootRegion = new Marionette.Region({
            el: this.options.model.get("baseContainer")
        });

        this.rootLayout = new app.ApplicationLayout();

        this.rootRegion.show( this.rootLayout );

    },
    historyStarted: false,
    setupPushState: function() {
        this.historyStarted = Backbone.history.start({ pushState: this.model.get("singleInstance"), root: "BackboneGithubSampleApplication/" });
    },
    stopPushState: function() {
        this.historyStarted = false;
        Backbone.history.stop();
    },
    onStart: function() {
        this.setupApplicationLayout();
        this.setupPushState();
        this.isStarted = true;
    }
});

app.StartNewApplication = function(baseContainerSelector, username, sessionToUse) {

    var sessionDefaults = {
        singleInstance: true
    };

    if (baseContainerSelector) {
        sessionDefaults.baseContainer = baseContainerSelector;
    }

    if (username) {
        sessionDefaults.username = username;
    }

    if (!sessionToUse) {
        sessionToUse = new app.ApplicationSession(sessionDefaults);
    }

    var application = new app.Application({ model: sessionToUse });

    application.start({});

    return application;
};

if (!window.isTesting) {
    // window.currentApp = app.StartNewApplication(null, "addyosmani");
}
window.currentApp = app.StartNewApplication(null, "addyosmani", app.GetSampleSession());