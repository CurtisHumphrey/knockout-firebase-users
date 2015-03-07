(function() {
  define(function(require) {
    var exports, fire_admin, fire_auth;
    fire_auth = require('fire_auth');
    fire_admin = require('fire_admin');
    return exports = {
      fire_auth: fire_auth,
      fire_admin: fire_admin
    };
  });

}).call(this);
