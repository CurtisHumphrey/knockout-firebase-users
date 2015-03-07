define (require) ->
  fire_auth = require 'fire_auth'
  fire_admin = require 'fire_admin'

  exports = 
    fire_auth: fire_auth
    fire_admin: fire_admin