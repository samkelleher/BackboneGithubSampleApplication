define([
    "backbone",
    "models/RepositoryLanguageDetails"
], function(Backbone, RepositoryLanguageDetails) {
    'use strict';

    return Backbone.Model.extend({
        getLanguageModel: function() {
            return new RepositoryLanguageDetails().withUrl(this.get("languages_url"));
        },
        defaults: {
            stargazers_count:0,
            watchers_count:0
        }
    });

});

