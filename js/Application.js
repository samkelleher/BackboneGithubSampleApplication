define([
   "backbone",
   "marionette",
   "routers/index",
   "controllers/GlobalController",
   "views/ApplicationLayout",
   "models/ApplicationSession"
], function (Backbone, Marionette, IndexRouter, IndexController, ApplicationLayout, ApplicationSession) {
   "use strict";

   var Application = Marionette.Application.extend({
      initialize: function () {

         if (!this.options.model) {

            throw new Error("An application needs a session object to be able to run.");
         }

         if (!this.options.model.isValid()) {
            throw new Error(this.options.model.validationError);
         }

         if (this.options.model.attributes.singleInstance) {
            if (Application.currentSingleInstance && Application.currentSingleInstance.isStarted) {
               throw new Error("This instance cannot be made a single instance as another single instance is already running.");
            }

            Application.currentSingleInstance = this;
         } else {
            if (Application.currentSingleInstance && Application.currentSingleInstance.isStarted) {
               throw new Error("Another instance of this application has already been started, cannot start another.");
            }
         }

         this.router = new IndexRouter({controller: new IndexController({application: this, session: this.model})});

      },
      stop: function () {
         this.triggerMethod("before:stop");
         this.removeApplicationLayout();
         this.stopPushState();

         if (this.model.attributes.singleInstance) {
            Application.currentSingleInstance = null;
         }

         this.triggerMethod("stop");
      },
      removeApplicationLayout: function () {
         if (!this.isStarted || !this.rootRegion) {
            return;
         }

         this.rootRegion.reset();

         this.rootRegion = null;

         this.isStarted = false;
      },
      isStarted: false,
      setupApplicationLayout: function () {
         this.rootRegion = new Marionette.Region({
            el: this.options.model.get("baseContainer")
         });

         this.rootLayout = new ApplicationLayout();

         this.rootRegion.show(this.rootLayout);

      },
      historyStarted: false,
      originalUrl: "",
      setupPushState: function () {

         if (!this.model.attributes.singleInstance) {
            // When running more than one instance, we don"t want to alter the URL as it would cause conflicts.
            return;
         }

         var root = window.location.pathname;

         var defaultFileName = "index.html";
         var indexOfdefaultFileName = root.indexOf(defaultFileName, root.length - defaultFileName.length);

         if (indexOfdefaultFileName !== -1) {
            this.originalUrl = defaultFileName;
            root = root.substring(0, indexOfdefaultFileName);
         }

         this.historyStarted = Backbone.history.start({pushState: true, root: root});
      },
      stopPushState: function () {
         if (this.historyStarted) {
            this.router.navigate(this.originalUrl);
            this.historyStarted = false;
            Backbone.history.stop();
         }
      },
      onStart: function () {
         this.setupApplicationLayout();
         this.setupPushState();
         this.isStarted = true;
      }
   });

   /**
    * Create a new instance of the application.
    * @param baseContainerSelector
    * @param username
    * @param sessionToUse
    * @returns {application}
    * @constructor
    */
   Application.CreateNewInstance = function (baseContainerSelector, username, sessionToUse) {

      var sessionDefaults = {
         singleInstance: true
      };

      if (baseContainerSelector) {
         sessionDefaults.baseContainer = baseContainerSelector;
      }

      if (username) {
         sessionDefaults.username = username;
      }

      if (!sessionToUse) {
         sessionToUse = new ApplicationSession(sessionDefaults);
      }

      var applicationInstance = new Application({model: sessionToUse});

      applicationInstance.start({});

      return applicationInstance;

   };

   Application.currentSingleInstance = null;

   return Application;

});
