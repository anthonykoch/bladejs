'use strict';

exports.HANDLERS_NAME     = '$__handlers';
exports.LOCALS_NAME       = '$__locals';
exports.STACKS_NAME       = '$__stacks';
exports.FORLOOP_NAME      = '$__forLoop';
exports.INTERP_NAME       = '$__interp';
exports.HTML_NAME         = '$__html';
exports.PRIVATE_VAR_NAME  = '$__private';
exports.HELPERS_NAME      = '$__helpers';
exports.OPTIONS_NAME      = '$__options';
exports.REFERENCE_NAME    = 'referr';
exports.LOOP_OBJECT_NAME  = 'loop';

exports.LOCAL_EXCLUDES =
	Object.keys(exports)
		.filter((key) => ! (['REFERENCE_NAME', 'LOOP_OBJECT_NAME'].indexOf(key) > -1))
		.map((key) => exports[key]);
