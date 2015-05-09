'use strict';

define(['common/Utilities'], function(Utilities) {

    describe('Utilities', function() {

        it("Parse Query Strings.", function() {
            var qs = Utilities.parseQueryString();
            expect(qs).toEqual({});

            qs = Utilities.parseQueryString("   ");
            expect(qs).toEqual({});

            qs = Utilities.parseQueryString("test=true");
            expect(qs).toEqual({"test":"true"});

        });

    });

});