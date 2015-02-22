define(["marionette", "views/RepositoryListItem"], function(Marionette, RepositoryListViewItem) {
    'use strict';

    return Marionette.CollectionView.extend({
        childView: RepositoryListViewItem,
        childEvents: {
            selectedItem: function (view, selectedItem) {
                this.trigger("selectedItem", selectedItem);
            }
        },
        attributes: {
            "class":"repoListCollectionContainer"
        },
        initialize: function() {

            if (this.collection.isSynced) {
                this.trimPagesAfterFullSync();
            }

        },
        trimPagesAfterFullSync: function() {
            this.collection.keepFirstTwenty();
        },
        collectionEvents: {
            "syncAllPages":"trimPagesAfterFullSync"
        }
    });

});