/*  run sequence does not work properly
*   as of 12/1/15 it seems to run the tasks
*   in parallel as opposed to in series (sequence) ...ironic...
*
*
*
* */

/*

Here is what I tried to do but turns out it does not work

"devDependencies": {
    "del": "^2.1.0",
    "gulp": "^3.9.0",
    "gulp-inject": "^3.0.0",
    "run-sequence": "^1.1.5"
 }*/

var gulp = require('gulp'),
    del = require('del'),
    runSequence = require('run-sequence'),
    inject = require('gulp-inject'),
    serve = require('gulp-serve'),
    jshint = require('gulp-jshint'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    connect_live = require('connect-livereload'),
    livereload = require('gulp-livereload'),
    express_server = require('gulp-express');

function startExpress(){
    var express = require('express');
    var app = express();
    app.use(connect_live());
    app.use(express.static('build'));
    app.listen(4000);
};

var lr;
function startLivereload(event){
    lr = require('tiny-lr')();
    lr.listen(35729);
};

function notifyLivereload(event){
    var fileName = require('path').relative('build', event.path);

    lr.changed({
        body: {
            files: [fileName]
        }
    });
};

var files = require('./gulp/gulp.config.js');
var live_options = {
    port: 3000,
    host:'localhost'
};

gulp.task('default', function(callback){
    runSequence('build','watch','serve-express', callback);
});

gulp.task('build', function(callback){
    runSequence('clean','copy-build','index',callback);
});


gulp.task('clean', function(callback){
    del([files.build_dir], {force: true}, callback);
});

/*gulp.task('serve', serve('build'));*/
gulp.task('serve-express', function(){
    startExpress();
    startLivereload();
});

gulp.task('index', function(){
    return gulp.src('./src/index.html')
        .pipe(inject(gulp.src(files.app_files.tpl_src), {ignorePath:'build'}))
        .pipe(gulp.dest(files.build_dir));
});
gulp.task('copy-build', ['copy-assets', 'copy-app-js', 'copy-html', 'copy-data', 'copy-vendor-js','less']);

gulp.task('copy-assets', function(){
    return gulp.src('./src/assets/**/*')
        .pipe(gulp.dest('./build/assets'));
});
gulp.task('copy-app-js', function(){
    return gulp.src('./src/**/**/*.js')
        .pipe(gulp.dest(files.build_dir));
});
gulp.task('copy-html', function(){
    return gulp.src('./src/**/**/*.html')
        .pipe(gulp.dest(files.build_dir));
});
gulp.task('copy-data', function(){
    return gulp.src('./src/**/**/*.json')
        .pipe(gulp.dest(files.build_dir));
});
gulp.task('copy-vendor-js', function(){
    return gulp.src('./vendor/**/*.js')
        .pipe(gulp.dest('./build/vendor'));
});

gulp.task('lint', function(){
    return gulp.src(files.app_files.js)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('less', function(){
    return gulp.src('./src/less/main.less')
        .pipe(less({
            compile:true,
            compress:false,
            noUnderscores:false,
            noIDs:false,
            zeroUnits:false
        }))
        .pipe(rename('main_gen_egg.css'))
        .pipe(gulp.dest('./build/assets/css'));
});


gulp.task('watch', function(){

    gulp.watch(files.app_files.js, ['lint','copy-app-js']); //Active lint for JS files
    gulp.watch(files.app_files.less, ['less']); //Trigger for less file changes
    gulp.watch(files.app_files.html, ['index','copy-html']);
    gulp.watch(files.app_files.tpl_src, notifyLivereload); //Trigger for HTML file changes
});