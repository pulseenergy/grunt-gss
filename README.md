# grunt-gss v1.0.3

> Save your Google Spreadsheets as CSV or JSON.


## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-gss --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-gss');
```

### Overview
Google Spreadsheet could be a simple yet powerful front end for average users to preform management to loads of JSON files.
A handy tool for [CouchDB](http://couchdb.apache.org/#download)-backed apps like [couch-web](https://github.com/h0ward/couch-web).


### Setup API key
1. Go to [API Console](https://code.google.com/apis/console) and create a project
* Turn on **Drive API** in **APIS**
* **Create new client ID** in **Credentials** and setup accordingly:
   Application type: **Web application**
   Authorized Javascript origins: **http://localhost/**
   Authorized redirect URI: **http://localhost:4477/**
* Under **Consent screen**, set **Email address** and **Product name**
* After the ID is created, you will see your `clientId` and `clientSecret`


### Share spreadsheet
1. Check out demo file [here](https://docs.google.com/spreadsheet/ccc?key=0AmPyOqJNrt_SdGlZOVlrc2UzS3FpV1V6Ri1jX0haSlE#gid=1#gid=1).
2. `key` and `gid` could be found in the URL of your spreadsheet
3. Do it as usual under **File > Share**
4. Without proper permission set, you will get a **File not found** error from Google


### Task Options
 1. `clientId` and `clientSecret` are from your Google API key
 * `json` set true to save as JSON, otherwise raw CSV is saved
 * `prettify` works for JSON format only, 2 spaces indention
 * ~~typeDetection apply one of these: parseInt, parseFloat, or split(',')~~ `Removed since v1.0.0`
 * `mapping` an object containing `col:type` mappings. Possible types are:
  * array - `split(",")`
  * number - `parseFloat`
  * string - `toString()`
  * undefined - `delete row[col]`
  * or a callback function accepting `(val, row)` and returning whatever can be parsed by `JSON.parse`
 * `wrap` output string will be passed to this callback and the return will be saved

~~*Note 1: If both typeDetection and typeMapping are true, typeDetection will be executed first, and followed by typeMapping overriding the outcome. That is, value passing totypeMapping callback may not be string.*~~ `Removed since v1.0.0`

~~*Note 2: It a col of typeMapping is not found in the CSV at all, and type is a callback funtion, it will be called with (rowObj), and save to output if return value is not undefined.*~~ `Removed since v1.0.0`


#### The Task
Demo is setup with [this sheets](https://docs.google.com/spreadsheets/d/18DpYlL7ey3OTbXnTeDl82wD4ISq6iU2Gv5wCQjJsMuQ/edit#gid=1369557937).
```coffeescript
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
```

#### Output Sheet1.json
```javascript
[
  {
    "col1": [
      "1",
      "2"
    ],
    "col2": 123,
    "col3": "string",
    "col5": [
      [
        "1a",
        "1b"
      ],
      [
        "2a",
        "2b"
      ]
    ],
    "colNotExist": "{\"col1\":[\"1\",\"2\"],\"col2\":123,\"col3\":\"string\",\"col5\":[[\"1a\",\"1b\"],[\"2a\",\"2b\"]]}"
  },
  {
    "col1": [
      "element1",
      "element2"
    ],
    "col2": 24.777,
    "col3": "string2222",
    "col5": [
      [
        "3",
        "4"
      ]
    ],
    "colNotExist": "{\"col1\":[\"element1\",\"element2\"],\"col2\":24.777,\"col3\":\"string2222\",\"col5\":[[\"3\",\"4\"]]}"
  }
]
```

#### Output Sheet1.json
```csv
col1,col2,col3,col4
234,sheet,yes,no
```


## Release History

 * 2014-08-04   v1.0.3   Migrate to new `googleapis` and refactor
 * 2014-07-24   v0.6.0   Add option "wrap" to process output before save, and [pull request #3](https://github.com/h0ward/grunt-gss/pull/3)
 * 2014-07-19   v0.5.1   Create `col` on the go by `type` callback
 * 2014-07-19   v0.5.0   Add type conversion callback. Remove 2d array support
 * 2014-07-14   v0.4.6   Fetch key & gid from new gss urls, dump more useful log
 * 2014-03-26   v0.4.5   Fix one more bug about deep copy
 * 2014-03-26   v0.4.4   Switch to $.extend for deep copy
 * 2014-03-26   v0.4.3   Fix manual array mapping
 * 2014-03-07   v0.4.2   Add type boolean
 * 2014-02-25   v0.4.1   Add type undefined
 * 2014-02-25   v0.4.0   Add files object array to support options per file
 * 2014-02-04   v0.3.0   Add typeMapping, new option to enforce field type
 * 2014-01-31   v0.2.0   Implement save json, and update options
 * 2014-01-29   v0.1.0   Initial release
