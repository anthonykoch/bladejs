module.exports = {
	type: 'ForEachStatement',
	iterable: '$users',
	binding: '$user',
	line: 1,
	start: 0,
	end: 99,
	depth: 0,
	alternate: null,
	consequent: {
		type: 'BlockStatement',
		body: [
			{
				type: 'ForEachStatement',
				iterable: `$stats`,
				binding: '$stat',
				line: 2,
				start: 27,
				end: 87,
				depth: 1,
				alternate: null,
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
			}
		]
	},
};

