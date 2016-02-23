## Backbone + Marionette GitHub Profile Sample
>A standalone sample application using [Backbone](http://backbonejs.org/) and [Marionette](http://marionettejs.com/) that connects to the GitHub API to download a list of repositories for a specified user; and displays them in a list.

[![Build Status](https://travis-ci.org/samkelleher/BackboneGithubSampleApplication.svg?branch=gh-pages)](https://travis-ci.org/samkelleher/BackboneGithubSampleApplication)
[![Coverage Status](https://coveralls.io/repos/samkelleher/BackboneGithubSampleApplication/badge.svg?branch=gh-pages)](https://coveralls.io/r/samkelleher/BackboneGithubSampleApplication?branch=gh-pages)
[![Codacy Badge](https://www.codacy.com/project/badge/3284cecf47a3441fb408173ad1f0fbd9)](https://www.codacy.com/app/sk/BackboneGithubSampleApplication)

![Screenshot](/../screenshots/screenshot2.PNG?raw=true "Backbone + Marionette GitHub Profile Sample")

### Demo

Run the included [index.html](index.html) locally or [run the hosted distributable example](https://samkelleher.github.io/BackboneGithubSampleApplication/dist/index.html). You can run `npm start` once you have built the project to start a small webserver and open the demo in your browser automatically.

### Setup Locally

You will need to [install node](http://nodejs.org/download/) if you haven't got it already.

Open the project directory and run this command to download the latest development dependencies. You only need to do this if you want to build the project. This will install Grunt and Bower locally to the project.

> npm install

### Dependencies

Written against v3 of the [GitHub API](https://developer.github.com/v3/).

[Grunt](http://gruntjs.com/) allows the source to be minified for production use.

[Bower](http://bower.io/) manages the rest of the front end packages, such as Backbone and Marionette themselves. If the `bower_components` directory in the projects root is deleted, you can install all these components again by running `npm run bower` from the command line. You can also keep this project up to date by running `npm run bower:update`.

Both Grunt and Bower can installed automatically by running the `npm install` command as above.

### Building

You can run the full unminified version by just opening the root [index.html](index.html). There is also a [/dist/](dist) directory that contains the [full compiled version](dist/index.html) (minified css/js etc), this directory contains all the files needed to run the application.

To regenerate this directory run `npm run build`.

The debug template also always uses pre-compiled view templates from the auto-generated [js/templates.js](js/templates.js). The content of this file consists of all the un-compiled html views that are found in the [/views/](views) folder.

You can manually force a template compilation by running `npm run build:jst`. Alternatively, if you simply run `npm run watch` when you start working on the application, the templates.js file will be regenerated automatically as soon as any changes to the view folder are made.

### Testing
Unit and Integration tests can be performed separately. By default, only unit tests are performed.

Run `npm test` to execute unit tests using [Jasmine](https://github.com/jasmine/jasmine) inside a [PhantomJS](http://phantomjs.org/) instance.

Run `npm run integration` to perform a slower integration test only; which will actually connect to the live APIs used by this application.

You can also load the test runners themselves in your browser for the [unit test runner](tests/UnitSpecRunner.html) ([hosted example](https://samkelleher.github.io/BackboneGithubSampleApplication/tests/UnitSpecRunner.html)) and [integration test runner](test/IntegrationSpecRunner.html) ([hosted example](https://samkelleher.github.io/BackboneGithubSampleApplication/tests/IntegrationSpecRunner.html)). These two spec runner files are generated automatically by running the `npm run build` command.

The default test runner is [Karma](http://karma-runner.github.io) which will perform unit testing instrumented with code coverage by [Istanbul](https://github.com/gotwarlost/istanbul), this in turn generates a complete [code coverage report](https://samkelleher.github.io/BackboneGithubSampleApplication/tests/coverage/report-html/index.html). This is in addition to the automated code coverage data published by [Coveralls](https://coveralls.io/r/samkelleher/BackboneGithubSampleApplication?branch=gh-pages) from the continuous integration builds run by [Travis](https://travis-ci.org/samkelleher/BackboneGithubSampleApplication).

### Author

Created as a sample application by [Sam Kelleher](https://samkelleher.com/).
