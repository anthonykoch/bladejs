module.exports = {
	type: 'ForElseStatement',
	iterable: '$users',
	binding: '$user',
	line: 1,
	start: 0,
	end: 84,
	depth: 0,
	consequent: {
		type: 'BlockStatement',
		body: [
			{
				type: 'TextNode',
				value: '\tWe have many users\n',
				line: 1,
				start: 25,
				end: 46
			}
		]
	},
	alternate: {
		type: 'BlockStatement',
		body: [
			{
				type: 'TextNode',
				value: '\tThere are no users\n',
				line: 3,
				start: 52,
				end: 73
			}
		]
	},
};
