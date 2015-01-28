module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //watch: {
        //    files: ['<%= jshint.files %>'],
        //    tasks: ['jshint']
        //},
        jshint: {
            files: ['js/*.js'],
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
                    keepRunner: true,
                    vendor: ['bower_components/jquery/dist/jquery.js','bower_components/underscore/underscore.js','bower_components/backbone/backbone.js','bower_components/marionette/lib/backbone.marionette.js','bower_components/moment/moment.js' ]
                }
            },
            integration: {
                src: 'js/*.js',
                options: {
                    specs: 'tests/integration-spec.js',
                    outfile: 'tests/IntegrationSpecRunner.html',
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
                dest: 'js/auto-generated/libs.js'
            },
            full: {
                src: ['js/auto-generated/libs.js','js/models.js'],
                dest: 'js/auto-generated/full.debug.js'
            }
        },
        uglify: {
            options: {
                preserveComments: false
            },
            my_target: {
                files: {
                    'js/auto-generated/full.min.js': ['js/auto-generated/full.debug.js']
                }
            }
        },
        clean: ["js/full.debug.js"]
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    //grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('test', ['jshint' ,'jasmine:unit']);

    grunt.registerTask('integration', ['jshint' ,'jasmine:integration']);

    grunt.registerTask('build', ['concat', 'uglify', 'clean', 'jasmine:unit:build', 'jasmine:integration:build']);

    grunt.registerTask('default', ['build','test']);


};