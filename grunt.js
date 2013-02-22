module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-clean');
  grunt.initConfig({
    clean: {
      files: ['public/css/style.css']
    }
  });

  grunt.registerTask('default', 'clean');
  grunt.registerTask('travis', 'clean');

};