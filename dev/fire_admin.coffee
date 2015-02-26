define (require) ->
  ko         = require 'knockout'
  
  require 'fire_list'


  class Fire_Admin
    constructor: (options) ->
      @fire_ref = options.fire_ref

      #used for Get_Users_Data
      @_all_public = null
      @_all_private = null
      @_all_users = {}
      @all_users = null

    _All_Users_Computed: =>
      for model in @_all_public()
        @_all_users[model._key] ?= {}
        for key of model
          continue if key is '_key' or @_all_users[model._key][key]
          @_all_users[model._key][key] = model[key]

      for model in @_all_private()
        @_all_users[model._key] ?= {}
        for key of model
          continue if key is '_key' or @_all_users[model._key][key]
          @_all_users[model._key][key] = model[key]

      all_users = []
      for key of @_all_users
        all_users.push @_all_users[key]

      return all_users

    Get_Users_Data: =>
      @_all_public = ko.fireList
        fire_ref: @fire_ref.child('users/public')
        keys_inits:
          picture: ""
          display_name: ""
      @_all_private = ko.fireList
        fire_ref: @fire_ref.child('users/private')
        keys_inits:
          awaiting_approvial: true
          is_admin: false
          email: ""

      @all_users = ko.computed @_All_Users_Computed

      return @all_users