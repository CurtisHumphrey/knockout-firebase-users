module.exports = (grunt) ->
  # Livereload and connect variables
  LIVERELOAD_PORT = 1338
  lrSnippet = require("connect-livereload")(port: LIVERELOAD_PORT)
  mountFolder = (connect, dir) ->
    connect.static require("path").resolve(dir)

  grunt.initConfig
    connect:
      dev:
        options:
          port: 9002
          hostname: 'localhost',
          middleware: ( connect ) ->
            [lrSnippet, mountFolder(connect, '.')]

    open:
      test:
        path: 'http://localhost:<%= connect.dev.options.port %>/_SpecRunner.html'

    jasmine:
      dev:
        options:
          specs: "test/specs/**/*.js"
          helpers: ["test/helpers/**/*.js"]
          keepRunner: true
          template: require "grunt-template-jasmine-requirejs"
          templateOptions:
            requireConfigFile: "dev/require_config.js"
            requireConfig:
              baseUrl: 'dev'
    
    requirejs:
      compile:
        options:
          baseUrl: 'dev'
          mainConfigFile: 'dev/require_config_build.js'
          out: "dist/knockout_firebase_users.js"
          name: "knockout_firebase_users"
          optimize: 'none'

    exec:
      git:
        cmd: 'START "" "C:\\Program Files\\TortoiseGit\\bin\\TortoiseGitProc.exe" /command:log /path:.'

    coffee:
      compile_tests: 
        expand : true
        cwd     : 'test/specs'
        src    : ['**/*.coffee']
        dest   : 'test/specs'
        ext    : '.spec.js'
      compile_lib: 
        expand : true
        cwd     : 'dev'
        src    : ['**/*.coffee']
        dest   : 'dev'
        ext    : '.js'

    watch:
      configFiles:
        files: ['Gruntfile.coffee']
        options:
          reload: true
      reload_jasmine:
        files: ['test/specs/**/*.js','dev/**/*.js']
        tasks: ['jasmine:dev', 'requirejs']
        options:
          livereload: 1338
      coffee_spec:
        files: ['test/specs/**/*.coffee']
        tasks: ['newer:coffee:compile_tests']
      coffee_lib:
        files: ['dev/**/*.coffee']
        tasks: ['newer:coffee:compile_lib']

  require('time-grunt')(grunt)

  require('load-grunt-tasks')(grunt)
  
  grunt.registerTask 'git', ['exec:git']

  grunt.registerTask 'rerun', ['coffee', 'connect:dev:livereload', 'watch']
  grunt.registerTask 'dev', ['coffee', 'connect:dev:livereload', 'open', 'watch']
  grunt.registerTask 'build', ['coffee','jasmine','requirejs']
  grunt.registerTask 'default', ['git', 'dev']