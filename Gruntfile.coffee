module.exports = (grunt) ->

  grunt.loadTasks 'tasks'
  grunt.loadNpmTasks 'grunt-contrib-coffee'

  grunt.initConfig
    gss:
      example:
        options:
          # from your Google API key
          clientId: '785010223027.apps.googleusercontent.com'
          clientSecret: 'nwQ2UedRysgbNZl6jE3I77Ji'
          json: true # json or csv
          prettify: true # available if options.json
        files: [
            options:
              mapping: # available if options.json
                col1: 'array'
                col2: 'number'
                col3: 'string'
                col4: 'undefined'
                col5: (val, row) ->
                  # 2d array
                  val.split('|').map (v) -> v.split ','
                colNotExist: (val, row) ->
                  # val is undefined, and since this is the LAST mapping entry,
                  # the row obj passed in has already been converted accordingly
                  # {col1:["1","2"],col2:123,col3:"string",col5:[["1a","1b"],["2a","2b"]]}
                  JSON.stringify row
              wrap: (out) ->
                # grunt.log.error out
                out
            dest: 'test/Sheet1.json'
            src: 'https://docs.google.com/spreadsheets/d/18DpYlL7ey3OTbXnTeDl82wD4ISq6iU2Gv5wCQjJsMuQ/edit#gid=1428256717'
          ,
            options:
              # if false, all other options will be ignored
              json: false
            dest: 'test/Sheet2.csv'
            src: 'https://docs.google.com/spreadsheets/d/18DpYlL7ey3OTbXnTeDl82wD4ISq6iU2Gv5wCQjJsMuQ/edit#gid=1369557937'
        ]

  grunt.registerTask 'default', ['gss']
