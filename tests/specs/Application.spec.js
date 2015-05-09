'use strict';

define(['Application'], function(Application) {

    describe('Application', function() {

        it("An application that checks it has been initialized properly.", function() {

            expect( function(){
                var appTest = new Application({});
            } ).toThrow(new Error("An application needs a session object to be able to run."));

            expect( function(){
                var appTest = new Application({model:{
                    validationError:"Model Invalid Test Error Message",
                    isValid: function() {
                        return false;
                    }}});
            } ).toThrow(new Error("Model Invalid Test Error Message"));

            Application.currentSingleInstance = {isStarted: true};

            expect( function(){

                var appTest = new Application({
                    model:{  isValid: function() {
                        return true;
                    },attributes: {
                        singleInstance: true
                    }
                    }});
            } ).toThrow();

            expect( function(){
                var appTest = new Application({
                    model:{  isValid: function() {
                        return true;
                    },
                        attributes: {
                            singleInstance: false
                        }

                    }});
            } ).toThrow();

            Application.currentSingleInstance = null;

        });

    });

});