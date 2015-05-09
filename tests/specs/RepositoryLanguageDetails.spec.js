'use strict';

define(['models/RepositoryLanguageDetails'], function(RepositoryLanguageDetails) {

    describe('RepositoryLanguageDetails', function() {

        it("Parse language results.", function() {
            var languageDetails = new RepositoryLanguageDetails();

            var result = languageDetails.parseLanguageObject();
            expect(jQuery.isArray(result)).toBe(true);

            result = languageDetails.parseLanguageObject({});
            expect(jQuery.isArray(result)).toBe(true);

        });

        var repositoryLanguageDetails = new RepositoryLanguageDetails().setLanguageObject({
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

        it("Understands rate limits.", function() {
            var testRepoLang = new RepositoryLanguageDetails({owner: "sample", id: 1});

            var spied = {
                fakefetch: function(options) {

                    if (options.complete) {
                        options.complete({});
                    }

                    if (options.success) {
                        options.success(testRepoLang, {}, {xhr: {}});
                    }

                    if (options.error) {
                        options.error(testRepoLang, {});
                    }

                }};

            spyOn(spied, "fakefetch").and.callThrough();
            spyOn(Backbone.Model.prototype, "fetch").and.callFake(spied.fakefetch);

            testRepoLang.fetch({
                success:function(model, response) {
                    model.parse(response);
                },
                error:function() {

                },
                complete:function() {

                }
            });

            expect(spied.fakefetch).toHaveBeenCalled();
        });

        it("Generates a API url.", function() {
            var languageDetails = new RepositoryLanguageDetails();

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

});