define (require) ->
  ko           = require 'knockout'
  _            = require 'lodash'
  
  window.ko    = ko
  MockFirebase = require('mockfirebase').MockFirebase
  
  Fire_Auth    = require 'fire_auth'

  describe 'Fire Auth', ->
    fire_ref = null
    fire_auth = null
    credentials = 
      email: "testing@tedchef.com"
      password: "testing"

    beforeEach ->
      fire_ref = new MockFirebase('testing://')
      fire_ref.autoFlush()

      fire_ref.set
        users:
          defaults:
            public:
              picture: "me.png"
            private:
              awaiting_approvial: true
          public:
            u001:
              picture: "user.png"
              display_name: "user"
            u002:
              display_name: "user"
          private:
            u001:
              awaiting_approvial: true
              email: credentials.email
            u002:
              is_admin: true
              email: credentials.email

    describe 'Exports', ->
      beforeEach ->
        fire_auth = new Fire_Auth
          fire_ref: fire_ref
      
      it 'Should have a Login function', ->
        expect _.isFunction fire_auth.Login
          .toBeTruthy()

      it 'Should have a Create_User function', ->
        expect _.isFunction fire_auth.Create_User
          .toBeTruthy()

      it 'Should have a user object', ->
        expect _.isObject fire_auth.user
          .toBeTruthy()

      it 'Should have a user id observable', ->
        expect fire_auth.user_id
          .toBeDefined()

    describe 'User Login', ->
      beforeEach ->
        fire_auth = new Fire_Auth
          fire_ref: fire_ref
          public_keys:
            picture: null
            display_name: null
          private_keys:
            email: null
            awaiting_approvial: null
            is_admin: null

        fire_auth.Login credentials

      it 'Should be able to login a user', ->
        fire_ref.changeAuthState
          uid: 'u001'
          provider: 'password'
          token: 'token'
          expires: Math.floor(new Date() / 1000) + 24 * 60 * 60
          auth: {}

        expect(fire_auth.valid()).toBeTruthy()


      it 'Should load the user\'s data from both public and private locations', ->
        fire_ref.changeAuthState
          uid: 'u001'
          provider: 'password'
          token: 'token'
          expires: Math.floor(new Date() / 1000) + 24 * 60 * 60
          auth: {}

        expect( fire_auth.user.picture()).toEqual "user.png"
        expect( fire_auth.user.awaiting_approvial()).toEqual true

        expect( fire_auth.user.display_name()).toEqual "user"
        expect( fire_auth.user.email()).toEqual credentials.email

      it 'If the user\'s data does not have some of the default values it should add them', ->
        fire_ref.changeAuthState
          uid: 'u002'
          provider: 'password'
          token: 'token'
          expires: Math.floor(new Date() / 1000) + 24 * 60 * 60
          auth: {}

        console.log ko.toJS fire_auth.user

        #has
        expect( fire_auth.user.display_name()).toEqual "user"
        expect( fire_auth.user.is_admin()).toEqual true
        expect( fire_auth.user.email()).toEqual credentials.email

        #added
        expect( fire_auth.user.picture()).toEqual "me.png"
        expect( fire_auth.user.awaiting_approvial()).toEqual true

        expect( fire_ref.child('users/public').child('u002').getData().picture).toEqual "me.png"
        expect( fire_ref.child('users/private').child('u002').getData().awaiting_approvial).toEqual true


    xdescribe 'Log out', ->
      beforeEach ->


      it 'Should be able to logout a user', ->


      it 'Should flag that the user is not authorized', ->


      it 'Should clear the user\'s data', ->

      it 'Should clear the user\'s uid', ->

    xdescribe 'Recover Password', ->


    xdescribe 'Change profile', ->      

    describe 'Creating a User', ->
      beforeEach ->
        fire_auth = new Fire_Auth
          fire_ref: fire_ref

        fire_auth.Create_User
          email: credentials.email
          password: credentials.password
          new_private:
            email: credentials.email
          new_public:
            display_name: 'user'

      it 'Should create a new user', ->
        expect( fire_ref.getEmailUser(credentials.email)).not.toBeNull()

      it 'Should add entries into public list', ->
        uid = fire_ref.getEmailUser(credentials.email).uid

        expect( fire_ref.child('users/public').child(uid).getData()).not.toBeNull()

      it 'Should add entries into private list', ->
        uid = fire_ref.getEmailUser(credentials.email).uid

        expect( fire_ref.child('users/private').child(uid).getData()).not.toBeNull()
      
      it 'Should copy the private defaults into the private', ->
        uid = fire_ref.getEmailUser(credentials.email).uid

        expect( fire_ref.child('users/private').child(uid).getData().awaiting_approvial).toEqual true

      it 'Should copy the public defaults into the public', ->
        uid = fire_ref.getEmailUser(credentials.email).uid
        expect( fire_ref.child('users/public').child(uid).getData().picture).toEqual "me.png"

      it 'Should add to the public profile values passed under the "new_public" object', ->
        uid = fire_ref.getEmailUser(credentials.email).uid
        expect( fire_ref.child('users/public').child(uid).getData().display_name).toEqual "user"

      it 'Should add to the private profile values passed under the "new_private" object', ->
        uid = fire_ref.getEmailUser(credentials.email).uid
        expect( fire_ref.child('users/private').child(uid).getData().email).toEqual credentials.email

   return