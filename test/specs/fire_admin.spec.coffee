define (require) ->
  ko           = require 'knockout'
  _            = require 'lodash'
  
  window.ko    = ko
  MockFirebase = require('mockfirebase').MockFirebase
  
  Fire_Admin    = require 'fire_admin'

  describe 'Fire Admin', ->
    fire_ref = null
    fire_admin = null

    beforeEach ->
      fire_ref = new MockFirebase('testing://')
      fire_ref.autoFlush()

      fire_ref.set
        users:
          public:
            u001:
              picture: "user1.png"
              display_name: "user1"
            u002:
              picture: "user2.png"
              display_name: "user2"
          private:
            u001:
              awaiting_approvial: true
              is_admin: false
              email: "user1@tedchef.com"
            u002:
              awaiting_approvial: false
              is_admin: true
              email: "user2@tedchef.com"

    describe 'Exports', ->
      beforeEach ->
        fire_admin = new Fire_Admin
          fire_ref: fire_ref
      
      it 'Should have a Get_Users_Data function', ->
        expect _.isFunction fire_admin.Get_Users_Data
          .toBeTruthy()


    describe 'As an admin', ->
      users = null
      beforeEach ->
        fire_admin = new Fire_Admin
          fire_ref: fire_ref
        users = fire_admin.Get_Users_Data()

        console.log users()
        

      it 'Should be able to list all the users', ->
        expect(users().length).toEqual 2

      it 'Each listed user should have both private and public data', ->      
        expect( users()[0].display_name()).toEqual 'user1'
        expect( users()[0].is_admin()).not.toBeTruthy()
        expect( users()[0].email()).toBeTruthy()

        expect( users()[1].display_name()).toEqual 'user2'
        expect( users()[1].is_admin()).toBeTruthy()
        expect( users()[1].email()).toBeTruthy()
      

   
   return