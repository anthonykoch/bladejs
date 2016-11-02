module.exports = {
	type: 'IfStatement',
	argument: 'false',
	line: 1,
	start: 0,
	end: 42,
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
		argument: 'false',
		line: 2,
		start: 14,
		end: 36,
		consequent: {
			type: 'BlockStatement',
			body: [
				{
					type: 'TextNode',
					value: ' elseif\n',
					line: 2,
					start: 28,
					end: 36
				}
			]
		}
	},
};
