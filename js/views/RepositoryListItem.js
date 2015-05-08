define(["marionette", "templates"], function (Marionette, templates) {
   "use strict";

   return Marionette.ItemView.extend({
      template: templates.RepositoryListViewItem,
      attributes: {
         "class": "row"
      },
      events: {
         "click": "selectDetailedView"
      },
      selectDetailedView: function (e) {
         e.preventDefault();
         this.trigger("selectedItem", this.model);
      }
   });

});
