var app = window.app || {};

app.ApplicationSession = Backbone.Model.extend({

    defaults: {
        username:"samkelleher",
        repositories: null,
        gitHubUser: null,
        totalRepositories: null,
        requestLimit: null,
        requestLimitRemaining:null,
        requestLimitExpires: null, // < Intented to be a DateTime/moment
        requestLimitReset: null, // < Intented to be the unix EPOCH.
        lastRefreshed: null,
        baseContainer:"#appContainer",
        totalRepositoryCount: null
    },
    validate: function(attributes, options) {
        if (!attributes) {
            return "The session has no properties.";
        }

        if (!attributes.username) {
            return "The application requires a username of a GitHub user to function.";
        }

        if (!attributes.baseContainer) {
            return "The application requires a selector for a DOM element in which it should render."
        }

    },
    initialize: function(attributes, options) {
        var gitHubUser = new app.GitHubUser({login: this.get("username")});
        this.set("gitHubUser", gitHubUser);

        var repositories = new app.RepositoryCollection([], {username: this.get("username"), owner: this});
        this.set("repositories", repositories);

        this.listenTo(gitHubUser, "rateLimitUpdated", this.updateRequestLimits);
        this.listenTo(repositories, "rateLimitUpdated", this.updateRequestLimits);

    },
    updateRequestLimits: function(fetchResult) {
        this.trigger("rateLimitUpdated", fetchResult);
        this.set(fetchResult);
    }
});

app.RepositoryLanguageDetails = Backbone.Model.extend({
    url: function() {

        if (!this.id) {
            throw new Error("A repository id is required before its languages can be loaded.");
        }

        var owner= this.get("owner");

        if (!owner) {
            throw new Error("A repository owner username is required before its languages can be loaded.");
        }

        return "https://api.github.com/repos/" + owner + "/" + this.id + "/languages";
    },
    parseLanguageObject: function(response) {

        if (!response) return [];

        var totalBytes = 0;
        var languageData = _.map(response, function(byteLength, languageName) {
            totalBytes += byteLength;
            return {"languageName":languageName, "byteLength":byteLength};
        });

        if (!languageData.length) {
            return [];
        }


        var strip = function(number) {
            return (parseFloat(number.toPrecision(12)));
        };

        languageData = _.each(languageData, function(language) {
            language.percentageFloat = (language.byteLength / totalBytes) * 100;
            language.percentage = ((Math.round(10*language.percentageFloat)/10).toFixed(1).toString()) * 1;

        });

        var getRemainder = function(languages) {

            var off = 100 - _.reduce(languages, function(acc, language) {
                    return acc + language.percentage;
                }, 0);

            off = (Math.round(10*off)/10).toFixed(1).toString() * 1;

            return off;

        };

        var remainder = getRemainder(languageData);

        languageData[0].percentage += remainder; // Could probably allocate the remainder a little more accuratly.

        return languageData;
    },
    setLanguageObject: function(model) {
        var languageData = this.parseLanguageObject(model);
        this.set("languageData", languageData);
        return this;
    },
    defaults: {
        languageData:null,
        owner: null
    },
    parse: function(response) {
        if (!response) return {};

        response.languageData = this.parseLanguageObject(response);
        response.id = this.id;
        response.owner = this.get("owner");

        return response;
    },
    withUrl: function(url) {
        this.url = url;
        delete this.parse;
        return this;
    }
});

app.Repository = Backbone.Model.extend({
    getLanguageModel: function() {
        return new app.RepositoryLanguageDetails().withUrl(this.get("languages_url"));
    },
    defaults: {
        stargazers_count:0,
        watchers_count:0
    }
});

app.Error = Backbone.Model.extend({
    defaults: {
        message:"Sorry, an error has occoured..."
    }
});

app.GitHubUser = Backbone.Model.extend({
    defaults: {
        name:"",
        login:"" // < This is the username, but for this endpoint only, it's called login instead.
    },
    url: function() {
        var login = this.get("login");

        if (!login) {
            throw new Error("Cannot get a users profile without their username.");
        }

        return "https://api.github.com/users/" + login;
    },
    processRateLimits: function(xhr) {
        // TODO: Merge these into a common function for models and collections.
        if (!xhr) return;

        var requestLimit = xhr.getResponseHeader('X-RateLimit-Limit');
        var requestLimitRemaining = xhr.getResponseHeader('X-RateLimit-Remaining');
        var requestLimitReset = xhr.getResponseHeader('X-RateLimit-Reset');

        if (requestLimit !== null) {
            requestLimit  = requestLimit * 1;
        }

        if (requestLimitRemaining !== null) {
            requestLimitRemaining  = requestLimitRemaining * 1;
        }

        if (requestLimitReset !== null) {
            requestLimitReset  = requestLimitReset * 1;
        }

        if (requestLimit !== null || requestLimitRemaining !== null || requestLimitReset !== null) {
            var fetchResult = {
                requestLimit: requestLimit,
                requestLimitRemaining:requestLimitRemaining,
                requestLimitReset: requestLimitReset,
                requestLimitExpires: moment.unix(requestLimitReset)
            };

            this.trigger("rateLimitUpdated", fetchResult);
        }
    },
    fetch: function(options) {
        options = options ? _.clone(options) : {};

        var complete = options.complete;
        var error = options.error;
        var model = this;

        options.complete = function(jqXHR, textStatus) {
            model.processRateLimits(jqXHR);
            if (complete) complete(jqXHR, textStatus);
        };

        options.error = function(model, response, options) {
            model.processRateLimits(response);
            if (error) error(model, response, options);
        };

        return Backbone.Model.prototype.fetch.call(this, options);
    }
});

app.RepositoryCollection = Backbone.Collection.extend({
    url: function() {
        if (!this.options || !this.options.username) {
            throw new Error("A username is required to fetch a RepositoryCollection.");
        }

        return "https://api.github.com/users/" + this.options.username + "/repos?type=all&per_page=" + this.options.perPage;
    },
    initialize: function(models, options) {

        if (!options) {
            throw new Error("A RepositoryCollection requires an options object.");
        }

        this.options = options;

        if (!this.options.owner) {
            throw new Error("A RepositoryCollection requires an owner to be set in its options.");
        }

        if (!this.options.perPage) {
            this.options.perPage = 100;
        }
        if (!this.options.page) {
            this.options.page = 1;
        }
    },
    currentXhr: null,
    processRateLimits: function(xhr) {
        if (!xhr) return;

        var requestLimit = xhr.getResponseHeader('X-RateLimit-Limit');
        var requestLimitRemaining = xhr.getResponseHeader('X-RateLimit-Remaining');
        var requestLimitReset = xhr.getResponseHeader('X-RateLimit-Reset');

        if (requestLimit !== null) {
            requestLimit  = requestLimit * 1;
        }

        if (requestLimitRemaining !== null) {
            requestLimitRemaining  = requestLimitRemaining * 1;
        }

        if (requestLimitReset !== null) {
            requestLimitReset  = requestLimitReset * 1;
        }

        if (requestLimit !== null || requestLimitRemaining !== null || requestLimitReset !== null) {
            var fetchResult = {
                requestLimit: requestLimit,
                requestLimitRemaining:requestLimitRemaining,
                requestLimitReset: requestLimitReset,
                requestLimitExpires: moment.unix(requestLimitReset)
            };

            this.trigger("rateLimitUpdated", fetchResult);
        }
    },
    parseLinkHeader: function(header, currentPage) {

        // Example header:
        // <https://api.github.com/user/1/repos?type=all&page=3&per_page=100>; rel="next",
        // <https://api.github.com/user/1/repos?type=all&page=3&per_page=100>; rel="last",
        // <https://api.github.com/user/1/repos?type=all&page=1&per_page=100>; rel="first",
        // <https://api.github.com/user/1/repos?type=all&page=1&per_page=100>; rel="prev"


        if (!header || header.length == 0) {
           return {totalPages: currentPage};
        }

        // Split parts by comma
        var parts = header.split(',');
        var links = {};
        // Parse each part into a named link
        _.each(parts, function(p) {
            var section = p.split(';');
            if (section.length != 2) {
                throw new Error("section could not be split on ';'");
            }
            var url = section[0].replace(/<(.*)>/, '$1').trim();
            var name = section[1].replace(/rel="(.*)"/, '$1').trim();
            links[name] = url;
        });

        if (links.last) {
            var lastLinkparts = links.last.split("?");
            var queryString = app.ParseQueryString(lastLinkparts[1]);
            links.totalPages = queryString.page;
        } else {
            // If no last property is present, the current page is the last one.
            links.totalPages = currentPage;
        }

        return links;

    },
    processLinkResponse: function(xhr) {
        if (!xhr) return;

        var requestLink = xhr.getResponseHeader('Link');

        return this.parseLinkHeader(requestLink);

    },
    fetch: function(options) {
        options = options ? _.clone(options) : {};

        var complete = options.complete;
        var error = options.error;
        var beforeSend = options.beforeSend;
        var collection = this;

        options.complete = function(jqXHR, textStatus) {
            collection.processRateLimits(jqXHR);
            if (complete) complete(jqXHR, textStatus);
        };

        options.error = function(model, response, options) {
            console.log("onError", arguments);
            collection.processRateLimits(response);
            if (error) error(model, response, options);
        };

        options.beforeSend = function(xhr) {
            xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
            if (beforeSend) beforeSend(xhr);
        };

        return Backbone.Collection.prototype.fetch.call(this, options);
    },
    fetchAllPages: function() {

        var that = this;
        var pagesFetched = 1;
        var totalItemsLoaded = 0;
        var hasMorePages = true;
        this.trigger("requestAllPages", this);

        var syncAllPages = function() {
            this.trigger("syncAllPages", this, {
                pagesFetched: pagesFetched,
                totalItemsLoaded: totalItemsLoaded
            });
        };

        var performFetch = function(doNextFetch) {
            that.currentXhr = that.fetch({
                remove: false,
                data: {page: currentPage},
                success: function(collection, response, options) {
                    that.currentXhr = null;

                    var itemsLoaded = response.length;
                    totalItemsLoaded += itemsLoaded;

                    var paginationInfomation = that.processLinkResponse(response, pagesFetched);

                    that.trigger("requestAllPagesProgress", this, { totalRepositoryCount: totalItemsLoaded, currentPage: 1, totalPages: paginationInfomation.totalPages });

                    if (paginationInfomation.totalPages > 1) {

                    } else {
                        syncAllPages();
                    }

                    // Start paralel requests for each page, if any.
                    for (var subsequentPageNumber = 2; subsequentPageNumber <= paginationInfomation.totalPages; subsequentPageNumber++) {

                        var subsequentPageXhr = that.fetch({
                            remove: false,
                            data: {page: subsequentPageNumber}
                        });

                    }

                    if (itemsLoaded == that.options.perPage) {
                        // Load the next page
                        currentPage += 1;

                        doNextFetch(doNextFetch);
                    } else {
                        // There are no items left.
                        hasMorePages=false;
                        that.trigger("syncAllPages", this, {
                            pagesFetched: currentPage,
                            totalItemsLoaded: totalItemsLoaded
                        });
                    }

                },
                error: function(collection, response, options) {
                    that.currentXhr = null;
                    that.trigger("requestAllPagesError", this, { totalRepositoryCount: totalItemsLoaded, response: response });
                }});

        };

        performFetch(performFetch);

    },
    model: app.Repository
});