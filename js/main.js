require.config({
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
   deps: ["jquery", "underscore"]
});

require([
   "Application"
], function (Application) {
   "use strict";
   
   if (!window.isTesting) {
      // window.currentApp = app.StartNewApplication(null, "addyosmani");
      // window.currentApp = app.StartNewApplication(null, "addyosmani", app.GetSampleSession());
      window.currentApp = Application.CreateNewInstance(); // < Will require user to land on a recognised route.
   }
   
});
