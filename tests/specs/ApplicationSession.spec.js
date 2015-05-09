'use strict';

define(['models/ApplicationSession'], function(ApplicationSession) {

    describe('ApplicationSession', function() {

        it("Has default session values.", function() {
            var session = new ApplicationSession();

            var baseContainer = session.get("baseContainer");
            var isValid = session.isValid();

            expect(baseContainer).not.toBe(null);
            expect(isValid).toBe(true);

        });

        it("Checks it has a base container.", function() {
            var session = new ApplicationSession({baseContainer: null});
            var isValid = session.isValid();
            expect(isValid).toBe(false);
        });

        it("To detect user changes.", function() {

            var session = new ApplicationSession();

            var spies = {
                switchedUser: function() {

                }
            };

            spyOn(spies, "switchedUser");

            session.on("switchedUser", spies.switchedUser);

            session.switchUser("example");

            var username = session.get("username");

            expect(username).toBe("example");

            expect(spies.switchedUser).toHaveBeenCalled();

        });

    });

});