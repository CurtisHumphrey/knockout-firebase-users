define (require) ->
  ko         = require 'knockout'
  
  require 'knockout_firebase'

  Firebase = require 'firebase'


  class Fire_Auth_Class
    constructor: () ->
      @user = {}

      @user_id = ko.observable()

      @valid = ko.pureComputed => Boolean @user_id()
      @checking = ko.observable false

      @error = ko.observable ''

      @reset_requested = ko.fireObservable false, 
        read_once: true
        read_only: true  

    Setup: (options) =>
      @fire_ref = options.fire_ref

      public_keys = options.public ? {}
      private_keys = options.private ? {}
      #always expect email on private
      private_keys.email ?= null

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
        email = email.replace('.','')
        @reset_requested.Change_Fire_Ref @fire_ref.child('users/resets/' + email)

      @_defaults = ko.fireObservable null, 
        fire_ref: @fire_ref.child('users/defaults')
        read_once: true
        read_only: true

      @fire_ref.onAuth @_Auth_Monitor

    Create_User: (info, callback) =>
      info.new_private ?= {}
      info.new_private.email ?= info.email #force this condition

      @fire_ref.createUser
        email: info.email
        password: info.password
      , (error, userData) =>
        if error or not userData?
          @error error
          console.error error 
          return
        fire_ref = @fire_ref

        #setup defaults
        @_defaults.Once_Loaded (defaults) =>
          if defaults?.public?
            fire_ref.child('users/public').child(userData.uid)
              .update defaults.public

          if defaults?.private?
            fire_ref.child('users/private').child(userData.uid)
              .update defaults.private

          if info.new_public
            fire_ref.child('users/public').child(userData.uid)
              .update info.new_public

          if info.new_private
            fire_ref.child('users/private').child(userData.uid)
              .update info.new_private

          return

        callback? userData
      return

    Login: (credentials) =>
      @checking true
      @fire_ref.authWithPassword ko.toJS(credentials), (error, authData) =>
        @checking false
        if error
          @error error
          console.error "Login Failed!", error
        else
          @error ''
          #Auth_Monitor should handle this

    Logout: =>
      @fire_ref.unauth()

    Recover_Password: (email) =>
      @fire_ref.resetPassword
        email: email
      , (error) =>
        unless error
          email = email.replace('.','')
          @fire_ref.child('users/resets').child email
            .set Firebase.ServerValue.TIMESTAMP

    _Auth_Monitor: (authData) =>
      if authData
        @user_id authData.uid

        @_defaults.Once_Loaded (defaults) =>
          for key, value of defaults?.private
            if @user[key] and @user[key]() is null
              @user[key] value

          for key, value of defaults?.public
            if @user[key] and @user[key]() is null
              @user[key] value
          return
      else
        @user_id null
        @user[key] null for key of @user

