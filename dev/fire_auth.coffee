define (require) ->
  ko         = require 'knockout'
  Fire_Model_By_Ref = require 'fire_model_by_ref'
  require 'fire_value'


  class Fire_Auth
    constructor: (options) ->
      @fire_ref = options.fire_ref

      @_public = options.public_keys ? {}
      @_private = options.private_keys ? {}

      @user = {}

      @user_id = ko.observable()

      @valid = ko.pureComputed => Boolean @user_id()

      @fire_ref.onAuth @_Auth_Monitor

      Fire_Model_By_Ref @user, @_public,
        fire_ref: @fire_ref.child('users/public')
        ref_obs_id: @user_id

      Fire_Model_By_Ref @user, @_private,
        fire_ref: @fire_ref.child('users/private')
        ref_obs_id: @user_id

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


    Change_User_Type: =>


    Change_User: =>


    Recover_Password: =>

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
