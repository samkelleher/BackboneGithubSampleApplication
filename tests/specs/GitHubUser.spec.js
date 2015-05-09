'use strict';

define(['models/GitHubUser'], function(GitHubUser) {

    describe('GitHubUser', function() {
        var gitHubUser;

        beforeEach(function() {
            gitHubUser = new GitHubUser();

            // mock out a song object with a jasmine spy
            //song = jasmine.createSpyObj('song', ['persistFavouriteStatus']);
        });

        it('Require a username to call the endpoint.', function() {
            expect(function() {
                gitHubUser.url();
            }).toThrow(new Error("Cannot get a users profile without their username."));

        });
    });

});