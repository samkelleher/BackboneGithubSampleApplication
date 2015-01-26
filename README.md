## Backbone + Marionette GitHub Profile Sample
A standalone sample application using [Backbone](http://backbonejs.org/) and [Marionette](http://marionettejs.com/) that connects to the GitHub API to download a list of repositories for a specified user; and displays them in a list.

### Demo

Run the included [index.html](index.html) or [run the hosted sample](https://samkelleher.github.io/BackboneGithubSampleApplication).

### Setup Locally

You will need to [install node](http://nodejs.org/download/) if you haven't got it already.

Open the project directory and run this command to download the latest development dependencies. You only need to do this if you want to build the project.

> npm install

### Dependencies

Written against v3 of the [GitHub API](https://developer.github.com/v3/).

Grunt (managed by npm) allows the source to be minified for production use.

Bower manages the rest of the front end packages, such as Backbone and Marionette themselves. If the `bower_components` directory in the projects root is deleted, you can install all these components again by running `bower install` from the command line. You can also keep this project up to date by running `bower update`.

### Author

Created as a sample application by [Sam Kelleher](https://samkelleher.com/).
