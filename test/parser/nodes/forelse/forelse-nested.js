module.exports = {
	type: 'ForElseStatement',
	iterable: '$users',
	binding: '$user',
	line: 1,
	start: 0,
	end: 114,
	depth: 0,
	alternate: {
		type: 'BlockStatement',
		body: []
	},
	consequent: {
		type: 'BlockStatement',
		body: [
			{
				type: 'ForElseStatement',
				iterable: `$stats`,
				binding: '$stat',
				line: 2,
				start: 27,
				end: 95,
				depth: 1,
				alternate: {
					type: 'BlockStatement',
					body: []
				},
				consequent: {
					type: 'BlockStatement',
					body: [
						{
							type: 'TextNode',
							value: `\t\tThat'll be the day.\n`,
							line: 2,
							start: 52,
							end: 76
						}
					]
				},
			},
		]
	},
};

