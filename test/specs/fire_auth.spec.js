(function() {
  define(function(require) {
    var Fire_Auth, MockFirebase, ko, _;
    ko = require('knockout');
    _ = require('lodash');
    window.ko = ko;
    MockFirebase = require('mockfirebase').MockFirebase;
    Fire_Auth = require('fire_auth');
    describe('Fire Auth', function() {
      var credentials, fire_auth, fire_ref;
      fire_ref = null;
      fire_auth = null;
      credentials = {
        email: "testing@tedchef.com",
        password: "testing"
      };
      beforeEach(function() {
        fire_ref = new MockFirebase('testing://');
        fire_ref.autoFlush();
        return fire_ref.set({
          users: {
            defaults: {
              "public": {
                picture: "me.png"
              },
              "private": {
                awaiting_approvial: true
              }
            },
            "public": {
              u001: {
                picture: "user.png",
                display_name: "user"
              },
              u002: {
                display_name: "user"
              }
            },
            "private": {
              u001: {
                awaiting_approvial: true,
                email: credentials.email
              },
              u002: {
                is_admin: true,
                email: credentials.email
              }
            }
          }
        });
      });
      describe('Exports', function() {
        beforeEach(function() {
          return fire_auth = new Fire_Auth({
            fire_ref: fire_ref
          });
        });
        it('Should have a Login function', function() {
          return expect(_.isFunction(fire_auth.Login)).toBeTruthy();
        });
        it('Should have a Create_User function', function() {
          return expect(_.isFunction(fire_auth.Create_User)).toBeTruthy();
        });
        it('Should have a user object', function() {
          return expect(_.isObject(fire_auth.user)).toBeTruthy();
        });
        return it('Should have a user id observable', function() {
          return expect(fire_auth.user_id).toBeDefined();
        });
      });
      describe('User Login', function() {
        beforeEach(function() {
          fire_auth = new Fire_Auth({
            fire_ref: fire_ref,
            public_keys: {
              picture: null,
              display_name: null
            },
            private_keys: {
              email: null,
              awaiting_approvial: null,
              is_admin: null
            }
          });
          return fire_auth.Login(credentials);
        });
        it('Should be able to login a user', function() {
          fire_ref.changeAuthState({
            uid: 'u001',
            provider: 'password',
            token: 'token',
            expires: Math.floor(new Date() / 1000) + 24 * 60 * 60,
            auth: {}
          });
          return expect(fire_auth.valid()).toBeTruthy();
        });
        it('Should load the user\'s data from both public and private locations', function() {
          fire_ref.changeAuthState({
            uid: 'u001',
            provider: 'password',
            token: 'token',
            expires: Math.floor(new Date() / 1000) + 24 * 60 * 60,
            auth: {}
          });
          expect(fire_auth.user.picture()).toEqual("user.png");
          expect(fire_auth.user.awaiting_approvial()).toEqual(true);
          expect(fire_auth.user.display_name()).toEqual("user");
          return expect(fire_auth.user.email()).toEqual(credentials.email);
        });
        return it('If the user\'s data does not have some of the default values it should add them', function() {
          fire_ref.changeAuthState({
            uid: 'u002',
            provider: 'password',
            token: 'token',
            expires: Math.floor(new Date() / 1000) + 24 * 60 * 60,
            auth: {}
          });
          console.log(ko.toJS(fire_auth.user));
          expect(fire_auth.user.display_name()).toEqual("user");
          expect(fire_auth.user.is_admin()).toEqual(true);
          expect(fire_auth.user.email()).toEqual(credentials.email);
          expect(fire_auth.user.picture()).toEqual("me.png");
          expect(fire_auth.user.awaiting_approvial()).toEqual(true);
          expect(fire_ref.child('users/public').child('u002').getData().picture).toEqual("me.png");
          return expect(fire_ref.child('users/private').child('u002').getData().awaiting_approvial).toEqual(true);
        });
      });
      xdescribe('Log out', function() {
        beforeEach(function() {});
        it('Should be able to logout a user', function() {});
        it('Should flag that the user is not authorized', function() {});
        it('Should clear the user\'s data', function() {});
        return it('Should clear the user\'s uid', function() {});
      });
      xdescribe('Recover Password', function() {});
      xdescribe('Change profile', function() {});
      return describe('Creating a User', function() {
        beforeEach(function() {
          fire_auth = new Fire_Auth({
            fire_ref: fire_ref
          });
          return fire_auth.Create_User({
            email: credentials.email,
            password: credentials.password,
            new_private: {
              email: credentials.email
            },
            new_public: {
              display_name: 'user'
            }
          });
        });
        it('Should create a new user', function() {
          return expect(fire_ref.getEmailUser(credentials.email)).not.toBeNull();
        });
        it('Should add entries into public list', function() {
          var uid;
          uid = fire_ref.getEmailUser(credentials.email).uid;
          return expect(fire_ref.child('users/public').child(uid).getData()).not.toBeNull();
        });
        it('Should add entries into private list', function() {
          var uid;
          uid = fire_ref.getEmailUser(credentials.email).uid;
          return expect(fire_ref.child('users/private').child(uid).getData()).not.toBeNull();
        });
        it('Should copy the private defaults into the private', function() {
          var uid;
          uid = fire_ref.getEmailUser(credentials.email).uid;
          return expect(fire_ref.child('users/private').child(uid).getData().awaiting_approvial).toEqual(true);
        });
        it('Should copy the public defaults into the public', function() {
          var uid;
          uid = fire_ref.getEmailUser(credentials.email).uid;
          return expect(fire_ref.child('users/public').child(uid).getData().picture).toEqual("me.png");
        });
        it('Should add to the public profile values passed under the "new_public" object', function() {
          var uid;
          uid = fire_ref.getEmailUser(credentials.email).uid;
          return expect(fire_ref.child('users/public').child(uid).getData().display_name).toEqual("user");
        });
        return it('Should add to the private profile values passed under the "new_private" object', function() {
          var uid;
          uid = fire_ref.getEmailUser(credentials.email).uid;
          return expect(fire_ref.child('users/private').child(uid).getData().email).toEqual(credentials.email);
        });
      });
    });
  });

}).call(this);
