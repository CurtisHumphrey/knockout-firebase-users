(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define('fire_auth_class',['require','knockout','knockout_firebase','firebase'],function(require) {
    var Fire_Auth_Class, Firebase, ko;
    ko = require('knockout');
    require('knockout_firebase');
    Firebase = require('firebase');
    return Fire_Auth_Class = (function() {
      function Fire_Auth_Class() {
        this._Auth_Monitor = __bind(this._Auth_Monitor, this);
        this.Recover_Password = __bind(this.Recover_Password, this);
        this.Logout = __bind(this.Logout, this);
        this.Login = __bind(this.Login, this);
        this.Create_User = __bind(this.Create_User, this);
        this.Setup = __bind(this.Setup, this);
        this.user = {};
        this.user_id = ko.observable();
        this.valid = ko.pureComputed((function(_this) {
          return function() {
            return Boolean(_this.user_id());
          };
        })(this));
        this.checking = ko.observable(false);
        this.error = ko.observable('');
        this.reset_requested = ko.fireObservable(false, {
          read_once: true,
          read_only: true
        });
      }

      Fire_Auth_Class.prototype.Setup = function(options) {
        var private_keys, public_keys, _ref, _ref1;
        this.fire_ref = options.fire_ref;
        public_keys = (_ref = options["public"]) != null ? _ref : {};
        private_keys = (_ref1 = options["private"]) != null ? _ref1 : {};
        if (private_keys.email == null) {
          private_keys.email = null;
        }
        ko.fireModelByRef(this.user, public_keys, {
          fire_ref: this.fire_ref.child('users/public'),
          ref_obs_id: this.user_id
        });
        ko.fireModelByRef(this.user, private_keys, {
          fire_ref: this.fire_ref.child('users/private'),
          ref_obs_id: this.user_id
        });
        this.user.email.subscribe((function(_this) {
          return function(email) {
            if (!email) {
              return;
            }
            _this.reset_requested(false);
            email = email.replace('.', '');
            return _this.reset_requested.Change_Fire_Ref(_this.fire_ref.child('users/resets/' + email));
          };
        })(this));
        this._defaults = ko.fireObservable(null, {
          fire_ref: this.fire_ref.child('users/defaults'),
          read_once: true,
          read_only: true
        });
        return this.fire_ref.onAuth(this._Auth_Monitor);
      };

      Fire_Auth_Class.prototype.Create_User = function(info, callback) {
        var _base;
        if (info.new_private == null) {
          info.new_private = {};
        }
        if ((_base = info.new_private).email == null) {
          _base.email = info.email;
        }
        this.fire_ref.createUser({
          email: info.email,
          password: info.password
        }, (function(_this) {
          return function(error, userData) {
            var fire_ref;
            if (error || (userData == null)) {
              _this.error(error);
              console.error(error);
              return;
            }
            fire_ref = _this.fire_ref;
            _this._defaults.Once_Loaded(function(defaults) {
              if ((defaults != null ? defaults["public"] : void 0) != null) {
                fire_ref.child('users/public').child(userData.uid).update(defaults["public"]);
              }
              if ((defaults != null ? defaults["private"] : void 0) != null) {
                fire_ref.child('users/private').child(userData.uid).update(defaults["private"]);
              }
              if (info.new_public) {
                fire_ref.child('users/public').child(userData.uid).update(info.new_public);
              }
              if (info.new_private) {
                fire_ref.child('users/private').child(userData.uid).update(info.new_private);
              }
            });
            return typeof callback === "function" ? callback(userData) : void 0;
          };
        })(this));
      };

      Fire_Auth_Class.prototype.Login = function(credentials) {
        this.checking(true);
        return this.fire_ref.authWithPassword(ko.toJS(credentials), (function(_this) {
          return function(error, authData) {
            _this.checking(false);
            if (error) {
              _this.error(error);
              return console.error("Login Failed!", error);
            } else {
              return _this.error('');
            }
          };
        })(this));
      };

      Fire_Auth_Class.prototype.Logout = function() {
        return this.fire_ref.unauth();
      };

      Fire_Auth_Class.prototype.Recover_Password = function(email) {
        return this.fire_ref.resetPassword({
          email: email
        }, (function(_this) {
          return function(error) {
            if (!error) {
              email = email.replace('.', '');
              return _this.fire_ref.child('users/resets').child(email).set(Firebase.ServerValue.TIMESTAMP);
            }
          };
        })(this));
      };

      Fire_Auth_Class.prototype._Auth_Monitor = function(authData) {
        var key, _results;
        if (authData) {
          this.user_id(authData.uid);
          return this._defaults.Once_Loaded((function(_this) {
            return function(defaults) {
              var key, value, _ref, _ref1;
              _ref = defaults != null ? defaults["private"] : void 0;
              for (key in _ref) {
                value = _ref[key];
                if (_this.user[key] && _this.user[key]() === null) {
                  _this.user[key](value);
                }
              }
              _ref1 = defaults != null ? defaults["public"] : void 0;
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

      return Fire_Auth_Class;

    })();
  });

}).call(this);

(function() {
  define('fire_auth',['require','fire_auth_class'],function(require) {
    var Fire_Auth_Class;
    Fire_Auth_Class = require('fire_auth_class');
    return new Fire_Auth_Class();
  });

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define('fire_admin',['require','knockout','knockout_firebase'],function(require) {
    var Fire_Admin, ko;
    ko = require('knockout');
    require('knockout_firebase');
    return Fire_Admin = (function() {
      function Fire_Admin(options) {
        this.Get_Users_Data = __bind(this.Get_Users_Data, this);
        this._All_Users_Computed = __bind(this._All_Users_Computed, this);
        this.fire_ref = options.fire_ref;
        this._all_public = null;
        this._all_private = null;
        this._all_users = {};
        this.all_users = null;
      }

      Fire_Admin.prototype._All_Users_Computed = function() {
        var all_users, key, model, _base, _base1, _i, _j, _len, _len1, _name, _name1, _ref, _ref1;
        _ref = this._all_public();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          if ((_base = this._all_users)[_name = model._key] == null) {
            _base[_name] = {};
          }
          this._all_users[model._key]._public = true;
          for (key in model) {
            if (key === '_key' || this._all_users[model._key][key]) {
              continue;
            }
            this._all_users[model._key][key] = model[key];
          }
        }
        _ref1 = this._all_private();
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          model = _ref1[_j];
          if ((_base1 = this._all_users)[_name1 = model._key] == null) {
            _base1[_name1] = {};
          }
          this._all_users[model._key]._private = true;
          for (key in model) {
            if (key === '_key' || this._all_users[model._key][key]) {
              continue;
            }
            this._all_users[model._key][key] = model[key];
          }
        }
        all_users = [];
        for (key in this._all_users) {
          if (!(this._all_users[key]._public && this._all_users[key]._private)) {
            continue;
          }
          all_users.push(this._all_users[key]);
        }
        return all_users;
      };

      Fire_Admin.prototype.Get_Users_Data = function(keys_inits) {
        this._all_public = ko.fireList({
          fire_ref: this.fire_ref.child('users/public'),
          keys_inits: keys_inits["public"]
        });
        this._all_private = ko.fireList({
          fire_ref: this.fire_ref.child('users/private'),
          keys_inits: keys_inits["private"]
        });
        this.all_users = ko.computed(this._All_Users_Computed);
        return this.all_users;
      };

      return Fire_Admin;

    })();
  });

}).call(this);

(function() {
  define('knockout_firebase_users',['require','fire_auth','fire_admin'],function(require) {
    var exports, fire_admin, fire_auth;
    fire_auth = require('fire_auth');
    fire_admin = require('fire_admin');
    return exports = {
      fire_auth: fire_auth,
      fire_admin: fire_admin
    };
  });

}).call(this);

