module.exports = {
	type: 'IfStatement',
	argument: 'false',
	line: 1,
	start: 0,
	end: 89,
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
		end: 37,
		consequent: {
			type: 'BlockStatement',
			body: [
				{
					type: 'TextNode',
					value: ' elseif1\n',
					line: 2,
					start: 28,
					end: 37
				}
			]
		},
		alternate: {
			type: 'IfStatement',
			argument: 'false',
			line: 3,
			start: 37,
			end: 60,
			consequent: {
				type: 'BlockStatement',
				body: [
					{
						type: 'TextNode',
						value: ' elseif2\n',
						line: 3,
						start: 51,
						end: 60
					}
				]
			},
			alternate: {
				type: 'IfStatement',
				argument: 'false',
				line: 4,
				start: 60,
				end: 83,
				consequent: {
					type: 'BlockStatement',
					body: [
						{
							type: 'TextNode',
							value: ' elseif3\n',
							line: 4,
							start: 74,
							end: 83
						}
					]
				}
			}
		}
	}
};
