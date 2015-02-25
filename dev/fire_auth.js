(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define(function(require) {
    var Fire_Auth, Fire_Model_By_Ref, ko;
    ko = require('knockout');
    Fire_Model_By_Ref = require('fire_model_by_ref');
    require('fire_value');
    return Fire_Auth = (function() {
      function Fire_Auth(options) {
        this._Auth_Monitor = __bind(this._Auth_Monitor, this);
        this.Recover_Password = __bind(this.Recover_Password, this);
        this.Change_User = __bind(this.Change_User, this);
        this.Change_User_Type = __bind(this.Change_User_Type, this);
        this.Logout = __bind(this.Logout, this);
        this.Login = __bind(this.Login, this);
        this.Create_User = __bind(this.Create_User, this);
        var _ref, _ref1;
        this.fire_ref = options.fire_ref;
        this._public = (_ref = options.public_keys) != null ? _ref : {};
        this._private = (_ref1 = options.private_keys) != null ? _ref1 : {};
        this.user = {};
        this.user_id = ko.observable();
        this.valid = ko.pureComputed((function(_this) {
          return function() {
            return Boolean(_this.user_id());
          };
        })(this));
        this.fire_ref.onAuth(this._Auth_Monitor);
        Fire_Model_By_Ref(this.user, this._public, {
          fire_ref: this.fire_ref.child('users/public'),
          ref_obs_id: this.user_id
        });
        Fire_Model_By_Ref(this.user, this._private, {
          fire_ref: this.fire_ref.child('users/private'),
          ref_obs_id: this.user_id
        });
        this._defaults = ko.fireObservable(null, {
          fire_ref: this.fire_ref.child('users/defaults'),
          read_once: true,
          read_only: true
        });
      }

      Fire_Auth.prototype.Create_User = function(info) {
        this.fire_ref.createUser({
          email: info.email,
          password: info.password
        }, (function(_this) {
          return function(error, userData) {
            var fire_ref;
            fire_ref = _this.fire_ref;
            return _this._defaults.Once_Loaded(function(defaults) {
              fire_ref.child('users/public').child(userData.uid).update(defaults["public"]);
              fire_ref.child('users/private').child(userData.uid).update(defaults["private"]);
              if (info.new_public) {
                fire_ref.child('users/public').child(userData.uid).update(info.new_public);
              }
              if (info.new_private) {
                fire_ref.child('users/private').child(userData.uid).update(info.new_private);
              }
            });
          };
        })(this));
      };

      Fire_Auth.prototype.Login = function(credentials) {
        return this.fire_ref.authWithPassword(credentials, (function(_this) {
          return function(error, authData) {
            if (error) {
              return console.error("Login Failed!", error);
            } else {

            }
          };
        })(this));
      };

      Fire_Auth.prototype.Logout = function() {};

      Fire_Auth.prototype.Change_User_Type = function() {};

      Fire_Auth.prototype.Change_User = function() {};

      Fire_Auth.prototype.Recover_Password = function() {};

      Fire_Auth.prototype._Auth_Monitor = function(authData) {
        var key, _results;
        if (authData) {
          this.user_id(authData.uid);
          return this._defaults.Once_Loaded((function(_this) {
            return function(defaults) {
              var key, value, _ref, _ref1;
              _ref = defaults["private"];
              for (key in _ref) {
                value = _ref[key];
                if (_this.user[key] && _this.user[key]() === null) {
                  _this.user[key](value);
                }
              }
              _ref1 = defaults["public"];
              for (key in _ref1) {
                value = _ref1[key];
                if (_this.user[key] && _this.user[key]() === null) {
                  _this.user[key](value);
                }
              }
            };
          })(this));
        } else {
          this.user_id(null);
          _results = [];
          for (key in this.user) {
            _results.push(this.user[key](null));
          }
          return _results;
        }
      };

      return Fire_Auth;

    })();
  });

}).call(this);
