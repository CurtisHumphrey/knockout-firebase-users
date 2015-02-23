(function() {
  define(function(require) {
    var Fire_Auth, MockFirebase, ko, _;
    ko = require('knockout');
    _ = require('lodash');
    window.ko = ko;
    MockFirebase = require('mockfirebase').MockFirebase;
    Fire_Auth = require('fire_auth');
    describe('Fire Model By Reference', function() {
      var model;
      model = null;
      beforeEach(function() {
        return model = {
          apples: ko.observable(1),
          oranges: ko.observable(2)
        };
      });
      return describe('Creating a User', function() {
        var email, fire_auth, fire_ref;
        fire_ref = null;
        fire_auth = null;
        email = "testing@tedchef.com";
        beforeEach(function() {
          fire_ref = new MockFirebase('testing://');
          fire_ref.autoFlush();
          fire_auth = new Fire_Auth({
            fire_ref: fire_ref
          });
          fire_ref.set({
            users: {
              defaults: {
                "public": {
                  picture: "me.png"
                },
                "private": {
                  attributes: {
                    awaiting_approvial: true
                  }
                }
              },
              "public": null,
              "private": null
            }
          });
          return fire_auth.Create_User({
            email: email,
            password: "testing"
          });
        });
        it('Should create a new user', function() {
          return expect(fire_ref.getEmailUser(email)).not.toBeNull();
        });
        it('Should add entries into public list', function() {
          var uid;
          uid = fire_ref.getEmailUser(email).uid;
          console.log(fire_ref.getData());
          return expect(fire_ref.child('users/public').child(uid).getData()).not.toBeNull();
        });
        it('Should add entries into private list', function() {
          var uid;
          uid = fire_ref.getEmailUser(email).uid;
          return expect(fire_ref.child('users/private').child(uid).getData()).not.toBeNull();
        });
        it('Should copy the private defaults into the private', function() {
          var uid;
          uid = fire_ref.getEmailUser(email).uid;
          return expect(fire_ref.child('users/private').child(uid).getData().attributes.awaiting_approvial).toEqual(true);
        });
        it('Should copy the public defaults into the public', function() {
          var uid;
          uid = fire_ref.getEmailUser(email).uid;
          return expect(fire_ref.child('users/public').child(uid).getData().picture).toEqual("me.png");
        });
        return it('Should add both public and private values to user object', function() {
          expect(fire_auth.user.email()).toEqual(email);
          expect(fire_auth.user.picture()).toEqual("me.png");
          return expect(fire_auth.user.attributes()).toEqual({
            awaiting_approvial: true
          });
        });
      });
    });
  });

}).call(this);
