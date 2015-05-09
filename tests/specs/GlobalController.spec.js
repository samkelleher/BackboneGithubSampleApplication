'use strict';

define(['controllers/Index'], function(GlobalController) {

    describe('GlobalController', function() {

        it("A global controller that checks it has been initialized properly.", function() {

            expect( function(){
                var controller = new GlobalController({});
            } ).toThrow(new Error("A controller needs a reference to the application that created it."));

            expect( function(){
                var controller = new GlobalController({application:{}});
            } ).toThrow(new Error("A controller needs a reference to the session that it is running in."));

            var controller = new GlobalController({application:{}, session:{}});
            expect(controller.session).not.toBe(undefined);


        });



    });

});