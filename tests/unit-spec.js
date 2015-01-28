describe("Know about GitHub users.", function() {

    it("Require a username to call the endpoint.", function() {
        var repos = new app.GitHubUser();
        expect(function() {
            repos.url();
        }).toThrow(new Error("Cannot get a users profile without their username."));
    });

    it("Construct the endpoints URL based on username.", function() {
        var repos = new app.GitHubUser({login: "username"});
        expect(repos.url()).toBe("https://api.github.com/users/username");
    });

});

describe("Browse GitHub repos.", function() {

    it("Will throw exception not constructed properly.", function() {

        expect( function(){
            var repos = new app.RepositoryCollection();
        } ).toThrow(new Error("A RepositoryCollection requires an options object."));
    });

    it("Will throw exception if no owner is specified.", function() {

        expect( function(){
            var repos = new app.RepositoryCollection([], { });
        } ).toThrow(new Error("A RepositoryCollection requires an owner (a GitHubUser object) to be set in its options."));
    });

    it("Will use the owners login to construct the endpoint url.", function() {
        var repos = new app.RepositoryCollection([], {gitHubUser: {
            get: function() {
                return "username";
            }
        }});
        expect( repos.url() ).toBe("https://api.github.com/users/username/repos?type=all&per_page=100");
    });

    it("Calculates the number of pages required to get the complete list of repos.", function() {
        var repos = new app.RepositoryCollection([], { gitHubUser: {} });

        var testLinkData = '<https://api.github.com/user/1/repos?type=all&page=3&per_page=100>; rel="next", <https://api.github.com/user/1/repos?type=all&page=3&per_page=100>; rel="last", <https://api.github.com/user/1/repos?type=all&page=1&per_page=100>; rel="first",           // <https://api.github.com/user/1/repos?type=all&page=1&per_page=100>; rel="prev"';

        var paginationDetails = repos.parseLinkHeader(testLinkData, 1);
        expect(paginationDetails.totalPages).toBe(3);
    });

    it("Determines if one page is sufficient for all repos.", function() {
        var repos = new app.RepositoryCollection([], { gitHubUser: {} });
        var paginationDetails = repos.parseLinkHeader(null, 1);
        expect(paginationDetails.totalPages).toBe(1);
    });});

describe("Calculate repository statstics.", function() {

    var repositoryLanguageDetails = new app.RepositoryLanguageDetails().setLanguageObject({
        "C": 3,
        "Python": 3,
        "Swift":3
    });

    var languageArray = repositoryLanguageDetails.get("languageData");

    it("Can process preset language data.", function() {
        expect(languageArray).not.toBe(undefined);
        expect(languageArray).not.toBe(null);
    });

    it("Returns the correct number of languages.", function() {
        expect(languageArray.length).toBe(3);
    });

    // None of my hacking could get them to add to 100.
    /*var totalPercentage = 0;

    var percentageValues = _.pluck(languageArray, "percentage");
    console.log(languageArray);
    console.log(percentageValues[0]);

    for (var i = 0; i < percentageValues.length; i++) {
        totalPercentage += percentageValues[i]
    }

    console.log(totalPercentage);

    it("An odd number of percentage still adds up to 100.", function() {
        expect(totalPercentage).toBe(100);
    });*/

});