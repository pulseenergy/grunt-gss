(function() {
  module.exports = function(grunt) {
    var csv2json, done, extend, getAccessToken, getAuth, getCsv, getFile, getSheet, google, http, open, request, rxFileIdAndGid, rxTrue, toType, _auths, _files, _sheets;
    csv2json = require('./lib/csv2json');
    done = void 0;
    extend = require('deep-extend');
    google = require('googleapis');
    http = require('http');
    open = require('open');
    request = require('request');
    toType = function(o) {
      return {}.toString.call(o).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };
    getCsv = function(id, secret, fileId, gid, callback) {
      return getAuth(id, secret, 'http://localhost:4477/', 'offline', 'https://www.googleapis.com/auth/drive.readonly', function(auth) {
        return getFile(auth, fileId, function(file) {
          return getSheet(auth, file, gid, callback);
        });
      });
    };
    _sheets = {};
    getSheet = function(auth, file, gid, callback) {
      var headers, uri;
      uri = file['exportLinks']['text/csv'] + '&gid=' + gid;
      if (!_sheets[uri]) {
        headers = {
          Authorization: "Bearer " + auth.credentials.access_token
        };
        return request({
          uri: uri,
          headers: headers
        }, function(err, sheet) {
          if (err && err.message) {
            grunt.log.error(err.message);
            return done(false);
          } else {
            return callback(_sheets[uri] = sheet.body);
          }
        });
      } else {
        return callback(_sheets[uri]);
      }
    };
    _files = {};
    getFile = function(auth, fileId, callback) {
      var drive;
      if (!_files[fileId]) {
        drive = google.drive({
          version: 'v2',
          auth: auth
        });
        return drive.files.get({
          fileId: fileId
        }, function(err, file) {
          if (err && err.message) {
            grunt.log.error(err.message);
            return done(false);
          } else {
            return callback(_files[fileId] = file);
          }
        });
      } else {
        return callback(_files[fileId]);
      }
    };
    _auths = {};
    getAuth = function(id, secret, redirect, access_type, scope, callback) {
      var client;
      if (!_auths[id]) {
        client = _auths[id] = new google.auth.OAuth2(id, secret, redirect);
        return getAccessToken(client.generateAuthUrl({
          access_type: access_type,
          scope: scope
        }), function(code) {
          return client.getToken(code, function(err, tokens) {
            if (err && err.message) {
              grunt.log.error(err.message);
              return done(false);
            } else {
              client.setCredentials(tokens);
              return callback(_auths[id] = client);
            }
          });
        });
      } else {
        return callback(_auths[id]);
      }
    };
    getAccessToken = function(url, callback) {
      var server;
      open(url);
      server = http.createServer(function(req, rep) {
        rep.end();
        req.connection.destroy();
        server.close();
        return callback(req.url.substr(7));
      });
      server.maxConnections = 1;
      return server.listen(4477);
    };
    rxFileIdAndGid = /^.*[\/\=](\w{44}).*gid=(\d+).*$/i;
    rxTrue = /^true$/i;
    grunt.registerMultiTask('gss', function() {
      var data, next;
      done = this.async();
      data = this.data;
      (next = function(file, files) {
        var fileId, gid, matches, opts;
        matches = file.src[0].match(rxFileIdAndGid);
        fileId = matches[1];
        gid = matches[2];
        opts = extend({}, data.options, file.options || {});
        return getCsv(opts.clientId, opts.clientSecret, fileId, gid, function(out) {
          var col, cols, i, row, type, types, val, _i, _j, _len, _len1, _ref;
          if (opts.json) {
            out = JSON.parse(csv2json(out));
            if (opts.mapping) {
              cols = [];
              types = [];
              _ref = opts.mapping;
              for (col in _ref) {
                type = _ref[col];
                cols.push(col);
                types.push(type);
              }
              for (_i = 0, _len = out.length; _i < _len; _i++) {
                row = out[_i];
                for (i = _j = 0, _len1 = types.length; _j < _len1; i = ++_j) {
                  type = types[i];
                  col = cols[i];
                  val = row[col];
                  if (toType(type) === 'function') {
                    row[col] = type(val, row);
                  } else if (toType(val) !== type) {
                    if (type === 'array') {
                      if (val.indexOf(',') !== -1) {
                        row[col] = val.split(',');
                      } else {
                        row[col] = val ? [val] : [];
                      }
                    } else if (type === 'boolean') {
                      row[col] = rxTrue.test(val);
                    } else if (type === 'number') {
                      row[col] = parseFloat(val);
                    } else if (type === 'undefined') {
                      delete row[col];
                    }
                  }
                }
              }
            }
            if (opts.json && opts.prettify) {
              out = JSON.stringify(out, null, 2);
            }
          }
          if (toType(opts.wrap) === 'function') {
            out = opts.wrap(out);
          }
          grunt.file.write(file.dest, out);
          if (!files.length) {
            return done(true);
          } else {
            return next(files.shift().orig, files);
          }
        });
      })(this.files.shift().orig, this.files);
      return null;
    });
    return null;
  };

}).call(this);
