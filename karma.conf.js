// karma.conf.js
module.exports = function(config) {

    config.set(


        {
            basePath: process.cwd(),
            singleRun: true,
            captureTimeout: 7000,
            autoWatch: false,
            logLevel: "ERROR",
            reporters: ["dots", "coverage"],
            browsers: ["PhantomJS"],
            frameworks: ["jasmine"],
            plugins: ["karma-jasmine", "karma-phantomjs-launcher", "karma-coverage"],
            preprocessors: {
                // Glob pattens don't work here because of structure
                "js/app.js": "coverage",
                "js/models.js": "coverage",
                "js/views.js": "coverage"
            },
            coverageReporter: {
                dir: "tests/coverage",
                reporters: [
                    { type: 'html', subdir: 'report-html' },
                    { type: 'lcovonly', subdir: 'report-lcov' }
                ]
            },
            files: [
                'bower_components/jquery/dist/jquery.js',
                'bower_components/underscore/underscore.js',
                'bower_components/backbone/backbone.js',
                'bower_components/marionette/lib/backbone.marionette.js',
                'bower_components/moment/moment.js',
                "tests/helpers.js",
                "js/sampleData.js",
                "js/models.js",
                "js/app.js",
                "js/templates.js",
                "js/views.js",

                "tests/unit-spec.js"
            ]
        }
    );

};