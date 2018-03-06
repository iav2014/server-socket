/**
 * Created by ariza on 3/8/15.
 */
var gulp   = require('gulp'),
jshint = require('gulp-jshint');

gulp.task('hint', function() {
	gulp.src('./*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('default', ['hint']);
