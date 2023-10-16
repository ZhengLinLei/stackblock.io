module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                report: 'min',
                mangle: true
            },
            js: {
                files: [{
                    expand: true,
                    src: ['js/**/*.js', '!js/**/*.min.js'],
                    ext: '.min.js'
                }]
            }
        }
    })
}