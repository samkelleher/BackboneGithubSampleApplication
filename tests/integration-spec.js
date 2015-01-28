describe("Connects directly to the GitHub API.", function() {

    var originalTimeout;
    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        // Either me or GitHub, but sometimes longer than the default 5 seconds.
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
    });

    it("Will download the list of repositories for a user from github API.", function(done) {
        var repos = new app.RepositoryCollection([], {username: "samkelleher"});

        var fetchCompleteFunctions = {
            success: function() {

            },
            error: function() {

            }
        };

        spyOn(fetchCompleteFunctions, "success");
        spyOn(fetchCompleteFunctions, "error");

        var completeFetch = function() {
            expect(fetchCompleteFunctions.success).toHaveBeenCalled();
            expect(fetchCompleteFunctions.error).not.toHaveBeenCalled();
            done();
        };

        repos.fetch({
            success: function() {
                fetchCompleteFunctions.success();
                completeFetch();
            },
            error: function() {
                fetchCompleteFunctions.error();
                completeFetch();
            }
        });

    });

    it("Will handle a username that does not exist.", function(done) {
        var dummyUsername = moment().format("x");
        var repos = new app.RepositoryCollection([], {username: dummyUsername});

        var fetchCompleteFunctions = {
            success: function() {

            },
            error: function() {

            }
        };

        spyOn(fetchCompleteFunctions, "success");
        spyOn(fetchCompleteFunctions, "error");

        var completeFetch = function() {
            expect(fetchCompleteFunctions.success).not.toHaveBeenCalled();
            expect(fetchCompleteFunctions.error).toHaveBeenCalled();
            done();
        };

        repos.fetch({
            success: function() {
                fetchCompleteFunctions.success();
                completeFetch();
            },
            error: function() {
                fetchCompleteFunctions.error();
                completeFetch();
            }
        });

    });

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

});