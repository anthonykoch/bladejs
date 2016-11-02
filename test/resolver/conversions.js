'use strict';

const test = require('tape');
const path = require('path');

const { viewPathToFile, toViewPath } = require('../../lib/utils');

test('resolver.viewPathToFile - throws if either is not a string or baseDir is not absolute',
	(assert) => {

	assert.throws(() =>
			viewPathToFile('', 'C:/views'),
			/path can not be zero-length/,
			'zero-length filename throws error');

	assert.throws(() =>
			viewPathToFile('layouts', ''),
			/baseDir is not an absolute path/,
			'zero-length baseDir');

	assert.throws(() =>
			viewPathToFile('layouts', 'views/layouts'),
			/baseDir is not an absolute path/,
			'(posix) non-absolute baseDir throws error');

	assert.throws(() =>
			viewPathToFile('layouts', 'views\\layouts'),
			/baseDir is not an absolute path/,
			'(windows) non-absolute baseDir throws error');

	assert.throws(() =>
			viewPathToFile('layouts', 'views\\layouts'),
			/baseDir is not an absolute path/,
			'(windows) non-absolute baseDir throws error');

	assert.end();
});

test('resolver.toViewPath - throws if either argument is not a string or absolute', (assert) => {
	assert.throws(() =>
			toViewPath('', 'C:/views'),
			/filename is not an absolute path/,
			'zero-length filename throws error');

	assert.throws(() =>
			toViewPath('views/layouts', 'C:/views'),
			/filename is not an absolute path/,
			'posix non-absolute filename throws error');

	assert.throws(() =>
			toViewPath('views\\layouts', 'C:/views'),
			/filename is not an absolute path/,
			'windows non-absolute filename throws error');

	assert.throws(() =>
			toViewPath('C:/views', 'C:/views'),
			/filename is not an absolute path/,
			'filename should be path to file');

	assert.throws(() =>
			toViewPath('C:/views/index.blade', 'views/layouts'),
			/baseDir is not an absolute path/,
			'posix non-absolute baseDir throws error');

	assert.throws(() =>
			toViewPath('C:/views/index.blade', 'views\\layouts'),
			/baseDir is not an absolute path/,
			'windows non-absolute baseDir throws error');

	assert.doesNotThrow(() => toViewPath('C:/views/index.blade', 'C:/views'),
		'valid filename and baseDir');

	assert.end();
});

test('resolver.viewPathToFile - (windows) converts a raw path to an absolute file path', (assert) => {
	assert.equals(viewPathToFile('layouts.master', 'C:\\'),
		'C:/layouts/master.blade',
		'single level');

	assert.equals(viewPathToFile('layouts.master', 'C:\\views'),
		'C:/views/layouts/master.blade',
		'nested baseDir');

	assert.equals(viewPathToFile('layouts.master', 'C:\\resources\\views'),
		'C:/resources/views/layouts/master.blade',
		'triple nested baseDir');

	assert.equals(viewPathToFile('layouts.master', 'C:\\website\\resources\\views'),
		'C:/website/resources/views/layouts/master.blade',
		'nested baseDir');

	assert.equals(viewPathToFile('layouts', 'C:\\'),
		'C:/layouts.blade',
		'single level');

	assert.equals(viewPathToFile('layouts', 'C:\\views'),
		'C:/views/layouts.blade',
		'nested baseDir');

	assert.equals(viewPathToFile('layouts', 'C:\\resources\\views'),
		'C:/resources/views/layouts.blade',
		'triple nested baseDir');

	assert.equals(viewPathToFile('layouts', 'C:\\website\\resources\\views'),
		'C:/website/resources/views/layouts.blade',
		'nested baseDir');

	assert.end();
});

test('resolver.viewPathToFile -  should allow path separators', (assert) => {
	assert.equals(viewPathToFile('layouts/master', '/'),
		'/layouts/master.blade',
		'(posix) allows path separator');

	assert.equals(viewPathToFile('layouts\\master', 'C:\\'),
		'C:/layouts/master.blade',
		'(windows) allows path separator');

	assert.equals(viewPathToFile('views.layouts/master', '/'),
		'/views/layouts/master.blade',
		'(posix) allows mixed dot with separator');

	assert.equals(viewPathToFile('views.layouts\\master', 'C:\\'),
		'C:/views/layouts/master.blade',
		'(windows) allows mixed dot with separator');

	assert.end();
});

test('resolver.viewPathToFile - (posix) converts a raw path to an absolute file path', (assert) => {
	assert.equals(viewPathToFile('layouts.master', '/'),
		'/layouts/master.blade',
		'single level');

	assert.equals(viewPathToFile('layouts.master', '/views'),
		'/views/layouts/master.blade',
		'nested baseDir');

	assert.equals(viewPathToFile('layouts.master', '/resources/views'),
		'/resources/views/layouts/master.blade',
		'triple nested baseDir');

	assert.equals(viewPathToFile('layouts.master', '/website/resources/views'),
		'/website/resources/views/layouts/master.blade',
		'nested baseDir');

	assert.equals(viewPathToFile('layouts', '/'),
		'/layouts.blade',
		'single level');

	assert.equals(viewPathToFile('layouts', '/views'),
		'/views/layouts.blade',
		'nested baseDir');

	assert.equals(viewPathToFile('layouts', '/resources/views'),
		'/resources/views/layouts.blade',
		'triple nested baseDir');

	assert.equals(viewPathToFile('layouts', '/website/resources/views'),
		'/website/resources/views/layouts.blade',
		'nested baseDir');

	assert.end();
});

test('resolver.toViewPath - (windows) converts a raw dependency path to absolute file path', (assert) => {
	assert.equals(toViewPath('C:/views/master.blade', 'C:/views'),
			'master',
			'inside baseDir');

	assert.equals(toViewPath('C:/views/pages/index.blade', 'C:/views'),
			'pages.index',
			'inside subdir of baseDir');

	assert.equals(toViewPath('C:/views/partials/users/index.blade', 'C:/views'),
			'partials.users.index',
			'inside nested subdir of baseDir');

	assert.equals(toViewPath('C:/name.blade', 'C:/hello'),
			'../name',
			'relative outside of baseDir');

	assert.end();
});

test('resolver.toViewPath - (posix) converts a raw dependency path to absolute file path', (assert) => {
	assert.equals(toViewPath('/views/master.blade', '/views'),
			'master',
			'inside baseDir');

	assert.equals(toViewPath('/views/pages/index.blade', '/views'),
			'pages.index',
			'inside subdir of baseDir');

	assert.equals(toViewPath('/views/partials/users/index.blade', '/views'),
			'partials.users.index',
			'inside nested subdir of baseDir');

	assert.equals(toViewPath('/name.blade', '/hello'),
			'../name',
			'relative outside of baseDir');

	assert.end();
});
