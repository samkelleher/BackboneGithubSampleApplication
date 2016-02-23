module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            unit: {
                options: {
                    specs: ['tests/specs/*spec.js'],
                    outfile: 'tests/UnitSpecRunner.html',
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfigFile: 'js/main.js',
                        requireConfig: {
                            baseUrl: '../js/'
                        }
                    },
                    keepRunner: true,
                    helpers: ['tests/helpers.js']
                }
            },
            integration: {
                options: {
                    specs: ['tests/specs-integration/*spec.js'],
                    outfile: 'tests/IntegrationSpecRunner.html',
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfigFile: 'js/main.js',
                        requireConfig: {
                            baseUrl: '../js/'
                        }
                    },
                    keepRunner: true,
                    helpers: ['tests/helpers.js']
                }
            }
        },
        clean: {
            options: {
                force: true
            },
            dist: ['dist/*.*'],
            docco: ['docs/docco/*']
        },
        copy: {
            main: {
                files: [
                    {
                        src: ['.grunt/grunt-contrib-jasmine/*'],
                        dest: 'tests/jasmine/',
                        flatten: true,
                        filter: 'isFile',
                        expand: true
                    },
                    {src: 'css/favicon.ico', dest: 'dist/favicon.ico'},
                    {
                        src: [
                            'bower_components/octicons/octicons/octicons.eot',
                            'bower_components/octicons/octicons/octicons.woff',
                            'bower_components/octicons/octicons/octicons.ttf',
                            'bower_components/octicons/octicons/octicons.svg'
                        ], dest: 'dist', filter: 'isFile', flatten: true, expand: true
                    }
                ]
            }
        },
        karma: {
            options: {
                basePath: process.cwd(),
                singleRun: true,
                colors: true,
                captureTimeout: 7000,
                autoWatch: false,
                captureConsole: true,
                logLevel: 'WARN',
                reporters: ['dots', 'coverage'],
                browsers: ['PhantomJS'],
                frameworks: ['requirejs', 'jasmine'],
                plugins: ['karma-requirejs', 'karma-jasmine', 'karma-phantomjs-launcher', 'karma-coverage'],
                preprocessors: {
                    'js/**/*.js': 'coverage'
                },
                coverageReporter: {
                    dir: 'tests/coverage',
                    reporters: [
                        {type: 'html', subdir: 'report-html'},
                        {type: 'lcovonly', subdir: 'report-lcov'}
                    ]
                },
                files: [
                    {pattern: 'bower_components/**/*.js', included: false},
                    {pattern: 'js/**/*.js', included: false},
                    {pattern: 'tests/specs/**/*spec.js', included: false},
                    {pattern: 'tests/test-main.js', included: true}
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
                coverageDir: 'tests/coverage/report-lcov'
            }
        },
        cssmin: {
            target: {
                files: {
                    'dist/app.min.css': ['bower_components/octicons/octicons/octicons.css', 'css/grid.css', 'css/app.css']
                }
            }
        },
        jst: {
            compile: {
                files: {
                    'js/templates.js': ['views/*.html']
                },
                options: {
                    namespace: 'templates',
                    amd: true,
                    processName: function (filepath) {
                        return filepath.substring(6, filepath.length - 5);
                    },
                    processContent: function (src) {
                        return src.replace(/\r?\n|\r/gm, '').replace(/\s{2,}/gm, ' ').replace(/>\s+</gm, '><');
                    },
                    templateSettings: {
                        variable: 'model'
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
                src: ['js/models.js',
                    'js/app.js',
                    'js/views.js'],
                options: {
                    output: 'docs/docco/'
                }
            }
        },
        requirejs: {
            compile: {
                options: {
                    mainConfigFile: 'js/main.js',
                    logLevel: 1,
                    preserveLicenseComments: false,
                    include: ['main'],
                    name: '../node_modules/almond/almond',
                    out: 'dist/app.min.js'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jst');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-karma-coveralls');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-docco');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.registerTask('test', ['karma:run', 'coveralls']);

    grunt.registerTask('coverage', ['coveralls']);

    grunt.registerTask('integration', ['jasmine:integration']);

    grunt.registerTask('build', ['clean:dist', 'requirejs', 'cssmin', 'copy', 'processhtml:dist']);

    grunt.registerTask('default', ['build', 'test']);

};
