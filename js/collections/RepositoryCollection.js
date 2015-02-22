define([
    "backbone",
    "models/Repository",
    "common/utilities"
], function(Backbone, Repository, CommonUtilities) {
    'use strict';

    return Backbone.Collection.extend({
        url: function() {
            var username = this.options.gitHubUser.get("login");
            return "https://api.github.com/users/" + username + "/repos?type=all&per_page=" + this.options.perPage;
        },
        // Comma separated list of attributes
        sortColumn: "stargazers_count,watchers_count",

        // Comma separated list corresponding to column list
        sortDirection: 'desc,desc', // - [ 'asc'|'desc' ]
        comparator: function( a, b ) {

            if ( !this.sortColumn ) return 0;

            var cols = this.sortColumn.split( ',' ),
                dirs = this.sortDirection.split( ',' ),
                cmp;

            // First column that does not have equal values
            cmp = _.find( cols, function( c ) { return a.attributes[c] != b.attributes[c]; });

            // undefined means they're all equal, so we're done.
            if ( !cmp ) return 0;

            // Otherwise, use that column to determine the order
            // match the column sequence to the methods for ascending/descending
            // default to ascending when not defined.
            if ( ( dirs[_.indexOf( cols, cmp )] || 'asc' ).toLowerCase() == 'asc' ) {
                return a.attributes[cmp] > b.attributes[cmp] ? 1 : -1;
            } else {
                return a.attributes[cmp] < b.attributes[cmp] ? 1 : -1;
            }

        },
        initialize: function(models, options) {

            if (!options) {
                throw new Error("A RepositoryCollection requires an options object.");
            }

            this.options = options;

            if (!this.options.gitHubUser) {
                throw new Error("A RepositoryCollection requires an owner (a GitHubUser object) to be set in its options.");
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
            if (xhr) { this.trigger("rateLimitedXHRComplete", xhr); }
        },
        parseLinkHeader: function(header, currentPage) {

            // Example header:
            // <https://api.github.com/user/1/repos?type=all&page=3&per_page=100>; rel="next",
            // <https://api.github.com/user/1/repos?type=all&page=3&per_page=100>; rel="last",
            // <https://api.github.com/user/1/repos?type=all&page=1&per_page=100>; rel="first",
            // <https://api.github.com/user/1/repos?type=all&page=1&per_page=100>; rel="prev"


            if (!header || header.length === 0) {
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
                var queryString = CommonUtilities.ParseQueryString(lastLinkparts[1]);
                links.totalPages = queryString.page;
            } else {
                // If no last property is present, the current page is the last one.
                links.totalPages = currentPage;
            }

            return links;

        },
        processLinkResponse: function(xhr, currentPage) {
            if (!xhr) return {totalPages: currentPage};

            var requestLink = xhr.getResponseHeader('Link');

            return this.parseLinkHeader(requestLink, currentPage);

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
                collection.processRateLimits(response);
                if (error) error(model, response, options);
            };

            options.beforeSend = function(xhr) {
                xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
                if (beforeSend) beforeSend(xhr);
            };

            return Backbone.Collection.prototype.fetch.call(this, options);
        },
        isSynced: false,
        fetchAllPages: function() {

            var that = this;
            var paginationInfomation = null;
            var pagesFetched = 1;
            var totalItemsLoaded = 0;
            this.trigger("requestAllPages", this);

            var syncAllPages = function() {
                that.isSynced = true;
                that.trigger("syncAllPages", {
                    pagesFetched: pagesFetched,
                    totalItemsLoaded: totalItemsLoaded
                });
            };

            var requestError = function(collection, response, options, page) {
                that.trigger("requestAllPagesError", { totalItemsLoaded: totalItemsLoaded, response: response, page: page });
            };

            var updateProgress = function(fetchResults, fetchPage) {
                totalItemsLoaded += fetchResults.length;
                that.trigger("requestAllPagesProgress", { totalRepositoryCount: totalItemsLoaded, currentPage: fetchPage, totalPages: paginationInfomation.totalPages });
            };

            that.currentXhr = that.fetch({
                remove: false,
                data: {page: pagesFetched},
                success: function(collection, response, options) {
                    that.currentXhr = null;
                    paginationInfomation = that.processLinkResponse(options.xhr, pagesFetched);

                    updateProgress(response, pagesFetched);

                    if (paginationInfomation.totalPages > pagesFetched) {
                        // There are other repos to load
                        // Start paralel requests for each page, if any.

                        var subsequentPageLoads = [];

                        var queueNextFetch = function(nextPageNumber) {
                            var fetchLoader = new $.Deferred();
                            var subsequentPageXhr = that.fetch({
                                remove: false,
                                data: { page: nextPageNumber },
                                error: function(collection, response, options) {
                                    requestError(collection, response, options, nextPageNumber);
                                    fetchLoader.reject();
                                },
                                success: function(collection, response, options) {
                                    updateProgress(response, nextPageNumber);
                                    fetchLoader.resolve();
                                }
                            });
                            return fetchLoader.promise();
                        };

                        for (var subsequentPageNumber = 2; subsequentPageNumber <= paginationInfomation.totalPages; subsequentPageNumber++) {
                            subsequentPageLoads.push(queueNextFetch(subsequentPageNumber));
                        }

                        $.when.apply(null, subsequentPageLoads).done(function() {
                            // All pages have  been loaded.
                            syncAllPages();
                        }).fail(function() {
                            // At least one pagination call failed...

                        });

                    } else {
                        // This is the only page of repos.
                        syncAllPages();
                    }

                },
                error: function(collection, response, options) {
                    that.currentXhr = null;
                    requestError(collection, response, options, 1);
                }});

        },
        model: Repository,
        keepFirstTwenty: function() {
            if (this.length > 20) {
                this.remove(this.tail(20));
            }

        }
    });

});
