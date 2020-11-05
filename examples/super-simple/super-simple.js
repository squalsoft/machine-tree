
var simple_chart_config = {
	chart: {
		container: "#OrganiseChart-simple"
	},
	
	nodeStructure: {
		text: { name: "Parent node" },
		children: [
			{
				text: { name: "First child" }
			},
			{
				text: { name: "Second child" }
			}
		]
	}
};

// // // // // // // // // // // // // // // // // // // // // // // // 

var config = {
	container: "#OrganiseChart-simple",
	rootOrientation: "WEST"
};

var parent_node = {
	text: { name: "1" }
};

var first_child = {
	parent: parent_node,
	text: { name: "2" }
};

var second_child = {
	parent: parent_node,
	text: { name: "3" }
};

var simple_chart_config = [
	config, parent_node,
		first_child, second_child 
];
