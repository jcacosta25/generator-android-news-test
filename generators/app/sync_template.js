'use strict';

const path = require('path');
const rimraf = require('rimraf');
const mv = require('mv');
const mkdirp = require('mkdirp');
const clone = require('nodegit').Clone;
const replace = require('replace');
const ncp = require('ncp').ncp;

// Clona el repositorio a './tmp' 

rimraf.sync(path.join(__dirname, '/templates'));
rimraf.sync(path.join(__dirname, '/tmp'));
mkdirp('./templates');

clone('https://github.com/jcacosta25/generator-android-news-test', './tmp')
.then(function (repo) {
	checkOutAndCopy(repo, 'develop');
})
.catch(function (err) {
	console.log(err);
});

function checkOutAndCopy(repo, name) {
	repo.getBranch('refs/remotes/origin/' + name)
	.then(function (reference)	{
		console.log('Checking out branch ' + name);
		return repo.checkoutRef(reference);
	})
	.then(function () {
		replace({
			regex: 'com.bbxmstudios.news',
			replacement: '<%= appPackage &>',
			paths: ['./tmp/app'],
			recursive: true,
			silent: true
		});

		mv('./tmp/.gitignore', './tmp/gitignore', function (err) {
			if (err) {
				console.log(err);
			}
			console.log('Renamed root folder .gitignore');
		});

		mv('./tmp/app/.gitignore', './tmp/app/gitignore', function (err) {
			if (err) {
				console.log(err);
			}
			console.log('Renamed app folder .gitignore');
		});

		console.log('Copying files to ./templates');
		ncp.limit = 1600;
		ncp('./tmp', './templates', function (err) {
			if (err) {
				return console.error(err);
			}
			console.log('Copying complete!');
			rimraf.sync(path.join(__dirname, '/tmp'));
		});
	});
}