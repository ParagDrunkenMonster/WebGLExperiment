var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify');

gulp.task('default', ['smartvizxframework-minify']);

// ---------------------------------------------------------------------------------------
// viviz-minify
// ---------------------------------------------------------------------------------------
var sourceFiles = [ 'dev_scripts/HttpFileLoader.js',
                    'dev_scripts/Settings.js',
                    'dev_scripts/InputHandler.js',
                    'dev_scripts/Math.js',
                    'dev_scripts/Vector3.js',
					'dev_scripts/AABB.js',
                    'dev_scripts/WebGLContext.js',
                    'dev_scripts/Matrix4.js',
                    'dev_scripts/Utils.js',
                    'dev_scripts/Material.js',
                    'dev_scripts/Mesh.js',
                    'dev_scripts/MeshInstance.js',
                    'dev_scripts/BinaryLoader.js',
                    'dev_scripts/Application.js'
                ];

var jsDest = 'scripts';

gulp.task('smartvizxframework-minify', function() {
    return gulp.src(sourceFiles)
		.pipe(gp_concat('SmartVizXFramework.min.js'))
        .pipe(gp_uglify())
        //.pipe(gp_obfuscator())
        .pipe(gulp.dest(jsDest));

});
