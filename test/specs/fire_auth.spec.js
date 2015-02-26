(function() {
  define(function(require) {
    var Fire_Auth, Fire_Auth_Class, MockFirebase, ko, _;
    ko = require('knockout');
    _ = require('lodash');
    window.ko = ko;
    MockFirebase = require('mockfirebase').MockFirebase;
    Fire_Auth_Class = require('fire_auth_class');
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
            resets: null,
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
          return fire_auth = Fire_Auth;
        });
        it('Should have a Setup function', function() {
          return expect(_.isFunction(fire_auth.Setup)).toBeTruthy();
        });
        it('Should have a Login function', function() {
          return expect(_.isFunction(fire_auth.Login)).toBeTruthy();
        });
        it('Should have a Logout function', function() {
          return expect(_.isFunction(fire_auth.Logout)).toBeTruthy();
        });
        it('Should have a Recover_Password function', function() {
          return expect(_.isFunction(fire_auth.Recover_Password)).toBeTruthy();
        });
        it('Should have a Create_User function', function() {
          return expect(_.isFunction(fire_auth.Create_User)).toBeTruthy();
        });
        it('Should have a user object', function() {
          return expect(_.isObject(fire_auth.user)).toBeTruthy();
        });
        it('Should have a user_id observable', function() {
          return expect(fire_auth.user_id).toBeDefined();
        });
        it('Should have a valid observable', function() {
          return expect(fire_auth.valid).toBeDefined();
        });
        return it('Should have a reset_requested observable', function() {
          return expect(fire_auth.reset_requested).toBeDefined();
        });
      });
      describe('User Login', function() {
        beforeEach(function() {
          fire_auth = new Fire_Auth_Class();
          fire_auth.Setup({
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
          expect(fire_auth.valid()).toBeTruthy();
          return expect(fire_auth.user_id()).toEqual('u001');
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
        it('If the user\'s data does not have some of the default values it should add them', function() {
          fire_ref.changeAuthState({
            uid: 'u002',
            provider: 'password',
            token: 'token',
            expires: Math.floor(new Date() / 1000) + 24 * 60 * 60,
            auth: {}
          });
          expect(fire_auth.user.display_name()).toEqual("user");
          expect(fire_auth.user.is_admin()).toEqual(true);
          expect(fire_auth.user.email()).toEqual(credentials.email);
          expect(fire_auth.user.picture()).toEqual("me.png");
          expect(fire_auth.user.awaiting_approvial()).toEqual(true);
          expect(fire_ref.child('users/public').child('u002').getData().picture).toEqual("me.png");
          return expect(fire_ref.child('users/private').child('u002').getData().awaiting_approvial).toEqual(true);
        });
        return describe('Log out', function() {
          beforeEach(function() {
            fire_ref.changeAuthState({
              uid: 'u001',
              provider: 'password',
              token: 'token',
              expires: Math.floor(new Date() / 1000) + 24 * 60 * 60,
              auth: {}
            });
            return fire_auth.Logout();
          });
          it('Should be able to logout a user', function() {
            expect(fire_auth.valid()).toBeFalsy();
            return expect(fire_auth.user_id()).toBeFalsy();
          });
          return it('Should clear the user\'s data', function() {
            expect(fire_auth.user.picture()).toEqual(null);
            expect(fire_auth.user.awaiting_approvial()).toEqual(null);
            expect(fire_auth.user.display_name()).toEqual(null);
            return expect(fire_auth.user.email()).toEqual(null);
          });
        });
      });
      describe('Recover Password', function() {
        beforeEach(function() {
          fire_auth = new Fire_Auth_Class();
          fire_auth.Setup({
            fire_ref: fire_ref
          });
          return fire_auth.Create_User({
            email: credentials.email,
            password: credentials.password
          });
        });
        it('Should flag that reset happened in firebase', function() {
          fire_auth.Recover_Password(credentials.email);
          return expect(fire_ref.child('users/resets/' + credentials.email).getData()).toBeTruthy();
        });
        return it('Should flag that a reset happened once they login again', function() {
          fire_auth.Recover_Password(credentials.email);
          fire_auth.Login(credentials);
          fire_ref.changeAuthState({
            uid: 'u001',
            provider: 'password',
            token: 'token',
            expires: Math.floor(new Date() / 1000) + 24 * 60 * 60,
            auth: {}
          });
          return expect(fire_auth.reset_requested()).toBeTruthy();
        });
      });
      return describe('Creating a User', function() {
        beforeEach(function() {
          fire_auth = new Fire_Auth_Class();
          fire_auth.Setup({
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
