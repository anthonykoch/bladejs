module.exports = {
	type: 'ForElseStatement',
	iterable: '$users',
	binding: `user`,
	depth: 0,
	consequent: {
		type: 'IncludeStatement',
		argument: `view.user.index`,
		line: 1,
		start: 6,
		end: 23
	},
	alternate: {
		type: 'IncludeStatement',
		argument: `view.empty`,
		line: 1,
		start: 41,
		end: 53
	},
	line: 1,
	start: 0,
	end: 54
};
