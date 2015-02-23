(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define(function(require) {
    var Fire_Auth, Fire_Model_By_Ref, ko;
    ko = require('knockout');
    Fire_Model_By_Ref = require('fire_model_by_ref');
    return Fire_Auth = (function() {
      function Fire_Auth(options) {
        this.Recover_Password = __bind(this.Recover_Password, this);
        this.Change_User = __bind(this.Change_User, this);
        this.Change_User_Type = __bind(this.Change_User_Type, this);
        this.Logout = __bind(this.Logout, this);
        this.Login = __bind(this.Login, this);
        this._Setup_Defaults = __bind(this._Setup_Defaults, this);
        this.Create_User = __bind(this.Create_User, this);
        this.fire_ref = options.fire_ref;
        this.user = {};
        this.user_uid = ko.observable();
      }

      Fire_Auth.prototype.Create_User = function(info) {
        return this.fire_ref.createUser({
          email: info.email,
          password: info.password
        }, (function(_this) {
          return function(error, userData) {
            var new_public;
            _this.user_uid(userData.uid);
            _this.fire_ref.child('users/defaults').once('value', _this._Setup_Defaults);
            new_public = {
              email: info.email
            };
            return Fire_Model_By_Ref(_this.user, new_public, {
              fire_ref: _this.fire_ref.child('users/public'),
              ref_obs_id: _this.user_uid
            });
          };
        })(this));
      };

      Fire_Auth.prototype._Setup_Defaults = function(snapshot) {
        var defaults;
        defaults = snapshot.val();
        Fire_Model_By_Ref(this.user, defaults["public"], {
          fire_ref: this.fire_ref.child('users/public'),
          ref_obs_id: this.user_uid
        });
        return Fire_Model_By_Ref(this.user, defaults["private"], {
          fire_ref: this.fire_ref.child('users/private'),
          ref_obs_id: this.user_uid
        });
      };

      Fire_Auth.prototype.Login = function() {};

      Fire_Auth.prototype.Logout = function() {};

      Fire_Auth.prototype.Change_User_Type = function() {};

      Fire_Auth.prototype.Change_User = function() {};

      Fire_Auth.prototype.Recover_Password = function() {};

      return Fire_Auth;

    })();
  });

}).call(this);
