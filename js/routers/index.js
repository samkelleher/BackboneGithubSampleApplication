define(["marionette"], function (Marionette) {
   "use strict";

   return Marionette.AppRouter.extend({
      appRoutes: {
         "": "index",
         "user/:username": "indexWithUsername",
         "index.html": "index",
         "user/:username/repository/:id": "viewRepositoryDetailById",
         "*path": "defaultAction"
      }
   });

});
