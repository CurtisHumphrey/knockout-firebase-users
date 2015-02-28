(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define(function(require) {
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
          for (key in model) {
            if (key === '_key' || this._all_users[model._key][key]) {
              continue;
            }
            this._all_users[model._key][key] = model[key];
          }
        }
        all_users = [];
        for (key in this._all_users) {
          all_users.push(this._all_users[key]);
        }
        return all_users;
      };

      Fire_Admin.prototype.Get_Users_Data = function() {
        this._all_public = ko.fireList({
          fire_ref: this.fire_ref.child('users/public'),
          keys_inits: {
            picture: "",
            display_name: ""
          }
        });
        this._all_private = ko.fireList({
          fire_ref: this.fire_ref.child('users/private'),
          keys_inits: {
            awaiting_approvial: true,
            is_admin: false,
            email: ""
          }
        });
        this.all_users = ko.computed(this._All_Users_Computed);
        return this.all_users;
      };

      return Fire_Admin;

    })();
  });

}).call(this);
