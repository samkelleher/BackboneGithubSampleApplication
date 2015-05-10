var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;
var PROJECTFILE_REGEXP = /^\/base\/tests/i;

var pathToModule = function(path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (PROJECTFILE_REGEXP.test(file) && TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push('/base/' + pathToModule(file) + '.js');
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base/js',

   paths: {
      underscore: "../bower_components/underscore/underscore",
      backbone: "../bower_components/backbone/backbone",
      marionette: "../bower_components/backbone.marionette/lib/backbone.marionette",
      jquery: "../bower_components/jquery/dist/jquery",
      moment: "../bower_components/moment/moment"
   },
   shim: {
      underscore: {
         exports: "_"
      },
      backbone: {
         exports: "Backbone",
         deps: ["jquery", "underscore"]
      },
      marionette: {
         exports: "Backbone.Marionette",
         deps: ["backbone"]
      }
   },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});
