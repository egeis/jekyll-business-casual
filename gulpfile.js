var child = require('child_process');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var gulp = require('gulp');
var merge = require('merge-stream');
var pump = require('pump');
var runSequence = require('run-sequence');      // Until Gulp.series is available.
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var util = require('gulp-util');

var config = {
    bootstrapDir: './bower_components/bootstrap-sass',
    publicDir: './public',
    srcDir: './src',
    production: !!util.env.production
};

// Delete Temparay Files
gulp.task('clean', function() {
   var dest = gulp.src([config.publicDir], {read: false})
        .pipe(rimraf());
        
   var gen = gulp.src([config.srcDir+'/temp'], {read: false})
        .pipe(rimraf());
        
    return merge(dest,gen);
});

// Localhost - Liveserver
var localhost = {
    root: config.publicDir,
    livereload: true,
    port: 8080
};

// Start Localhost Server
gulp.task('connect:start', function() {
    connect.server(localhost);
});

// Reload Localhost Server
gulp.task('connect:reload', function()
{
    connect.reload();
});

// Start Watch
gulp.task('watch', function()
{
    gulp.watch(config.srcDir +'/_sass/*.scss', function(){ runSequence('build:css', 'connect:reload'); });
    gulp.watch(config.srcDir + '/_scripts/*.js', function(){ runSequence('build:scripts', 'connect:reload'); });
});

// BUILD CSS
gulp.task('build:css', function() {
    return gulp.src(config.srcDir + '/_sass/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: [config.bootstrapDir + '/assets/stylesheets'],
        }))
        .pipe(concat('main.css'))
        .pipe(config.production ? cleanCSS({compatibility: 'ie8'}) : util.noop() )
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.publicDir + '/assets/css'));
});

// BUILD Fonts
gulp.task('build:fonts', function() {
    return gulp.src(config.bootstrapDir + '/assets/fonts/**/*')
        .pipe(gulp.dest(config.publicDir + '/assets/fonts'));
});

// BUILD Icons
gulp.task('build:icons', function() {
    return gulp.src(config.bowerDir + '/fontawesome/fonts/**.*')
        .pipe(gulp.dest(config.publicDir +'./assets/fonts'));
});

// BUILD Scripts
gulp.task('build:scripts', function()
{
    return gulp.src(config.srcDir + '/_scripts/*.js')
});

// BUILD Jekyll
gulp.task('jekyll', function(gulpCallBack) 
{
    var cmd = "jekyll";
    var flags = ['build', '--config', '_config.yml', '--incremental'];
    
    if(process.platform === "win32")
    {
        cmd = "bundle.bat";
        flags.unshift("exex");
    } 
    
    util.log('Spawning Jekyll with: '+ flags.join(','));
    var jekyll = child.spawn(cmd, flags);
    
    var jekyllLogger = function(buffer)  {
        return buffer.toString()
            .split(/\n/)
            .forEach( function(message) { return util.log('Jekyll: ' + message); } );
    };
    
    jekyll.stdout.on('data', jekyllLogger);
    jekyll.stderr.on('data', jekyllLogger);
});

// DEPLOY to GH-Pages
gulp.task('deploy:ghpages', ['build'], function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});

// Task Groups
gulp.task('build', ['build:css', 'build:fonts', 'build:icons', 'build:scripts']);
gulp.task('debug', ['clean'], function() { runSequence('build', 'connect:start', 'watch'); });