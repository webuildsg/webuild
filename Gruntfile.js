module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ['public/css/style.css'],

    shell: {
      sass: {
        options: {
          stderr: true
        },
        command: 'sass --compass public/css/style.sass:public/css/style.css --style compressed'
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

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['clean', 'shell', 'uglify']);

};
