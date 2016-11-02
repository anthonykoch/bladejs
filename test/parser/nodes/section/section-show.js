module.exports = {
	type: 'SectionStatement',
	argument: `'content'`,
	appends: false,
	yields: true,
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
	end: 54
};
