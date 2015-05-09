'use strict';

define(['models/ApplicationSession', 'Application', 'common/FillWithSampleData'],
    function(ApplicationSession, Application, FillWithSampleData) {

    describe('Run a complete Lifecycle.', function() {

        var testApplication = null;
        var testSession = null;

        $("body").append($("<div id=\"appContainer\" style=\"display: none;\"></div>"));

        it("Startup.", function() {

            testSession = new ApplicationSession({singleInstance: true, username:"sample", baseContainer:"#appContainer"});

            testSession = FillWithSampleData(testSession);

            testApplication = Application.CreateNewInstance("#appContainer", "sample", testSession);

            expect(testApplication).not.toBe(null);
            expect(Application.currentSingleInstance).not.toBe(null);
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
                var repos = testSession.get("repositories");
                testApplication.router.options.controller.repoList();
                repos.trigger("requestAllPages");
                repos.trigger("requestAllPagesProgress", {totalRepositoryCount:1});
                repos.trigger("syncAllPages", {
                    pagesFetched: 1,
                    totalItemsLoaded: 100
                });
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

        it("Load data when necessary, handle an unknown error.", function() {

            var testGitHubUser = {
                fetch: function(options) {

                    options.error({ }, {  }, { });

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

            var $appContainer = $('#appContainer');

            expect($appContainer.is(':empty')).toBe(true);
            $appContainer.remove();

        });

    });

});
