define([
    "marionette",
    "templates"
], function(Marionette, templates) {
    'use strict';

    return Marionette.LayoutView.extend({
        regions: {
            content: "section.content",
            header: "header.header",
            footer: "section.footer"
        },
        template: templates.AppLayout,
        attributes: {
            "class":"profileAppWrapper"
        }
    });

});