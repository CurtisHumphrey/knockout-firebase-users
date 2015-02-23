define (require) ->
  ko         = require 'knockout'
  Fire_Model_By_Ref = require 'fire_model_by_ref'


  class Fire_Auth
    constructor: (options) ->
      @fire_ref = options.fire_ref


      @user = {}
      @user_uid = ko.observable()


    Create_User: (info) =>
      @fire_ref.createUser
        email: info.email
        password: info.password
      , (error, userData) =>
        @user_uid userData.uid

        @fire_ref.child('users/defaults').once 'value', @_Setup_Defaults

        new_public =
          email: info.email

        Fire_Model_By_Ref @user, new_public,
          fire_ref: @fire_ref.child('users/public')
          ref_obs_id: @user_uid

    _Setup_Defaults: (snapshot) =>
      defaults = snapshot.val()

      Fire_Model_By_Ref @user, defaults.public,
        fire_ref: @fire_ref.child('users/public')
        ref_obs_id: @user_uid

      Fire_Model_By_Ref @user, defaults.private,
        fire_ref: @fire_ref.child('users/private')
        ref_obs_id: @user_uid

    Login: =>


    Logout: =>


    Change_User_Type: =>


    Change_User: =>


    Recover_Password: =>


