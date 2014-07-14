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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['clean', 'shell']);

};
