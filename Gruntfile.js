/*jshint node: true */
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON("package.json"),
		banner: "/*! <%= pkg.name %> - v<%= pkg.version %> - " +
			"* Copyright (c) <%= grunt.template.today('yyyy') %> IOLA and <%= pkg.author.name %>;" +
			" Licensed <%= pkg.license %> */\n",
		// Task configuration.
		uglify: {
			options: {
				banner: "<%= banner %>"
			},
			dist: {
				expand: true,
				flatten: true,
				src: ["jquery.*.js", "!jquery.js"],
				dest: "dist/",
				rename: function(base, path) {
					return base + path.replace(/\.js/, ".min.js");
				}
			}
		},
		jshint: {
			options: grunt.file.readJSON(".jshintrc"),
			gruntfile: {
				src: "Gruntfile.js"
			},
			flot: {
				src: ["jquery.flot*.js"]
			}
		},
		watch: {
			gruntfile: {
				files: "Gruntfile.js",
				tasks: ["jshint:gruntfile"]
			},
			flot: {
				files: "<%= jshint.flot.src %>",
				tasks: ["jshint:flot"]
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-watch");

	// Default task.
	grunt.registerTask("default", ["jshint", "uglify"]);

};
