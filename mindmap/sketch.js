const SCR_WIDTH = 640;
const SCR_HEIGHT = 640;

var fontRegular;
var textEntry = undefined;
var boxes = [];
var dragIdx = -1;

function preload() {
  fontRegular = loadFont('RobotoSlab-Regular.ttf');
	document.addEventListener( "contextmenu", function(e) {
    console.log(e);
    e.preventDefault();
    contextClicked(e.clientX, e.clientY);
  });
}

function setup() {
  createCanvas(SCR_WIDTH, SCR_HEIGHT);
  //randomSeed(142857);
  noFill();
  textSize(12);
  textFont(fontRegular);
}

//function textEntryEvent(e) {
	//console.log('text entry', this.value());
	//console.log('event', e);
//}

function contextClicked(x, y) {
	console.log("got a mouse click");
	if (textEntry) return;
	textEntry = createInput('');
	textEntry.position(x, y);
	//textEntry.input(textEntryEvent);
	textEntry.elt.focus();	
}

function mouseClicked() {
}

function inBox(box, x, y) {
	return (x > box.pos.x && x < (box.pos.x+box.size.w) && y > box.pos.y && y < (box.pos.y+box.size.h));
}

function mousePressed() {
	console.log("mouse pressed");
	for (var i=0; i<boxes.length; i++) {
		if (inBox(boxes[i], mouseX, mouseY)) {
			console.log("in box", i);
			dragIdx = i;
			return;
		}
	}
}

function mouseReleased() {
	console.log("mouse released");
	if (dragIdx >= 0) dragIdx = -1;
}

function mouseDragged() {
	if (dragIdx >= 0) {
		boxes[dragIdx].pos.x = mouseX - (boxes[dragIdx].size.w / 2);
		boxes[dragIdx].pos.y = mouseY - (boxes[dragIdx].size.h / 2);
	}
}

function keyTyped() {
	if (keyCode == 13 && textEntry) {
		var val = textEntry.value();
		var pos = textEntry.position();
		var tw = textWidth(val);
		boxes.push({val: val, pos: pos, size: {w: tw+20, h: 30}});
		textEntry.remove();
		textEntry = undefined;
	} else if (keyCode == 27 && textEntry) {
		textEntry.remove();
		textEntry = undefined;		
	}
}

function drawBox(b) {
	fill(250);
	stroke(180);
	rect(b.pos.x, b.pos.y, b.size.w, b.size.h);
	noStroke();
	fill(100);
	var y = (b.size.h - textAscent()) / 2;
	text(b.val, b.pos.x+10, b.pos.y+(b.size.h-y));	
}

function draw() {
	background(240);
	for (var i=0; i<boxes.length; i++) {
		if (i != dragIdx) {
			drawBox(boxes[i]);			
		}
	}
	if (dragIdx >= 0) {
		drawBox(boxes[dragIdx]);					
	}
}
