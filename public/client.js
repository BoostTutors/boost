document.addEventListener("DOMContentLoaded", function() {
	var mouse = { 
	    click: false,
	    move: false,
	    pos: {x:0, y:0},
	    pos_prev: false
	};
	var settings = {
		strokeWidth: 2, 
		backgroundColor: "#fff",
		undoBtn: "#undo",
		redoBtn: "#redo",
		downloadCanvasLink: "",
	};
	// get canvas element and create context
	var canvas  = document.getElementById('drawing');
	var context = canvas.getContext('2d');
	var width   = window.innerWidth;
	var height  = window.innerHeight;
	var socket  = io.connect();

	// set canvas to full browser width/height
	canvas.width = width;
	canvas.height = height;

	var history = []; 
	var undoHistory = [];
	var currentLine = []; 
	var recording = false; 
	if(settings.backgroundColor) {
			context.fillStyle = settings.backgroundColor;
			context.fillRect(0,0,canvas.width,canvas.height);
		}

	canvas.drawLine = function(data){
		// { line: [ mouse.pos, mouse.pos_prev ] }
		var line = data.line; // use data 
		// var context = canvas.getContext('2d');
		context.beginPath();
		context.lineCap = "round";
		context.moveTo(line[0].x * width, line[0].y * height);
		context.lineTo(line[1].x * width, line[1].y * height);
		context.strokeStyle="red";
		context.stroke();

	};
	// register mouse event handlers
	canvas.onmousedown = function(e){ 
		mouse.click = true; 
		currentLine = []; 
		undoHistory = []; 
		recording = true; // necessary? 
		// $("#undo").removeClass("disabled");

	};
	canvas.onmouseup = function(e){ 
		mouse.click = false; 
		recording = false; // 
		// document.getElementById("undo").removeClass("disabled");
		if(currentLine != null && currentLine.length > 0) {
				history.push(currentLine);
				$("#undo").removeClass("disabled");
				currentLine = [];
			}

	};

	canvas.onmousemove = function(e) { // place socket.emit here 
	    // normalize mouse position to range 0.0 - 1.0
	    mouse.pos.x = e.clientX / width;
	    mouse.pos.y = e.clientY / height;
	    mouse.move = true;

	};

	$(settings.undoBtn).click(function(){
		console.log('undo.clicked');
		// $("#redo").addClass("disabled");
		if (history.length > 0){
			undoHistory.push(history.pop());
			
			for (var i in history){
				for (var j in history[i]){
						canvas.drawLine(history[i][j]);
					}	
			}		
		}
		console.log(history);
		$(settings.redoBtn).removeClass("disabled");
		if(history.length == 0) {
			$(settings.undoBtn).addClass("disabled");
		}
		return false;

	});

	$(settings.redoBtn).click(function(){
		console.log('redo.clicked');
		if (undoHistory.length > 0 ){
			var redoLine = undoHistory.pop(); 
			for (var i in redoLine){
				canvas.drawLine(redoLine[i]);
			}
			history.push(redoLine);
			if (undoHistory.length == 0){
				$(settings.redoBtn).addClass("disabled");
			}
		}
		return false; 
	});

	// draw line received from server
	socket.on('draw_line', function (data) {
		canvas.drawLine(data);

		if (recording){
			currentLine.push(data);
		}

	});
   
	// main loop, every 25ms
	function mainLoop() {
	    // check if the user is drawing
	    var red = "red";
	    if (mouse.click && mouse.move && mouse.pos_prev) {
		// send line to to the server
		socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ]});
		mouse.move = false;
	    }
	    mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
	    setTimeout(mainLoop, 25);
	}
	mainLoop();
    });