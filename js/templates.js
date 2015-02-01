this["app"] = this["app"] || {};
this["app"]["templates"] = this["app"]["templates"] || {};

this["app"]["templates"]["AppLayout"] = function(model) {
var __t, __p = '', __e = _.escape;
__p += '<div class="headerContainer"><div class="container"><header class="header"></header></div></div>\r\n<div class="container"><section class="content"></section>\r\n    <section class="footer"></section>\r\n</div>';
return __p
};

this["app"]["templates"]["ContentErrorView"] = function(model) {
var __t, __p = '', __e = _.escape;
__p += '<div class="col-xs-12" style="padding-top: 15px;">\r\n    <div class="alert alert-danger">\r\n        ' +
__e( model.message ) +
'\r\n    </div>\r\n</div>';
return __p
};

this["app"]["templates"]["HeaderView"] = function(model) {
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
__p += '<div class="col-xs-5"><h1><span class="mega-octicon octicon-octoface"></span> Popular Repositories</h1></div>\r\n<div class="col-xs-7 text-right">\r\n\r\n    <div class="titleContainer">\r\n        <h2>' +
__e( model._name ) +
'</h2>\r\n        ';
 if (model._statusTitle && model._statusTitle.length) { ;
__p += '\r\n        <h3>' +
__e( model._statusTitle ) +
'</h3>\r\n        ';
 } ;
__p += '\r\n    </div>\r\n\r\n    <div class="avatar">\r\n        ';
 if(model._avatar_url) { ;
__p += '\r\n        <img src="' +
__e( model._avatar_url ) +
'" alt="" title="" style="width:50px; height: 50px;" />\r\n        ';
 } ;
__p += '\r\n    </div>\r\n\r\n</div>';
return __p
};

this["app"]["templates"]["ListFooterView"] = function(model) {
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }

 if(model._hasRateLimit) { ;
__p += '\r\n<div class="col-xs-12">\r\n\r\n    <div class="alert alert-info">You have <strong>' +
__e( model._requestLimitRemaining ) +
'</strong> GitHub API calls left from your quota of <strong>' +
__e( model._requestLimit ) +
'</strong>, this count will be reset at <strong>' +
__e( model._resetsAt ) +
'</strong>.</div>\r\n\r\n</div>\r\n\r\n';
 } else if (model._isPreloaded) { ;
__p += '\r\n<div class="col-xs-12">\r\n\r\n    <div class="alert alert-info">This data has been pre-populated without making a call to the GitHub API.</div>\r\n\r\n</div>\r\n';
 } ;

return __p
};

this["app"]["templates"]["RepositoryDetailsLayout"] = function(model) {
var __t, __p = '', __e = _.escape;
__p += '<div class="repoDetailsSummaryHeaderContainer"></div>\r\n<div class="repoDetailsLanguagesContainer"></div>\r\n<div class="row">\r\n    <div class="col-xs-12"><a class="cmdGoHome" href="index.html">Back to list</a></div>\r\n</div>';
return __p
};

this["app"]["templates"]["RepositoryDetailsView"] = function(model) {
var __t, __p = '', __e = _.escape;
__p += '<div class="row">\r\n\r\n    <div class="col-xs-3 col-sm-9">\r\n        <h3>' +
__e( model.name ) +
'<span class="muted">&nbsp;&middot;&nbsp;' +
__e( model._lastUpdated ) +
'</span></h3>\r\n\r\n    </div>\r\n    <div class="col-xs-3 col-sm-1 muted">\r\n\r\n        <span class="octicon octicon-star"></span>&nbsp;' +
__e( model.stargazers_count ) +
'\r\n\r\n    </div>\r\n    <div class="col-xs-3 col-sm-1 muted">\r\n\r\n        <span class="octicon octicon-eye"></span>&nbsp;' +
__e( model.watchers_count ) +
'\r\n\r\n    </div>\r\n    <div class="col-xs-3 col-sm-1 muted">\r\n\r\n        <span class="octicon octicon-git-branch"></span>&nbsp;' +
__e( model.forks_count ) +
'\r\n\r\n    </div>\r\n\r\n</div>\r\n\r\n<div class="row">\r\n\r\n    <div class="col-xs-12 muted">\r\n        <p>' +
__e( model.description ) +
'</p>\r\n\r\n    </div>\r\n\r\n</div>';
return __p
};

this["app"]["templates"]["RepositoryLanguagesListView"] = function(model) {
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }

 if (model.isFetched) { ;
__p += '\r\n\r\n';
 if (model.fetchError) { ;
__p += '\r\n\r\n<div class="row">\r\n    <div class="col-xs-12">There was an error querying the languages this project uses.</div>\r\n</div>\r\n\r\n';
 } else if (model.languageData && model._numberOfLanguages > 0) { ;
__p += '\r\n\r\n<div class="row">\r\n\r\n    ';
 _.each(model.languageData || [], function(element, index, list) { ;
__p += '\r\n    <div class="repositoryLanguageItem col-xs-' +
__e( model._columnSize ) +
'">\r\n        <span class="languageTitle muted">' +
__e( element.languageName ) +
'</span>\r\n        <span class="languagePercentage muted" title="' +
__e( element.byteLength ) +
' bytes.">' +
__e( (Math.round(10*element.percentage)/10).toString() ) +
'%</span>\r\n    </div>\r\n    ';
 }); ;
__p += '\r\n\r\n    ';
 if(model._finalFillerColumn) { ;
__p += '\r\n    <div class="col-xs-' +
__e( model._finalFillerColumn ) +
'">\r\n\r\n    </div>\r\n    ';
 } ;
__p += '\r\n\r\n</div>\r\n\r\n';
 } else { ;
__p += '\r\n\r\n<div class="row">\r\n    <div class="col-xs-12">GitHub does not have any language information for this repository.</div>\r\n</div>\r\n\r\n';
 } ;
__p += '\r\n\r\n';
 } else if (model.isFetching) { ;
__p += '\r\n\r\n<div class="row">\r\n    <div class="col-xs-12">Loading language data...</div>\r\n</div>\r\n\r\n';
 } else { ;
__p += '\r\n\r\n<div class="row">\r\n    <div class="col-xs-12">Language data is not available.</div>\r\n</div>\r\n\r\n';
 } ;

return __p
};

this["app"]["templates"]["RepositoryListViewItem"] = function(model) {
var __t, __p = '', __e = _.escape;
__p += '<div class="col-xs-3 col-sm-9">\r\n    <h3>' +
__e( model.name ) +
'</h3>\r\n\r\n</div>\r\n<div class="col-xs-3 col-sm-1 muted">\r\n\r\n    <span class="octicon octicon-star"></span>&nbsp;' +
__e( model.stargazers_count ) +
'\r\n\r\n</div>\r\n<div class="col-xs-3 col-sm-1 muted">\r\n\r\n    <span class="octicon octicon-eye"></span>&nbsp;' +
__e( model.watchers_count ) +
'\r\n\r\n</div>\r\n<div class="col-xs-3 col-sm-1 muted">\r\n\r\n    <span class="octicon octicon-git-branch"></span>&nbsp;' +
__e( model.forks_count ) +
'\r\n\r\n</div>';
return __p
};

this["app"]["templates"]["UsageInstructionsView"] = function(model) {
var __t, __p = '', __e = _.escape;
__p += '<div class="row">\r\n    <div class="col-xs-12">\r\n        <p>To use this app, pick a user to view or enter a username to locate.</p>\r\n        <p>Here are some examples profiles:</p>\r\n        <ul>\r\n            <li><a class="cmdViewUser" href="user/samkelleher">Sam Kelleher</a> (who wrote this sample app).</li>\r\n            <li><a class="cmdViewUser" href="user/addyosmani">Addy Osmani</a> (has <i>lots</i> of repositories and demonstrates paging and filtering).</li>\r\n            <li><a class="cmdViewUser" href="user/sample">Sample Data</a> (which doesn\'t make any API calls).</li>\r\n            <li><a class="cmdViewUser" href="user/sdfouheyf092jefdg">Non-Existant User</a> (tests error handling for a user that doesn\'t exist).</li>\r\n            <li><input type="text" class="txtSearchUsername" placeholder="Enter github username..." title="Alphanumeric and hyphen characters only. Username cannot start with a hyphen either. Press [Enter] to search." /> <button class="cmdSearch">View Repositories</button></li>\r\n        </ul>\r\n    </div>\r\n</div>';
return __p
};