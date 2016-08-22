var Promise, _, exports, fs, log, maxId, moment;

fs = require('fs');

_ = require('underscore');

Promise = require('bluebird');

moment = require('moment');

Promise.promisifyAll(fs);

maxId = null;

log = function(message) {
  return console.log((moment().format('YYYY-MM-DD HH:mm:ss')) + " - " + message);
};

exports = module.exports = function(options) {
  var delay, getDataAsync, getMaxId, initMaxId, interval, maxIdPath, maxIdSince, maxIdUntil, Model;
  maxIdPath = options.maxIdPath, initMaxId = options.initMaxId, getMaxId = options.getMaxId, getDataAsync = options.getDataAsync, maxIdSince = options.maxIdSince, maxIdUntil = options.maxIdUntil, Model = options.Model;

  delay = 0;
  return fs.readFileAsync(maxIdPath, {
    encoding: 'utf-8'
  }).then(function(result) {
    return maxId = typeof result !== "undefined" && result !== null ? result.trim() : void 0;;
  })["catch"](function() {
    return maxId = maxIdSince || initMaxId || 0;
  }).then(interval = function() {
    Promise.resolve().then(function(){
      if (maxIdUntil && maxId >= maxIdUntil) {
        throw "Maximum max id reached";
      };
      var fetchStartAt = moment();
      return getDataAsync(maxId).then(function(results) {
        if (!results.length) {
          throw "No data";
        }
        var fetchUsed = moment().diff(fetchStartAt, 'seconds', true);
        log("From " + maxId + ", got " + results.length + " data, used " + fetchUsed + " seconds");
        var indexStartAt = moment();
        return Promise.all(_.map(results, function(result) {
          return Model.findByIdAndUpdate(result._id, result, {upsert: true});
        })).then(function() {
          return maxId = getMaxId(results);
        }).then(function() {
          return fs.writeFileAsync(maxIdPath, maxId);
        }).then(function() {
          delay = 0;
          var indexUsed = moment().diff(indexStartAt, 'seconds', true);
          return log("Indexed success, used " + indexUsed + " seconds");
        });
      });
    })["catch"](function(err) {
      delay = 30;
      return log(err);
    }).delay(1000 * delay).then(interval);
  });
};

exports.getMaxId = function () {
  return maxId;
}

exports.setMaxId = function(data) {
  return maxId = data;
};
