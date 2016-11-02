module.exports = {
	type: 'ForEachStatement',
	iterable: '$users',
	binding: '$user',
	depth: 0,
	consequent: {
		type: 'BlockStatement',
		body: [
			{
				type: 'ContinueStatement',
				argument: `$user === 'joe'`,
				line: 1,
				start: 25,
				end: 51
			}
		]
	},
	alternate: null,
	line: 1,
	start: 0,
	end: 62
};
