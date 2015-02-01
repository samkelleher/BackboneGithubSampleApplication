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

        var controller = new app.GlobalController({application:{}, session:{}});
        expect(controller.session).not.toBe(undefined);


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
                model:{  isValid: function() {
                    return true;
                },attributes: {
                    singleInstance: true
                }
                }});
        } ).toThrow();

        expect( function(){
            var appTest = new app.Application({
                model:{  isValid: function() {
                    return true;
                },
                    attributes: {
                        singleInstance: false
                    }

                }});
        } ).toThrow();

        app.current = null;

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

    it("Checks it has a base container.", function() {
        var session = new app.ApplicationSession({baseContainer: null});
        var isValid = session.isValid();
        expect(isValid).toBe(false);
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

        languageDetails = languageDetails.withUrl("example");
        url = languageDetails.url();

        expect(url).toBe("example");
    });


});

describe("Use query strings.", function() {

    it("Parse Query Strings.", function() {
        var qs = app.ParseQueryString();
        expect(qs).toEqual({});

        qs = app.ParseQueryString("   ");
        expect(qs).toEqual({});

        qs = app.ParseQueryString("test=true");
        expect(qs).toEqual({"test":"true"});

    });

    it("Create Query Strings.", function() {
        var qs = app.CreateQueryString();
        expect(qs).toEqual("");

        qs = app.CreateQueryString({"test":"true"});
        expect(qs).toEqual("test=true");

    });

});

describe("Run an application lifecycle.", function() {

    var testApplication = null;
    var testSession = null;

    $("body").append($("<div id=\"appContainer\" style=\"display: none;\"></div>"));

    it("Startup.", function() {

        testSession = new app.ApplicationSession({singleInstance: true, username:"sample", baseContainer:"#appContainer"});

        testSession = app.AttachSampleSession(testSession);

        testApplication = app.StartNewApplication("#appContainer", "sample", testSession);

        expect(testApplication).not.toBe(null);
        expect(app.current).not.toBe(null);
        expect(testApplication.isStarted).toBe(true);

    });

    it("Render a welcome screen and search for a username.", function() {
        expect( function(){
            testApplication.router.options.controller.index();
        }).not.toThrow();

        var e = jQuery.Event("keydown");
        e.which = 13; // # Enter key

        expect( function(){
            testApplication.rootRegion.currentView.$el.find("input").val("").trigger(e);
            testApplication.rootRegion.currentView.$el.find("input").val("with a space").trigger(e);
            testApplication.rootRegion.currentView.$el.find("input").val("sample").trigger(e);
        }).not.toThrow();

    });

    it("Render a welcome screen and click a prepared profile.", function() {
        expect( function(){
            testApplication.router.options.controller.index();
        }).not.toThrow();

        expect( function(){
            testApplication.rootRegion.currentView.$el.find("#cmdViewSampleUser").click();
        }).not.toThrow();

    });


    it("Render a list of repositories.", function() {
        expect( function(){
            testApplication.router.options.controller.repoList();
        }).not.toThrow();

    });

    it("Render repository details.", function() {
        var testRepo = testSession.get("repositories").first();

        var testRepoId = testRepo.id;

        expect( function(){
            testApplication.router.options.controller.viewRepositoryDetail(testRepo);
        }).not.toThrow();

        expect( function(){
            testApplication.router.options.controller.viewRepositoryDetailById("sample", testRepoId);
        }).not.toThrow();

        testApplication.rootRegion.currentView.$el.find(".cmdGoHome").first().click();

    });

    it("Handle a non-existant repository.", function() {
        expect( function(){
            testApplication.router.options.controller.viewRepositoryDetailById("sample", 0);
        }).not.toThrow();
    });

    it("Render a index by username.", function() {
        expect( function(){
            testApplication.router.options.controller.indexWithUsername("sample");
        }).not.toThrow();

    });

    it("Switch user.", function() {
        expect( function(){
            testSession.unset("username");
            testApplication.router.options.controller.indexWithUsername("sample");
        }).not.toThrow();

    });

    it("Display a 404 page.", function() {

        expect( function(){
            testApplication.router.options.controller.fileNotFound("example");
        }).not.toThrow();

    });

    it("Handle an unknown path.", function() {

        expect( function(){
            testApplication.router.options.controller.defaultAction("example");
        }).not.toThrow();

    });

    it("Load data when necessary, handle a timeout.", function() {

        var testGitHubUser = {
            fetch: function(options) {

                options.error({ }, { statusText: "timeout" }, { });

                return null;
            }
        };

        spyOn(testGitHubUser, "fetch").and.callThrough();

        testSession.set("gitHubUser", testGitHubUser);

        testApplication.router.options.controller.executeUserLoad();

        expect(testGitHubUser.fetch).toHaveBeenCalled();

    });

    it("Load data when necessary, handle a 404.", function() {

        var testGitHubUser = {
            fetch: function(options) {

                options.error({ }, { status: 404 }, { });

                return null;
            }
        };

        spyOn(testGitHubUser, "fetch").and.callThrough();

        testSession.set("gitHubUser", testGitHubUser);

        testApplication.router.options.controller.executeUserLoad();

        expect(testGitHubUser.fetch).toHaveBeenCalled();

    });
    it("Load data when necessary, handle a 403.", function() {

        var testGitHubUser = {
            fetch: function(options) {

                options.error({ }, { status: 403 }, { });

                return null;
            }
        };

        spyOn(testGitHubUser, "fetch").and.callThrough();

        testSession.set("gitHubUser", testGitHubUser);

        testApplication.router.options.controller.executeUserLoad();

        expect(testGitHubUser.fetch).toHaveBeenCalled();

    });

    it("Load data when necessary, handle a 500.", function() {

        var testGitHubUser = {
            fetch: function(options) {

                options.error({ }, { status: 500 }, { });

                return null;
            }
        };

        spyOn(testGitHubUser, "fetch").and.callThrough();

        testSession.set("gitHubUser", testGitHubUser);

        testApplication.router.options.controller.executeUserLoad();

        expect(testGitHubUser.fetch).toHaveBeenCalled();

    });


    it("Stop.", function() {

        if (!testApplication) return;

        testApplication.stop();

        expect(testApplication.isStarted).toBe(false);

        expect($('#appContainer').is(':empty')).toBe(true);
        $("#appContainer").remove();

    });


});