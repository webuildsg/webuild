module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bump: {
      options: {
        files: ['package.json', 'bower.json', 'public/humans.txt'],
        updateConfigs: [],
        commit: false,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json', 'bower.json', 'public/humans.txt'],
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
          'events/*.js',
          'repos/*.js'
        ]
      }
    },
    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'public/css/style.css': 'public/css/style.sass'
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
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('travis', [
    'clean',
    'sass',
    'uglify',
    'jshint',
    'csslint',
    'jscs'
  ]);

  grunt.registerTask('default', [
    'clean',
    'sass',
    'uglify',
    'jshint',
    'csslint',
    'jscs'
  ]);

};
