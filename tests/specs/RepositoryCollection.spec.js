'use strict';

define(['collections/RepositoryCollection'], function(RepositoryCollection) {

    describe('RepositoryCollection', function() {

        it("Will throw exception not constructed properly.", function() {

            expect( function(){
                var repositoryCollection = new RepositoryCollection();
            } ).toThrow(new Error("A RepositoryCollection requires an options object."));
        });

        it("Will throw exception if no owner is specified.", function() {

            expect( function(){
                var repositoryCollection = new RepositoryCollection([], { });
            } ).toThrow(new Error("A RepositoryCollection requires an owner (a GitHubUser object) to be set in its options."));
        });

        it("Will use the owners login to construct the endpoint url.", function() {
            var repositoryCollection = new RepositoryCollection([], {gitHubUser: {
                get: function() {
                    return "username";
                }
            }});
            expect( repositoryCollection.url() ).toBe("https://api.github.com/users/username/repos?type=all&per_page=100");
        });

        it("Calculates the number of pages required to get the complete list of repos.", function() {
            var repositoryCollection = new RepositoryCollection([], { gitHubUser: {} });

            var testLinkData = '<https://api.github.com/user/1/repos?type=all&page=3&per_page=100>; rel="next", <https://api.github.com/user/1/repos?type=all&page=3&per_page=100>; rel="last", <https://api.github.com/user/1/repos?type=all&page=1&per_page=100>; rel="first",           // <https://api.github.com/user/1/repos?type=all&page=1&per_page=100>; rel="prev"';

            var paginationDetails = repositoryCollection.parseLinkHeader(testLinkData, 1);
            expect(paginationDetails.totalPages).toBe(3);
        });

        it("Determines if one page is sufficient for all repos.", function() {
            var repositoryCollection = new RepositoryCollection([], { gitHubUser: {} });
            var paginationDetails = repositoryCollection.parseLinkHeader(null, 1);
            expect(paginationDetails.totalPages).toBe(1);
        });

        it("Understands rate limits.", function() {
            var testRepoLang = new RepositoryCollection([], { gitHubUser: {get: function() {return "example";}} });

            var spied = {
                fakefetch: function(options) {

                    if (options.complete) {
                        options.complete({}, "");
                    }

                    if (options.success) {
                        options.success(testRepoLang, {}, {xhr: {}});
                    }

                    if (options.error) {
                        options.error(testRepoLang, {}, {});
                    }

                    if (options.beforeSend) {
                        options.beforeSend({
                                setRequestHeader: function() { }
                            }
                        );
                    }

                }};

            spyOn(spied, "fakefetch").and.callThrough();
            spyOn(Backbone.Collection.prototype, "fetch").and.callFake(spied.fakefetch);

            testRepoLang.fetch({
                success:function() {

                },
                error:function() {

                },
                complete:function() {

                }
            });

            expect(spied.fakefetch).toHaveBeenCalled();
        });

        it("Understands pagination.", function() {
            var testRepoLang = new RepositoryCollection([], { gitHubUser: {get: function() {return "example";}} });

            var spied = {
                fakefetch: function(options) {

                    if (options.complete) {
                        options.complete({}, "");
                    }

                    if (options.success) {
                        options.success(testRepoLang, {}, {xhr: {
                            getResponseHeader: function() {
                                return "<https://api.github.com/user/1/repos?type=all&page=2&per_page=100>; rel=\"next\", <https://api.github.com/user/1/repos?type=all&page=2&per_page=100>; rel=\"last\"";
                            }
                        }});
                    }

                    if (options.error) {
                        options.error(testRepoLang, {}, {});
                    }

                    if (options.beforeSend) {
                        options.beforeSend({
                                setRequestHeader: function() { }
                            }
                        );
                    }

                }};

            spyOn(spied, "fakefetch").and.callThrough();
            spyOn(Backbone.Collection.prototype, "fetch").and.callFake(spied.fakefetch);

            testRepoLang.fetchAllPages({
                success:function() {

                },
                error:function() {

                },
                complete:function() {

                }
            });

            expect(spied.fakefetch).toHaveBeenCalled();
        });


    });

});