'use strict';

define(['models/GitHubUser'], function(GitHubUser) {

    describe('GitHubUser', function() {
        var gitHubUser;

        beforeEach(function() {
            gitHubUser = new GitHubUser();


        });

        it('Require a username to call the endpoint.', function() {
            expect(function() {
                gitHubUser.url();
            }).toThrow(new Error("Cannot get a users profile without their username."));

        });

        it("Construct the endpoints URL based on username.", function() {
            gitHubUser = new GitHubUser({login: "username"});
            expect(gitHubUser.url()).toBe("https://api.github.com/users/username");
        });

        it("Understands rate limits.", function() {
            gitHubUser = new GitHubUser({login: "sample"});

            var spied = {
                fakefetch: function(options) {

                    if (options.complete) {
                        options.complete({});
                    }

                    if (options.error) {
                        options.error(gitHubUser, {});
                    }

                }};

            spyOn(spied, "fakefetch").and.callThrough();
            spyOn(Backbone.Model.prototype, "fetch").and.callFake(spied.fakefetch);

            gitHubUser.fetch({
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