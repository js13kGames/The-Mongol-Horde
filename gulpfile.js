'use strict';

const { dest, parallel, series, src, watch } = require('gulp');
const browserSync = require('browser-sync');
const concat = require('gulp-concat');
const del = require('del');
const fs = require('fs');
const GulpZip = require('gulp-zip');
const hb = require('gulp-hb');
const htmlmin = require('gulp-htmlmin');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const rollupStream = require('rollup-stream');
const terser = require('gulp-terser');
const util = require('gulp-util');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');

/*
* Build steps
*/
function clean() {
  return del('dist/');
}

function js() {
  const options = {
    input: 'src/js/main.js',
    format: 'iife',
    output: { sourcemap: true }
  };
  return rollupStream(options)
    .pipe(source('script.min.js'))
    .pipe(buffer())
    .pipe(terser())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('dist'))
    .pipe(dest('dist'));
  // return src('src/js/**/*.js', { sourcemaps: true })
  //   .pipe(concat('script.min.js'))
  //   .pipe(terser())
  // .pipe(dest('dist/', { sourcemaps: '.' }));
}

function html() {
  return src('src/index.hbs')
    .pipe(hb({ data: {
      js: fs.readFileSync('dist/script.min.js', 'utf-8')
    }}))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(rename({ extname: '.html' }))
    .pipe(dest('dist/'));
}

function assets() {
  return src(['src/assets/**/*', 'src/favicon/*'])
    .pipe(dest('dist/'));
}

/*
* Dist
*/
function zip() {
  return src('dist/index.html')
    .pipe(replace('//# sourceMappingURL=script.min.js.map', ''))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(GulpZip('game.zip'))
    .pipe(dest('dist'));
}

function report(done) {
  fs.stat('dist/game.zip', (err, data) => {
    if (err) {
      return done(err);
    }
    util.log(util.colors.yellow.bold(`Current game size: ${ data.size } bytes`));
    let percent = parseInt( ( data.size / 13312 ) * 100, 10 );
    util.log(util.colors.yellow.bold(`${ percent }% of total game size used`));
    done();
  });
}

/*
* Browsersync
*/
const server = browserSync.create();

function bsServe(done) {
  server.init({
    server: {
      baseDir: 'dist/',
      serveStaticOptions: {
        extensions: ['html']
    }
    },
    open: false
  });
  done();
}

function bsReload(done) {
  server.reload();
  done();
}

function bsWatch() {
  watch('src/assets/**/*', series(assets, zip, report, bsReload));
  watch('src/index.hbs', series(html, zip, report, bsReload));
  watch('src/js/**/*.js', series(js, html, zip, report, bsReload));
}

/*
* Expose tasks to gulp CLI
*/
exports.assets = assets;
exports.clean = clean;
exports.html = html;
exports.js = js;
exports.build = series(clean, parallel(js, assets), html, zip, report);
exports.default = series(exports.build, bsServe, bsWatch);
