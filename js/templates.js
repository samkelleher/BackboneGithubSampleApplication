define(function(){

this["templates"] = this["templates"] || {};

this["templates"]["AppLayout"] = function(model) {
var __t, __p = '', __e = _.escape;
__p += '<div class="headerContainer"><div class="container"><header class="header"></header></div></div><div class="container"><section class="content"></section><section class="footer"></section></div>';
return __p
};

this["templates"]["ContentErrorView"] = function(model) {
var __t, __p = '', __e = _.escape;
__p += '<div class="col-xs-12" style="padding-top: 15px;"><div class="alert alert-danger">' +
__e( model.message ) +
'</div></div>';
return __p
};

this["templates"]["HeaderView"] = function(model) {
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
__p += '<div class="col-xs-5"><h1><span class="mega-octicon octicon-octoface"></span> Popular Repositories</h1></div><div class="col-xs-7 text-right"><div class="titleContainer"><h2>' +
__e( model._name ) +
'</h2>';
 if (model._statusTitle && model._statusTitle.length) { ;
__p += '<h3>' +
__e( model._statusTitle ) +
'</h3>';
 } ;
__p += '</div><div class="avatar">';
 if(model._avatar_url) { ;
__p += '<img src="' +
__e( model._avatar_url ) +
'" alt="" title="" style="width:50px; height: 50px;" />';
 } ;
__p += '</div></div>';
return __p
};

this["templates"]["ListFooterView"] = function(model) {
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }

 if(model._hasRateLimit) { ;
__p += '<div class="col-xs-12"><div class="alert alert-info">You have <strong>' +
__e( model._requestLimitRemaining ) +
'</strong> GitHub API calls left from your quota of <strong>' +
__e( model._requestLimit ) +
'</strong>, this count will be reset at <strong>' +
__e( model._resetsAt ) +
'</strong>.</div></div>';
 } else if (model._isPreloaded) { ;
__p += '<div class="col-xs-12"><div class="alert alert-info">This data has been pre-populated without making a call to the GitHub API.</div></div>';
 } ;

return __p
};

this["templates"]["RepositoryDetailsLayout"] = function(model) {
var __t, __p = '', __e = _.escape;
__p += '<div class="repoDetailsSummaryHeaderContainer"></div><div class="repoDetailsLanguagesContainer"></div><div class="row"><div class="col-xs-12"><a class="cmdGoHome" href="index.html">Back to list</a></div></div>';
return __p
};

this["templates"]["RepositoryDetailsView"] = function(model) {
var __t, __p = '', __e = _.escape;
__p += '<div class="row"><div class="col-xs-3 col-sm-9"><h3>' +
__e( model.name ) +
'<span class="muted">&nbsp;&middot;&nbsp;' +
__e( model._lastUpdated ) +
'</span></h3></div><div class="col-xs-3 col-sm-1 muted"><span class="octicon octicon-star"></span>&nbsp;' +
__e( model.stargazers_count ) +
'</div><div class="col-xs-3 col-sm-1 muted"><span class="octicon octicon-eye"></span>&nbsp;' +
__e( model.watchers_count ) +
'</div><div class="col-xs-3 col-sm-1 muted"><span class="octicon octicon-git-branch"></span>&nbsp;' +
__e( model.forks_count ) +
'</div></div><div class="row"><div class="col-xs-12 muted"><p>' +
__e( model.description ) +
'</p></div></div>';
return __p
};

this["templates"]["RepositoryLanguagesListView"] = function(model) {
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }

 if (model.isFetched) { ;

 if (model.fetchError) { ;
__p += '<div class="row"><div class="col-xs-12">There was an error querying the languages this project uses.</div></div>';
 } else if (model.languageData && model._numberOfLanguages > 0) { ;
__p += '<div class="row">';
 _.each(model.languageData || [], function(element, index, list) { ;
__p += '<div class="repositoryLanguageItem col-xs-' +
__e( model._columnSize ) +
'"><span class="languageTitle muted">' +
__e( element.languageName ) +
'</span><span class="languagePercentage muted" title="' +
__e( element.byteLength ) +
' bytes.">' +
__e( (Math.round(10*element.percentage)/10).toString() ) +
'%</span></div>';
 }); ;

 if(model._finalFillerColumn) { ;
__p += '<div class="col-xs-' +
__e( model._finalFillerColumn ) +
'"></div>';
 } ;
__p += '</div>';
 } else { ;
__p += '<div class="row"><div class="col-xs-12">GitHub does not have any language information for this repository.</div></div>';
 } ;

 } else if (model.isFetching) { ;
__p += '<div class="row"><div class="col-xs-12">Loading language data...</div></div>';
 } else { ;
__p += '<div class="row"><div class="col-xs-12">Language data is not available.</div></div>';
 } ;

return __p
};

this["templates"]["RepositoryListViewItem"] = function(model) {
var __t, __p = '', __e = _.escape;
__p += '<div class="col-xs-3 col-sm-9"><h3>' +
__e( model.name ) +
'</h3></div><div class="col-xs-3 col-sm-1 muted"><span class="octicon octicon-star"></span>&nbsp;' +
__e( model.stargazers_count ) +
'</div><div class="col-xs-3 col-sm-1 muted"><span class="octicon octicon-eye"></span>&nbsp;' +
__e( model.watchers_count ) +
'</div><div class="col-xs-3 col-sm-1 muted"><span class="octicon octicon-git-branch"></span>&nbsp;' +
__e( model.forks_count ) +
'</div>';
return __p
};

this["templates"]["UsageInstructionsView"] = function(model) {
var __t, __p = '', __e = _.escape;
__p += '<div class="row"><div class="col-xs-12"><p>To use this app, pick a user to view or enter a username to locate.</p><p>Here are some examples profiles:</p><ul><li><a class="cmdViewUser" href="user/samkelleher">Sam Kelleher</a> (who wrote this sample app).</li><li><a class="cmdViewUser" href="user/addyosmani">Addy Osmani</a> (has <i>lots</i> of repositories and demonstrates paging and filtering).</li><li><a class="cmdViewUser" id="cmdViewSampleUser" href="user/sample">Sample Data</a> (which doesn\'t make any API calls).</li><li><a class="cmdViewUser" href="user/sdfouheyf092jefdg">Non-Existant User</a> (tests error handling for a user that doesn\'t exist).</li><li><input type="text" class="txtSearchUsername" placeholder="Enter github username..." title="Alphanumeric and hyphen characters only. Username cannot start with a hyphen either. Press [Enter] to search." /><button class="cmdSearch">View Repositories</button></li></ul></div></div>';
return __p
};

  return this["templates"];

});