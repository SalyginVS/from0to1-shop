const {src, dest, parallel, series, watch} = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');

// это не плагин не галпа ставится -  npm i --save-dev del
const del = require('del');
const browserSync = require('browser-sync').create();


const browsersync = () => {
  browserSync.init({
    server: {
      baseDir: "./app"
    }
  });
}

const styles = () => {
  return src('./app/scss/**/*.scss')
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(dest('./app/css/'))
    .pipe(browserSync.stream())
}

const scripts = () => {
  return src(['./node_modules/jquery/dist/jquery.js', '/app/js/**/*.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('./app/js/'))
    .pipe(browserSync.stream())
}

const images = () => {
  return src('./app/images/**/*.*')
      .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
          plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
          ]
        })
      ]))
      .pipe(dest('dist/images'))
}

const build = () => {
  return src([
      'app/**/*.html',
      'app/css/style.min.css',
      'app/js/main.min.js'
  ], {base: './app'})
      .pipe(dest('dist'))
}

const cleanDist = () => {
    return del('dist')
}

const watching = () => {
  watch(['./app/scss/**/*.scss'], styles);
  watch(['./app/js/**/*.js', '!./app/js/main.min.js'], scripts);
  watch(['./app/**/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;

exports.images = images;

exports.build = build;
exports.cleanDist = cleanDist;

exports.default = parallel(styles, scripts, browsersync, watching);

exports.build = series(cleanDist, images, build);