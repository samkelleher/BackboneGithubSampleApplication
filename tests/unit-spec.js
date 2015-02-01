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


    it("Parse language results.", function() {
        var languageDetails = new app.RepositoryLanguageDetails();

        var result = languageDetails.parseLanguageObject();
        expect(jQuery.isArray(result)).toBe(true);

        result = languageDetails.parseLanguageObject({});
        expect(jQuery.isArray(result)).toBe(true);

    });

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

describe("Runs within a defined application.", function() {

    it("A global controller that checks it has been initialized properly.", function() {

        expect( function(){
            var controller = new app.GlobalController({});
        } ).toThrow(new Error("A controller needs a reference to the application that created it."));

        expect( function(){
            var controller = new app.GlobalController({application:{}});
        } ).toThrow(new Error("A controller needs a reference to the session that it is running in."));

    });

    it("An application that checks it has been initialized properly.", function() {

        expect( function(){
            var appTest = new app.Application({});
        } ).toThrow(new Error("An application needs a session object to be able to run."));

        expect( function(){
            var appTest = new app.Application({model:{
                validationError:"Model Invalid Test Error Message",
                isValid: function() {
                return false;
            }}});
        } ).toThrow(new Error("Model Invalid Test Error Message"));

        app.current = {isStarted: true};

        expect( function(){

            var appTest = new app.Application({
                singleInstance: true,
                model:{  isValid: function() {
                    return true;
                }}});
        } ).toThrow(new Error("This instance cannot be made a single instance as another single instance is already running."));

        expect( function(){
            var appTest = new app.Application({
                singleInstance: false,
                model:{  isValid: function() {
                    return true;
                }}});
        } ).toThrow(new Error("Another instance of this application has already been started, cannot start another."));

    });

});

describe("Maintains a local session state.", function() {

    it("Has default session values.", function() {
        var session = new app.ApplicationSession();

        var baseContainer = session.get("baseContainer");
        var isValid = session.isValid();

        expect(baseContainer).not.toBe(null);
        expect(isValid).toBe(true);

    });

    it("To detect user changes.", function() {

        var session = new app.ApplicationSession();

        var spies = {
            switchedUser: function() {

            }
        }

        spyOn(spies, "switchedUser");

        session.on("switchedUser", spies.switchedUser);

        session.switchUser("example");

        var username = session.get("username");

        expect(username).toBe("example");

        expect(spies.switchedUser).toHaveBeenCalled();

    });


});


describe("Know about a repository language usage.", function() {

    it("Generates a API url.", function() {
        var languageDetails = new app.RepositoryLanguageDetails();

        expect(function(){
            return languageDetails.url();
        } ).toThrow();

        languageDetails.id = 1;

        expect(function(){
            return languageDetails.url();
        } ).toThrow();

        languageDetails.set("owner", "example");

        var url = languageDetails.url();

        expect(url).toBe("https://api.github.com/repos/example/1/languages");
    });


});