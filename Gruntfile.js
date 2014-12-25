module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bump: {
      options: {
        files: [
          'package.json',
          'bower.json',
          'public/humans.txt'
        ],
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: [
          'package.json',
          'bower.json',
          'public/humans.txt'
        ],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'github',
        gitDescribeOptions: '--tags --always --abbrev=1'
      }
    },
    clean: [
      'public/css/style.css',
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
      src: [
        'Gruntfile.js',
        'public/js/main.js',
        'archives/*.js',
        'events/*.js',
        'repos/*.js'
      ],
      options: {
        config: '.jscsrc'
      }
    },
    jshint: {
      all: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: [
          'Gruntfile.js',
          'public/js/main.js',
          'archives/*.js',
          'events/*.js',
          'repos/*.js'
        ]
      }
    },
    stylus: {
      dist: {
        options: {
          compress: false
        },
        files: {
          'public/css/style.css': 'public/css/style.styl'
        }
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
    }
  });

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('cleanup', 'Remove past events in blacklist and whitelist', function() {
    var cleanup = require('./events/cleanup'),
      blacklistEventsFilepath = __dirname  + '/events/blacklistEvents.json',
      whitelistEventsFilepath =  __dirname  + '/events/whitelistEvents.json',
      done = this.async();

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
    'stylus',
    'uglify',
    'jshint',
    'csslint',
    'jscs'
  ]);

  grunt.registerTask('default', [
    'clean',
    'stylus',
    'uglify',
    'jshint',
    'csslint',
    'jscs'
  ]);

  grunt.registerTask('build', [
    'uglify',
    'stylus'
  ]);

};
