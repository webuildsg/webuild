module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['public/css/style.css']
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.registerTask('default', 'clean');
  grunt.registerTask('travis', 'clean');

};