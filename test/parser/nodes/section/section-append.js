module.exports = {
	type: 'SectionStatement',
	argument: `'content'`,
	appends: true,
	yields: false,
	overwrites: false,
	consequent: {
		type: 'BlockStatement',
		body: [
			{
				type: 'TextNode',
				value: '\tThere\'s no place like home.\n',
				line: 1,
				start: 19,
				end: 49
			}
		]
	},
	line: 1,
	start: 0,
	end: 56
};
