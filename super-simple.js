// http://fperucic.github.io/treant-js/

let nodes = [];
let mainNodes = [];

let checkNodes =[];
let parentNode = {};


let nodeNumber = -1;
let nodeVal = "";

let editNodeNumber = -1;


$( document ).ready(function() {
	// Создаём главный невидимый узел
	parentNode = {
		text: { 
			name: nodeNumber,
			title: nodeVal
		}
	};
	nodes.push(parentNode);
	nodeNumber++;

	// test
	/*
	let n1 = {
		parent: parentNode,
		childrenDropLevel:0,
		text: { 
			name: 1
		}
	}
	nodes.push(n1);

	let n11 = {
		parent: n1,
		text: { 
			name: 2
		}
	}	
	nodes.push(n11);	

	let n21 = {
		parent: n11,		
		text: { 
			name: 4
		}
	}
	nodes.push(n21);

	let p3 = {
		parent: n1,
		pseudo: true
	}
	nodes.push(p3);
	
	
	let n12 = {
		parent: p3,
		text: { 
			name: 3
		}
	}
	nodes.push(n12);

	drawTree();
	*/

	// Главные параметры
	$("#main-form").submit((event) => {
		event.preventDefault();

		nodeVal = $("#main-param").val();
		let mainNode = {
			pp: parentNode,
			parent: parentNode,
			children: [],
			level: 0, // Уровень вложенности, начиная от главного
			text: { 
				name: nodeNumber,
				title: nodeVal
			}
		};
		nodes.push(mainNode);
		mainNodes.push(mainNode);
		// checkNodes.push(parentNode);
		
		drawTree();
		drawTable();
		nodeNumber++;
		
		$("#main-param").val("");

		//$("#main-form").hide();
		//$("#question-form").show();
		
		//askQuestion();
	});

	
	$("#del-node").click((event) => {
		console.log(editNodeNumber);
		// Удаляем текущий узел и его дочерние
		// А также родительские псевдоузлы
		let curNode = nodes.filter(n => n.text.name == editNodeNumber)[0];
		if(curNode.level == 0)
		{
			// Главные не даём удалять
			$("#dialog").dialog("close");
			return;
		}
		
		delNode(curNode);
		drawTable();
		drawTree();

		$("#dialog").dialog("close");
	});

	function delNode(nodeToDel) {
		// Удаляем текущий
		nodes = nodes.filter(n => n.text.name !== nodeToDel.text.name);

		for(let node of nodeToDel.children) {
			// Удаление дочерних
			delNode(node);
		}

		delPseudoNode(nodeToDel);
	}

	function delPseudoNode(nodeToDel) {
		if(nodeToDel.pp.pseudo) {
			nodes = nodes.filter(n => n != nodeToDel.pp);
			delPseudoNode(nodeToDel.pp);
		}
	}


	$("#add-node").click((event) => {
		let curNode = nodes.filter(n => n.text.name == editNodeNumber)[0];

		// Добавляем новый узел
		let childNode = {
			pp: curNode,
			parent: curNode,
			children: [],
			level: curNode.level + 1,
			text: {
				name: nodeNumber,
				title: $("#new-child").val()
			}
		};	

		curNode.children.push(childNode);
		nodes.push(childNode);	

		drawTable();
		drawTree();

		$("#new-child").val("");
		$("#dialog").dialog("close");
		nodeNumber++;
	});



//======================== Старое
	$("#question-form").submit((event) => {
		event.preventDefault();
		
		nodeVal = $("#question-param").val();

		let childNode = {
			pp: parentNode,
			parent: parentNode,
			text: {
				name: nodeNumber,
				title: nodeVal
			}
		};
	   
		nodes.push(childNode);
		checkNodes.push(childNode);
		
		// Отрисовка и переход к следующему вопросу
		drawTree();
		drawTable();
		askQuestion();
	});

	// Переходим к следующему вопросу
	$("#cancel").click(()=>{
		// Если есть ещё узлы, то переходим к следующему
		if(checkNodes.length > 0){
			parentNode = checkNodes.shift();
			askQuestion();
		} else {
			$("#question-form").hide();
		}
	});
});



function askQuestion() {
	$("#question-label").text(`На что влияет ${parentNode.text.title} (${parentNode.text.name})?`);
	$("#question-param").val("");
	nodeNumber++;
}

function drawTable() {
	// Перерисовка таблицы
	// Очистка
	$(".char-body").empty();
	for(let node of nodes) {
		if(node.text.name === -1){
			continue;
		}
		// Тут рисуем
		$('.char-body').append(`<tr><td>${node.text.name}</td><td>${node.text.title}</td></tr>`);
	}            
}
function drawTree() {
	let config = {
		container: "#OrganiseChart-simple",
		rootOrientation: "NORTH",
		hideRootNode: true,
		connectors: {
			type: "curve" // straight
		}
	};
	
	// let renderNodes = [];
	// Надо рассчитать положение листьев, чтобы они были все в самом низу
	let maxLevel = 0;
	for(let node of nodes) {
		if (node.level > maxLevel) {
			maxLevel = node.level;
		}
	}

	// Добавляем псевдоузлы для листьев, если не добрали до низа
	for(let node of nodes) {
		if(node.text.name != -1 && node.level > 0 && node.children.length == 0) {
			let parentNode = node.pp;
			// Убираем из дочернего текущий узел
			parentNode.children = parentNode.children.filter(c=>c!=node);

			let neededNodes = maxLevel-node.level;
			for(let i=0; i<neededNodes; i++) {
				let pseudoNode = {
					pp: parentNode,
					parent: parentNode,
					pseudo: true,
					children: [],
					text: {
						name: -1
					}
				}				
				parentNode.children.push(pseudoNode);
				nodes.push(pseudoNode);

				parentNode = pseudoNode;
			}

			node.parent = parentNode;
			node.pp = parentNode;
			node.level = maxLevel;
			parentNode.children.push(node);
		}
	}


	for(let node of nodes) {
		
		// let rNode = Object.assign({}, node);
		if(node.pp) {
			//rNode.parent = node.parent;
			node.parent = node.pp;
		}
		// renderNodes.push(rNode );
	}
	
	let simple_chart_config = [
		config, ...nodes
	];

	let chart = new Treant( simple_chart_config, setClickAction, $ );                        
}

// Колбек для добавления дочерних
function setClickAction() {
	$(".node-name").click(function(event) {
		// Номер узла
		let nodeNumber =$(this).text();
		editNodeNumber = parseInt(nodeNumber);
		let curNode = nodes.filter(n=>n.text.name == nodeNumber)[0];
		$("#parent-name").html(curNode.text.name);
		$("#parent-descr").html(curNode.text.title);		
		
		$( "#dialog" ).dialog();
	});
}