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

app.ApplicationLayout = Marionette.LayoutView.extend({
    regions: {
        content: "section.content",
        header: "header.header",
        footer: "section.footer"
    },
    template:"#template-appLayout",
    attributes: {
        "class":"container"
    }
});


app.GlobalController = Marionette.Controller.extend({
    index: function () {
        console.log("render home screen");
    },
    defaultAction: function (path) {
        console.log("UNKNOWN PATH:", path);
        //window.location = "/" + path;
    }
});

app.GlobalRouter = Marionette.AppRouter.extend({
    appRoutes: {
        "": "index",
        "*path": "defaultAction"
    }
});

Backbone.Marionette.TemplateCache.prototype.compileTemplate = function (rawTemplate) {
    // Add a model attribute for performance.
    return _.template(rawTemplate, { variable: "model" });
};


app.Application = Marionette.Application.extend({
    initialize: function (options) {

        if (!this.options || !this.options.model) {

            throw new Error("An application needs a session object to be able to run.");

            if (!this.options.model.isValid()) {
                throw new Error(this.options.model.validationError);
            }
        }

        this.globalRouter = new app.GlobalRouter({ controller: new app.GlobalController() });

    },
    setupApplicationLayout: function() {
        this.rootRegion = new Marionette.Region({
            el: this.options.model.get("baseContainer")
        });

        this.rootLayout = new app.ApplicationLayout();

        this.rootRegion.show( this.rootLayout );

        // TODO: Move this to the controller...
        var that = this;

        var username = this.options.model.get("username");
        var collection =  this.options.model.get("repositories");
        var gitHubUser = this.options.model.get("gitHubUser");

        this.rootLayout.content.show(new app.RepositoryListCollectionView({collection: collection, model: this.options.model}));
        this.rootLayout.header.show(new app.HeaderView({model: this.options.model}));
        this.rootLayout.footer.show(new app.FooterView({model: this.options.model}));

        var userLoadXhr = gitHubUser.fetch({
            success: function() {
                collection.fetchAllPages();
            },
            timeout: 10000,
            error: function(model, response, options) {
                console.log(arguments);
                console.log(response);

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
                that.rootLayout.content.show(new app.ContentErrorView({model: error}));
            }
        });


    },
    onStart: function() {
        this.setupApplicationLayout();

    }
});

app.StartNewApplication = function(baseContainerSelector, username) {

    var sessionDefaults = {

    };


    if (baseContainerSelector) {
        sessionDefaults.baseContainer = baseContainerSelector;
    }

    if (username) {
        sessionDefaults.username = username;
    }

    var application = new app.Application({model: new app.ApplicationSession(sessionDefaults)});

    application.start({});

    return application;
};