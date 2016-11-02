
/**
 * All tags, both opening and ending.
 */

const directives = [
	'yield',

	'section',
	'show',
	'stop',
	'overwrite',
	'append',
	'endsection',

	'parent',

	'extends',

	'if',
	'elseif',
	'else',
	'endif',

	'verbatim',
	'endverbatim',

	'unless',
	'endunless',

	'for',
	'endfor',

	'foreach',
	'endforeach',

	'forelse',
	'empty',
	'endforelse',

	'while',
	'endwhile',

	'continue',
	'break',

	'include',
	'each',

	'push',
	'endpush',

	'stack',
];

/**
 * Tags which denote the end of the preceding block.
 */

const endtags = [
	'show',
	'overwrite',
	'append',
	'stop',
	'endsection',
	'elseif',
	'else',
	'endif',
	'endverbatim',
	'endunless',
	'endfor',
	'endforeach',
	'empty',
	'endforelse',
	'endwhile',
	'endpush',
];

const statements = [
	'YieldStatement',

	'SectionStatement',
	'ShowStatement',
	'ParentStatement',

	'ExtendsStatement',

	'IfStatement',
	'ElseIfStatement',
	'ElseStatement',

	'VerbatimStatement',

	'UnlessStatement',

	'ForStatement',

	'ForEachStatement',

	'ForElseStatement',

	'WhileStatement',

	'ContinueStatement',
	'BreakStatement',

	'IncludeStatement',
	'EachStatement',

	'PushStatement',

	'StackStatement',
];

module.exports = {
	directives,
	endtags,
	statements,
};
