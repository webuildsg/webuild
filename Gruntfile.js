module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ['public/css/style.css'],

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
            'public/js/vendor/jquery/dist/jquery.min.js',
            'public/js/main.js'
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('travis', ['clean', 'sass', 'uglify']);
  grunt.registerTask('default', ['clean', 'sass', 'uglify']);

};
