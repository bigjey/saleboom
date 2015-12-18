var gulp          = require('gulp'),
    watch         = require('gulp-watch'),

    uglify        = require('gulp-uglify'),
    concat        = require('gulp-concat'),

    rimraf        = require('gulp-rimraf'),
    
    gulpFilter    = require('gulp-filter'),
    gulpif        = require('gulp-if'),
    
    wiredep       = require('wiredep').stream,
    useref        = require('gulp-useref'),
    
    fileinclude   = require('gulp-file-include')

    sass          = require('gulp-sass'),

    postcss       = require('gulp-postcss'),
    autoprefixer  = require('autoprefixer'),
    mqpacker      = require('css-mqpacker'),


    spritesmith   = require('gulp.spritesmith'),

    merge         = require('merge-stream'),

    browserSync   = require('browser-sync').create(),
    reload        = browserSync.reload;


var path = {
  dev: {
    html: './dev/html/*.html',
    scss: './dev/static/scss/**/*.scss',
    scssIgnore: '!./dev/static/scss/utils/_sprite.scss',
    js: './dev/static/js/**/*.js',
    
    cssFolder: './dev/static/css/',
    wiredepFolder: './dev/html-preview',

    spriteIconFiles: './dev/static/i/icons/*.png',
    spriteCssFolder: './dev/static/scss/utils',
    spriteImageFolder: './dev/static/i',
    spriteCssFile: '_sprite.scss',
    spriteImageFile: '../i/sprite.png'

    /*spriteIconFilesRetina: './dev/static/i/icons/*@2x.png',
    spriteImageFileRetina: 'sprite@2x.png'*/
  },
  build: {
    html: './build/html',
    css: './build/static/css',
    js: './build/static/js',
    img: './build/static/i'
  }
}


gulp.task('clean', function(){
  gulp.src( './build/**/*' )
    .pipe( rimraf() );
})


gulp.task('sprite', function () {
  
  var spriteData = gulp.src( path.dev.spriteIconFiles ).pipe(spritesmith({
    
    imgName: path.dev.spriteImageFile,
    cssName: path.dev.spriteCssFile,

    //retinaSrcFilter: [ path.dev.spriteIconFilesRetina ],
    //retinaImgName: path.dev.spriteImageFileRetina,

    cssVarMap: function (sprite) {
      sprite.name = 'icon-' + sprite.name;
    }

  })); 
  
  var imgStream = spriteData.img
    .pipe(gulp.dest( path.dev.spriteImageFolder)); 
  
  var cssStream = spriteData.css
    .pipe(gulp.dest( path.dev.spriteCssFolder ));
   
  return merge(imgStream, cssStream);

});


gulp.task('bower_build', function(){

  //var assets = useref.assets();
 
  return gulp.src( path.dev.html )
    .pipe( useref() )
    .pipe( gulpif( '*.js', uglify() ) )
    //.pipe( gulpif( '*.css', rebase() ) )
    .pipe( gulpif( '*.css', minifyCss() ) )
    .pipe( gulp.dest( path.build.html ) );

})


gulp.task('html', function () {
  
  gulp.src('./dev/html/partial/*.html')
    .pipe( wiredep() )
    .pipe( gulp.dest( './dev/html/partial' ))

  gulp.src( path.dev.html )    
    .pipe( fileinclude({
      prefix: '@@',
      basepath: '@file'
    }) )    
    .pipe( gulp.dest( path.dev.wiredepFolder ) )
    .pipe( reload({stream: true}) );

});


// var processors = [
//   autoprefixer({browsers: ['last 2 versions'], cascade: false}),
//   mqpacker()
// ];

// .pipe( postcss( processors ) )

gulp.task('css', function(){
  
  return gulp.src( path.dev.scss )
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest( path.dev.cssFolder ))
    .pipe(browserSync.stream());

});


gulp.task('serve', ['html', 'sprite', 'css'], function(){
  
  browserSync.init({
    notify: false,
    server: {
      baseDir: './' ,
      directory: true
    },
  });


  gulp.watch( path.dev.html, ['html']);
  
  gulp.watch( [path.dev.scss, path.dev.scssIgnore], ['sprite', 'css']);
  
  gulp.watch( path.dev.js, function(){
    reload();
  });

  //watch( path.dev.spriteIconFiles, function(){});  

})