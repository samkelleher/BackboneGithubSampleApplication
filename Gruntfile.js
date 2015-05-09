module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jasmine: {
            unit: {
                options: {
                    specs: ["tests/specs/*spec.js"],
                    outfile: "tests/UnitSpecRunner.html",
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfigFile: 'js/main.js',
                        requireConfig: {
                            baseUrl: '../js/'
                        }
                    },
                    keepRunner: true,
                    helpers: ["tests/helpers.js"]
                }
            },
            integration: {
                src: "js/*.js",
                options: {
                    specs: "tests/integration-spec.js",
                    outfile: "tests/IntegrationSpecRunner.html",
                    template: "tests/SpecRunnerTemplate.html",
                    helpers: ["tests/helpers.js"],
                    keepRunner: true,
                    vendor: ["bower_components/jquery/dist/jquery.js", "bower_components/underscore/underscore.js", "bower_components/backbone/backbone.js", "bower_components/marionette/lib/backbone.marionette.js", "bower_components/moment/moment.js"]
                }
            }
        },
        clean: {
            dist: ["dist/*.*"],
            docco: ["docs/docco/*"]
        },
        copy: {
            main: {
                files: [
                    {
                        src: [".grunt/grunt-contrib-jasmine/*"],
                        dest: "tests/jasmine/",
                        flatten: true,
                        filter: "isFile",
                        expand: true
                    },
                    {src: "css/favicon.ico", dest: "dist/favicon.ico"},
                    {
                        src: [
                            "bower_components/octicons/octicons/octicons.eot",
                            "bower_components/octicons/octicons/octicons.woff",
                            "bower_components/octicons/octicons/octicons.ttf",
                            "bower_components/octicons/octicons/octicons.svg"
                        ], dest: "dist", filter: "isFile", flatten: true, expand: true
                    }
                ]
            }
        },
        karma: {
            options: {
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
                    "js/*.js": "coverage"
                },
                coverageReporter: {
                    dir: "tests/coverage",
                    reporters: [
                        {type: "html", subdir: "report-html"},
                        {type: "lcovonly", subdir: "report-lcov"}
                    ]
                },
                files: [
                    "bower_components/jquery/dist/jquery.js",
                    "bower_components/underscore/underscore.js",
                    "bower_components/backbone/backbone.js",
                    "bower_components/backbone.marionette/lib/backbone.marionette.js",
                    "bower_components/moment/moment.js",
                    "tests/helpers.js",
                    "tests/unit-spec.js"
                ]
            },
            run: {
                options: {
                    singleRun: true
                }
            }
        },
        coveralls: {
            options: {
                coverageDir: "tests/coverage/report-lcov"
            }
        },
        cssmin: {
            target: {
                files: {
                    "dist/app.min.css": ["bower_components/octicons/octicons/octicons.css", "css/grid.css", "css/app.css"]
                }
            }
        },
        jst: {
            compile: {
                files: {
                    "js/templates.js": ["views/*.html"]
                },
                options: {
                    namespace: "templates",
                    amd: true,
                    processName: function (filepath) {
                        return filepath.substring(6, filepath.length - 5);
                    },
                    processContent: function (src) {
                        return src.replace(/\r?\n|\r/gm, "").replace(/\s{2,}/gm, " ").replace(/>\s+</gm, "><");
                    },
                    templateSettings: {
                        variable: "model"
                    }
                }
            }
        },
        watch: {
            templates: {
                files: ["views/*.html"],
                tasks: ["jst"],
                options: {
                    interrupt: true
                }
            }
        },
        processhtml: {
            options: {
                strip: true
            },
            dist: {
                files: {
                    "dist/index.html": ["index.html"]
                }
            }
        },
        docco: {
            debug: {
                src: ["js/models.js",
                    "js/app.js",
                    "js/views.js"],
                options: {
                    output: "docs/docco/"
                }
            }
        },
        requirejs: {
            compile: {
                options: {
                    mainConfigFile: "js/main.js",
                    logLevel: 1,
                    preserveLicenseComments: false,
                    include: ["main"],
                    name: "../node_modules/almond/almond",
                    out: "dist/app.min.js"
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-jst");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-karma-coveralls");
    grunt.loadNpmTasks("grunt-karma");
    grunt.loadNpmTasks("grunt-processhtml");
    grunt.loadNpmTasks("grunt-docco");
    grunt.loadNpmTasks("grunt-contrib-requirejs");

    grunt.registerTask("test", ["karma:run", "coveralls"]);

    grunt.registerTask("coverage", ["coveralls"]);

    grunt.registerTask("integration", ["jasmine:integration"]);

    grunt.registerTask("build", ["clean:dist", "requirejs", "cssmin", "copy", "processhtml:dist"]);

    grunt.registerTask("default", ["build", "test"]);

};
