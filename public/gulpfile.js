const gulp = require('gulp');
const webp = require('gulp-webp');
const minify = require('gulp-minify');
const cleanCss = require('gulp-clean-css');

gulp.task('convert-to-webp', function() {
  return gulp.src('img/*.jpg')
      .pipe(webp())
      .pipe(gulp.dest('build/img/'))
});

gulp.task('pack-js', function () {
	return gulp.src(['js/*.js'])
		.pipe(minify({
      	ext:{
      		min:'.js'
      	},
      	noSource: true
      }))
		.pipe(gulp.dest('build/js'));
});

gulp.task('pack-css', function () {
	return gulp.src(['css/*.css'])
		.pipe(cleanCss())
   .pipe(gulp.dest('build/css'));
});

gulp.task('default', ['convert-to-webp', 'pack-js', 'pack-css']);
