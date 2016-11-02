module.exports = {
	type: 'IfStatement',
	argument: 'false',
	line: 1,
	start: 0,
	end: 31,
	consequent: {
		type: 'BlockStatement',
		body: [
			{
				type: 'TextNode',
				value: ' if\n',
				line: 1,
				start: 10,
				end: 14
			}
		]
	},
	alternate: {
		type: 'IfStatement',
		argument: null,
		line: 2,
		start: 14,
		end: 25,
		consequent: {
			type: 'BlockStatement',
			body: [
				{
					type: 'TextNode',
					value: 'else\n',
					line: 2,
					start: 20,
					end: 25
				}
			]
		}
	},
};
