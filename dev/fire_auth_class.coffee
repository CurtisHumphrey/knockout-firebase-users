define (require) ->
  ko         = require 'knockout'
  
  require 'fire_model_by_ref'
  require 'fire_value'
  require 'fire_list'

  Firebase = require 'firebase'


  class Fire_Auth_Class
    constructor: () ->
      @user = {}

      @user_id = ko.observable()

      @valid = ko.pureComputed => Boolean @user_id()

      @reset_requested = ko.fireObservable false, 
        read_once: true
        read_only: true  

    Setup: (options) =>
      @fire_ref = options.fire_ref

      public_keys = options.public_keys ? {}
      private_keys = options.private_keys ? {}
      #always expect email on private
      private_keys.email ?= null

      @fire_ref.onAuth @_Auth_Monitor

      ko.fireModelByRef @user, public_keys,
        fire_ref: @fire_ref.child('users/public')
        ref_obs_id: @user_id

      ko.fireModelByRef @user, private_keys,
        fire_ref: @fire_ref.child('users/private')
        ref_obs_id: @user_id

      #changes the reset_requested based on the current email
      @user.email.subscribe (email) =>
        return unless email #nv is an email
        #set default
        @reset_requested false
        #check if exists
        @reset_requested.Change_Fire_Ref @fire_ref.child('users/resets/' + email)

      @_defaults = ko.fireObservable null, 
        fire_ref: @fire_ref.child('users/defaults')
        read_once: true
        read_only: true

    Create_User: (info) =>
      @fire_ref.createUser
        email: info.email
        password: info.password
      , (error, userData) =>
        fire_ref = @fire_ref

        #setup defaults
        @_defaults.Once_Loaded (defaults) =>
          fire_ref.child('users/public').child(userData.uid)
            .update defaults.public

          fire_ref.child('users/private').child(userData.uid)
            .update defaults.private

          if info.new_public
            fire_ref.child('users/public').child(userData.uid)
              .update info.new_public

          if info.new_private
            fire_ref.child('users/private').child(userData.uid)
              .update info.new_private

          return
      return

    Login: (credentials) =>
      @fire_ref.authWithPassword credentials, (error, authData) =>
        if error
          console.error "Login Failed!", error
        else
          #Auth_Monitor should handle this


    Logout: =>
      @fire_ref.unauth()


    Admin_Get_Users: =>



    Recover_Password: (email) =>
      @fire_ref.resetPassword
        email: email
      , (error) =>
        unless error
          @fire_ref.child('users/resets').child email
            .set Firebase.ServerValue.TIMESTAMP


    _Auth_Monitor: (authData) =>
      if authData
        @user_id authData.uid

        @_defaults.Once_Loaded (defaults) =>
          for key, value of defaults.private
            if @user[key] and @user[key]() is null
              @user[key] value

          for key, value of defaults.public
            if @user[key] and @user[key]() is null
              @user[key] value
                 

          return
      else
        @user_id null
        @user[key] null for key of @user
