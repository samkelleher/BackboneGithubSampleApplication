module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['js/models.js','js/views.js','js/app.js'],
            options: {
                globals: {
                    jQuery: true,
                    Backbone: true,
                    Marionette: true,
                    app: true
                }
            }
        },
        jasmine: {
            unit: {
                src: 'js/*.js',
                options: {
                    specs: 'tests/unit-spec.js',
                    outfile: 'tests/UnitSpecRunner.html',
                    template:'tests/SpecRunnerTemplate.html',
                    keepRunner: true,
                    helpers: ['tests/helpers.js'],
                    vendor: ['bower_components/jquery/dist/jquery.js','bower_components/underscore/underscore.js','bower_components/backbone/backbone.js','bower_components/marionette/lib/backbone.marionette.js','bower_components/moment/moment.js' ]
                }
            },
            integration: {
                src: 'js/*.js',
                options: {
                    specs: 'tests/integration-spec.js',
                    outfile: 'tests/IntegrationSpecRunner.html',
                    template:'tests/SpecRunnerTemplate.html',
                    helpers: ['tests/helpers.js'],
                    keepRunner: true,
                    vendor: ['bower_components/jquery/dist/jquery.js','bower_components/underscore/underscore.js','bower_components/backbone/backbone.js','bower_components/marionette/lib/backbone.marionette.js','bower_components/moment/moment.js' ]
                }
            }
        },
        concat: {
            options: {
                separator: ';',
                stripBanners: true,
                sourceMap: false
            },
            libs: {
                src: ['bower_components/jquery/dist/jquery.js','bower_components/underscore/underscore.js','bower_components/backbone/backbone.js','bower_components/marionette/lib/backbone.marionette.js','bower_components/moment/moment.js' ],
                dest: 'dist/libs.js'
            },
            full: {
                src: ['dist/libs.js', 'js/sampleData.js', 'js/models.js', 'js/templates.js', 'js/views.js', 'js/app.js'],
                dest: 'dist/app.debug.js'
            }
        },
        uglify: {
            options: {
                preserveComments: false
            },
            my_target: {
                files: {
                    'dist/app.min.js': ['dist/app.debug.js']
                }
            }
        },
        clean: {
            dist: ["dist/*.*"],
            docco: ["docs/docco/*"],
            build: ["dist/libs.js","dist/app.debug.js"]
        },
        copy: {
            main: {
                files: [
                    {src: ['.grunt/grunt-contrib-jasmine/*'], dest: 'tests/jasmine/', flatten: true, filter: 'isFile', expand: true },
                    {src: 'css/favicon.ico', dest: 'dist/favicon.ico'},
                    {src: [
                        'bower_components/octicons/octicons/octicons.eot',
                        'bower_components/octicons/octicons/octicons.woff',
                        'bower_components/octicons/octicons/octicons.ttf',
                        'bower_components/octicons/octicons/octicons.svg'
                    ], dest: 'dist', filter: 'isFile', flatten: true, expand: true },
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
                    // Glob pattens don't work here because of structure
                    "js/app.js": "coverage",
                    "js/models.js": "coverage",
                    "js/views.js": "coverage"
                },
                coverageReporter: {
                    type: "lcov",
                    dir: "tests/coverage"
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
            },
            run: {
                options: {
                    singleRun: true
                }
            }
        },
        coveralls: {
            options: {
                coverageDir: "tests/coverage"
            }
        },
        cssmin: {
            target: {
                files: {
                    "dist/app.min.css":["bower_components/octicons/octicons/octicons.css", "css/grid.css", "css/app.css"]
                }
            }
        },
        jst: {
            compile: {
                files: {
                    "js/templates.js": ["views/*.html"]
                },
                options: {
                    namespace: "app.templates",
                    processName: function(filepath) {
                        return filepath.substring(6, filepath.length - 5);
                    },
                    templateSettings: {
                     variable: "model"
                    }
                }
            }
        },
        watch: {
            templates: {
                files: ['views/*.html'],
                tasks: ['jst'],
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
                    'dist/index.html': ['index.html']
                }
            }
        },
        docco: {
            debug: {
                src: ["js/models.js",
                    "js/app.js",
                    "js/views.js",],
                options: {
                    output: 'docs/docco/'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jst');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks("grunt-karma-coveralls");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-docco');

    grunt.registerTask('test', ['jshint', 'karma:run', 'coveralls']);

    grunt.registerTask('coverage', ['coveralls']);

    grunt.registerTask('integration', ['jshint' ,'jasmine:integration']);

    grunt.registerTask('build', ['concat', 'cssmin', 'uglify', 'clean:build', 'copy', 'processhtml:dist']);

    grunt.registerTask('default', ['build','test']);


};