var gulp = require('gulp'),
	rename = require('gulp-rename'),
	data = require('gulp-data'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	nunjucks = require('gulp-nunjucks'),
	minCss = require('gulp-minify-css'),
	clean = require('gulp-clean'),
	browserSync = require('browser-sync'),
	nodemon = require('gulp-nodemon'),
	path = require('path'),
	express = require('express'),
	fs = require('fs');

gulp.task('nodemon',function(){
	nodemon({
		script:'./server.js',
		ext:'html',
		// tasks:[],
		// ignore: [],
		// env:{
		// 	'NODE_ENV': 'development'
		// }
	}).on('restart',function(){
		console.log('restarted');
	});
})

gulp.task('server',['nodemon'], function(){
	var files = [
		'./src/views/**/*.html',
		'./src/static/**/**/*.*',
		'./*.js'
	];

	browserSync.init({
            port:8030,
            proxy:'http://localhost:8031',
            reloadDelay: 1000,
            notify: false
        });

	gulp.watch(files)
            .on('change',browserSync.reload);
});

// css 压缩 
gulp.task('css', function() {
	var distPath = './dist/static/css';
	var cssFiles = './src/static/css/**/*.css';

	return gulp.src(cssFiles)
		.pipe(minCss())
		// .pipe(rename({suffix:'.min'}))
		.pipe(gulp.dest(distPath));
	
});

// js 压缩  
gulp.task('js', function() {
	var distPath = './dist/static/js';
	var jsFiles = './src/static/js/**/*.js';

	return gulp.src(jsFiles)
		//.pipe(uglify())
		// .pipe(rename({suffix:'.min'}))
		.pipe(gulp.dest(distPath));
});

// ico 拷贝  
gulp.task('ico', function() {
	var distPath = './dist';
	var icoFiles = './src/favicon.ico';

	return gulp.src(icoFiles)
		.pipe(gulp.dest(distPath));
});

gulp.task('img',function(){
	var distPath = './dist/static/img';
	var imgFiles = './src/static/img/**/*.*';

	return gulp.src(imgFiles)
			.pipe(gulp.dest(distPath));
});

gulp.task('font',function(){
	var distPath = './dist/static/fonts';
	var imgFiles = './src/static/fonts/**/*.*';

	return gulp.src(imgFiles)
			.pipe(gulp.dest(distPath));
});

// nunjucks 编译页面
gulp.task('template',function() {
	var pages = ['./src/views/**/*.html',
				 '!./src/views/partials/**/*'
				];
	return gulp.src(pages)
			.pipe(data(() => ({name:"app test"})))
			// .pipe(data(() => require('./src/static/js/data_pro1.js')))
			.pipe(nunjucks.compile())
			.pipe(rename({extname:'.html'}))
			.pipe(gulp.dest('dist'));
});

gulp.task('clean',function(){
	return gulp.src('./dist')
			   .pipe(clean());
});

gulp.task('build',['clean'],function(){
	gulp.start('template','css','js','img','font','ico');
});