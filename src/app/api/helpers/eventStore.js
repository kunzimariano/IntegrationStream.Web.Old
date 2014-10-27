﻿
//TODO: choose one, request is more versatile while request-json is handy
var request = require('request'),
    reqJson = require('request-json'),
    assert = require('assert');

function eventStore(baseUrl, userName, password) {
  this.baseUrl = baseUrl;
  this.username = userName;
  this.password = password;
  
  this.authorization = 'Basic ' + new Buffer(this.username + ':' + this.password).toString('base64');
}

eventStore.prototype.pushEvents = function (events, callback) {
  //TODO: review this approach
  //assert.ok(events, 'You must pass events');
  var eventStoreUrl = this.baseUrl + '/streams/github-events';
  
  var options = {
    url: eventStoreUrl,
    body: events,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/vnd.eventstore.events+json',
      'Content-Length': events.length,
      'Authorization': this.authorization
    }
  };
  
  request.post(options, function (error, response, body) {
    callback(error, response, body);
  });
};

eventStore.prototype.getLastCommit = function (args, callback) {
  //TODO: review this approach
  assert.ok(args.owner && args.repo, 'You must specify an owner and a repo.');
  
  var eventStoreUrl = this.baseUrl + '/streams/repo-' + args.owner + '-' + args.repo + '/head?embed=content';
  
  var options = {
    url: eventStoreUrl,            
    headers: {
      'Accept': 'application/json'
    }
  };
  
  request.get(options, function (error, response, body) {
    callback(error, response, body);
  });
};

eventStore.prototype.getLastAssets = function (args, callback) {
  //TODO: review this approach
  assert.ok(args.workitem, 'You must specify a workitem.');
  
  var path = '/streams/asset-' + 
    args.workitem +
    '/head/backward/' +
    args.pageSize +
    '?embed=content';
  
  var client = reqJson.newClient(this.baseUrl);
  client.get(path, function (err, response, body) {
    callback(err, body.entries);
  });

};

eventStore.prototype.createProjection = function (args, callback) {
  assert.ok(args.name && args.script, 'You must specify a name and a script.');
  
  var eventStoreUrl = this.baseUrl + '/projections/continuous?emit=yes&checkpoints=yes&enabled=yes&name=' + args.name;
  
  var options = {
    url: eventStoreUrl,            
    headers: {
      'Accept': 'application/json',
      'Authorization': this.authorization,
      'Content-Type': 'application/json;charset=utf-8',
      'Content-Length': args.script.length
    },
    body: args.script
  };
  
  request.post(options, function (err, response, body) {
    callback(err, response, body);
  });
};

eventStore.prototype.getProjections = function (callback) {
  var client = reqJson.newClient(this.baseUrl);
  client.get('/projections/all-non-transient', function (err, response, body) {
    callback(err, response, body);
  });
};

module.exports = eventStore;