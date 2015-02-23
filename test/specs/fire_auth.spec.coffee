define (require) ->
  ko           = require 'knockout'
  _            = require 'lodash'
  
  window.ko    = ko
  MockFirebase = require('mockfirebase').MockFirebase
  
  Fire_Auth    = require 'fire_auth'

  describe 'Fire Model By Reference', ->
    model = null
    beforeEach ->
      model =
        apples: ko.observable 1
        oranges: ko.observable 2

    describe 'Creating a User', ->
      fire_ref = null
      fire_auth = null
      email = "testing@tedchef.com"

      beforeEach ->
        fire_ref = new MockFirebase('testing://')
        fire_ref.autoFlush()

        fire_auth = new Fire_Auth
          fire_ref: fire_ref

        fire_ref.set
          users:
            defaults:
              public:
                picture: "me.png"
              private:
                attributes:
                  awaiting_approvial: true
            public: null
            private: null

        fire_auth.Create_User
          email: email
          password: "testing"

      it 'Should create a new user', ->
        expect( fire_ref.getEmailUser(email)).not.toBeNull()

      it 'Should add entries into public list', ->
        uid = fire_ref.getEmailUser(email).uid

        console.log fire_ref.getData()

        expect( fire_ref.child('users/public').child(uid).getData()).not.toBeNull()

      it 'Should add entries into private list', ->
        uid = fire_ref.getEmailUser(email).uid

        expect( fire_ref.child('users/private').child(uid).getData()).not.toBeNull()
      
      it 'Should copy the private defaults into the private', ->
        uid = fire_ref.getEmailUser(email).uid
        expect( fire_ref.child('users/private').child(uid).getData().attributes.awaiting_approvial).toEqual true

      it 'Should copy the public defaults into the public', ->
        uid = fire_ref.getEmailUser(email).uid
        expect( fire_ref.child('users/public').child(uid).getData().picture).toEqual "me.png"

      it 'Should add both public and private values to user object', ->
        expect( fire_auth.user.email()).toEqual email
        expect( fire_auth.user.picture()).toEqual "me.png"
        expect( fire_auth.user.attributes()).toEqual 
          awaiting_approvial: true

   return