var versionFiles = [
  'package.json',
  'bower.json',
  'public/humans.txt'
];
var jsFilesToCheck = [
  'Gruntfile.js',
  'app.js',
  'public/js/main.js',
  'archives/**/*.js',
  'countdown/**/*.js',
  'test/archives/*.js'
];

module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bump: {
      options: {
        files: versionFiles,
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: versionFiles,
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'github',
        gitDescribeOptions: '--tags --always --abbrev=1'
      }
    },
    clean: [
      'public/js/script.js'
    ],
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      strict: {
        options: {
          import: 2
        },
        src: [ 'public/css/style.css' ]
      }
    },
    jscs: {
      src: jsFilesToCheck,
      options: {
        config: '.jscsrc'
      }
    },
    jshint: {
      all: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: jsFilesToCheck
      }
    },
    uglify: {
      production: {
        options: {
          mangle: false,
          compress: true,
          beautify: false
        },
        files: {
          'public/js/script.js': [
            'public/js/vendor/moment/min/moment.min.js',
            'public/js/vendor/fluidvids/dist/fluidvids.min.js',
            'public/js/main.js'
          ]
        }
      }
    },
    jsbeautifier: {
      files: [ 'public/js/main.js' ],
      options: {
        config: '.jsbeautifyrc'
      }
    }
  });

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsbeautifier');

  grunt.registerTask('cleanup', 'Remove past events in blacklist and whitelist', function() {
    var cleanup = require('./tasks/cleanup');
    var blacklistEventsFilepath = __dirname  + '/config/blacklistEvents.json';
    var whitelistEventsFilepath =  __dirname  + '/config/whitelistEvents.json';
    var done = this.async();

    cleanup.all(blacklistEventsFilepath, cleanup.getEventsToKeep(blacklistEventsFilepath), function(reply) {
      grunt.log.writeln(reply);
      cleanup.all(whitelistEventsFilepath, cleanup.getEventsToKeep(whitelistEventsFilepath), function(reply) {
        grunt.log.writeln(reply);
        done();
      })
    })
  });

  grunt.registerTask('travis', [
    'clean',
    'jshint',
    'jsbeautifier',
    'jscs',
    'uglify',
    'csslint'
  ]);

  grunt.registerTask('default', [
    'clean',
    'jshint',
    'csslint',
    'jsbeautifier',
    'jscs',
    'uglify'
  ]);

  grunt.registerTask('build', [
    'jsbeautifier',
    'uglify'
  ]);
};
