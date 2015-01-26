describe("Browse GitHub repos.", function() {
    it("Will download the list of repositories for a user from github.", function() {

        var repos = new app.RepositoryCollection();

        repos.fetch();

    });
});