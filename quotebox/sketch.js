var d = {
	puzzles: []
}
var FG = 250;
var BG = 50;
var w = 0;
var bs = 0;
var p = {};
var curKey = 0;
var dirty = false;
var stimer = 0;
var pidx = 0;

function preload() {
	//print("preloading font");
  fontReg = loadFont('miso.otf');
}

function setup() {
  createCanvas(windowWidth-20, calcCanvasHeight());
  load();
  textFont(fontReg);
  setSizes();
  frameRate(15);
}

function load() {
  var stored = localStorage.getItem("quotebox")
  if (!stored) {
  	print("Nothing is stored - getting via xhr");
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/puzzles.json');
		xhr.onload = function() {
	    if (xhr.status === 200) {
  			print("got puzzles from server");
	    	d.puzzles = JSON.parse(xhr.responseText);
	    	pidx = 0;
	    	localStorage.setItem("quotebox", JSON.stringify(d));
	    }
	    else {
	      alert('Request failed.  Returned status of ' + xhr.status);
	    }
		};
		xhr.send();
  } else {
  	d = JSON.parse(stored);
  	print("got locally stored puzzles");
  }
  var curPuzzleIdx = localStorage.getItem("quotebox_pidx");
  if (!curPuzzleIdx) {
  	pidx = 0;
  	savePuzzleIndex();
  } else {
  	pidx = parseInt(curPuzzleIdx);
  }

  loadPuzzle();
}

function savePuzzleIndex() {
  localStorage.setItem("quotebox_pidx", pidx);	
}

function saveCurrent() {
	if (!p) return;
	var key = "quotebox_"+p.id;
	localStorage.setItem(key, JSON.stringify(p));
	stimer = 0;
	dirty = false;
	print("saved "+key);	
}

function saveCurrentIfNeeded() {
	if (!p) return;
	if (!dirty) return;
	stimer++;
	if (stimer > 60) {
		saveCurrent();
	}
}

function draw() {
  background(255);
  drawPuzzleFrame();
  drawPuzzleTitle();
  drawPuzzleLetters();
  drawButtons();
  saveCurrentIfNeeded();
}

function drawPuzzleFrame() {
	var yo = 8 + bs;
	var xo = (windowWidth - w) / 2;
	var rc = p.rc;
	strokeWeight(1);
	stroke(BG);
	fill(FG);
	noFill();
	for (var xx=0; xx<22; xx++) {
		rect(xo+(xx*bs), yo, bs, bs * rc);
	}
	yo += rc * bs;
	for (var yy=0; yy<rc; yy++) {
		for (var xx=0; xx<22; xx++) {
			var idx = (yy * 22) + xx;
			if (p.grid[idx] != '*') {
				fill(245);					
			} else {
				fill(51);
			}
			rect(xo+(xx*bs), yo+(yy*bs), bs, bs);
		}
	}
	// cursor
	fill(255, 255, 128);
	rect(xo+(p.cur.x*bs), yo+(p.cur.y*bs), bs, bs);
	fill(190, 190, 255);
	for (var i=0; i<p.hl.length; i++) {
		rect(xo+(p.hl[i].x*bs), yo+(p.hl[i].y*bs), bs, bs);
	}

	strokeWeight(3);
	noFill();
	rect(xo, 8+bs, bs*22, bs*rc);
	rect(xo, (8+bs)+(rc*bs), bs*22, bs*rc);
}

function drawPuzzleTitle() {
	var yo = bs;
	var xo = (windowWidth - w) / 2;
  textAlign(LEFT);
	textSize(bs * 0.8);
	fill(1);
	noStroke();
	text(p.id+". "+p.author, xo+bs, yo);
	textAlign(RIGHT);
	text("["+p.status+"]", xo+(21 * bs), yo);
}

function statusChar() {
	return "\u2713";
}

function drawPuzzleLetters() {
	var yo = 8 + bs;
	var xo = (windowWidth - w) / 2;
	var rc = p.rc;
  textAlign(CENTER);
	textSize(bs);
	fill(0);
	noStroke();
	for (var xx=0; xx<22; xx++) {
		var lets = p.slots[xx];
		for (var yy=0; yy<lets.length; yy++) {
			//print(line);
			if (lets[yy].l != ' ') {
				if (lets[yy].used) {
					fill(220);
				} else {
					fill(0);
				}
				text(lets[yy].l, xo + (bs * xx) + (bs / 2), yo + (bs * (yy+1)) - (bs * 0.2));
			}
		}
	}
	fill(0);
	yo += rc * bs;
	for (var i=0; i<p.grid.length; i++) {
		if (p.grid[i] != '*') {
			var xx = i % 22;
			var yy = floor(i / 22);
			text(p.grid[i], xo + (bs * xx) + (bs / 2), yo + (bs * (yy+1)) - (bs * 0.2));
		}
	}
}

function drawButtons() {
	var rc = p.rc;
	//var yo = 8 + (13.5 * bs);
	var yo = 8;
	var xo = (windowWidth - w) / 2;
	var margin = bs * 0.1;
	fill(BG);
	stroke(FG);
	strokeWeight(1);
	rect(xo+margin, yo+margin, bs - (2 * margin), bs - (2*margin));
	rect(xo+(21*bs)+margin, yo+margin, bs - (2 * margin), bs - (2*margin));
  textAlign(CENTER);
	textSize(bs * 0.8);
	fill(FG);
	noStroke();
	text("<", xo+(0.5*bs), yo+(0.75*bs));
	text(">", xo+(21.5*bs), yo+(0.75*bs));
}

function hightlightWord() {
	var hl = [];
	var idx = (p.cur.y * 22) + p.cur.x;
	var pidx = idx-1;
	while (letAt(pidx) != "*") {
		hl.push({x: (pidx % 22), y: floor(pidx / 22)})
		pidx--;
	}
	pidx = idx+1;
	while (letAt(pidx) != "*") {
		hl.push({x: (pidx % 22), y: floor(pidx / 22)})
		pidx++;
	}
	p.hl = hl;
}

function letAt(idx) {
	if (idx < 0 || idx >= p.grid.length) return "*";
	return p.grid[idx];
}

function letAtXY(x, y) {
	if (x < 0 || y < 0) return "*";
	return letAt((y * 22) + x);
}

function windowResized() {
	//print("window resized to "+windowWidth+", "+windowHeight);
  resizeCanvas(windowWidth-20, calcCanvasHeight());
  setSizes();
}

function loadPuzzle() {
	var bp = d.puzzles[pidx];
	var key = "quotebox_"+(pidx+1);
	var ps = localStorage.getItem(key);
	if (!ps) {
		print(key+" not found in storage - creating");
		p = {id: bp.id, author: bp.author};
	} else {
		print("found "+key+" in storage");
		p = JSON.parse(ps);
	}
	if (!p.grid) {
		p.rc = bp.rows.length;
		p.cur = {x: 0, y: 0};
		p.hl = [];
		var g = [];
		for (var y=0; y<p.rc; y++) {
			for (var x=0; x<22; x++) {
				var let = bp.rows[y][x];
				if (let == ' ') {
					g.push("*");
				} else {
					g.push(" ");
				}
			}
		}
		p.grid = g;
	}
	if (!p.answer) {
		var a = [];
		for (var y=0; y<p.rc; y++) {
			for (var x=0; x<22; x++) {
				var let = bp.rows[y][x];
				if (let == ' ') {
					a.push("*");
				} else {
					a.push(let.toUpperCase());
				}
			}
		}
		p.answer = a;		
	}
	if (!p.slots) {
		var s = [];
		for (var x=0; x<22; x++) {
			var ss = [];
			for (var y=0; y<bp.cols[x].length; y++) {
				if (bp.cols[x][y] != ' ') {
					ss.push({l: bp.cols[x][y], used: false});
				}
			}
			s.push(ss);
		}
		p.slots = s;
	}
	//print(JSON.stringify(p));
	p.status = getStatus();
	print(charArrayToString(p.grid))
	print(charArrayToString(p.answer))
	hightlightWord();
	dirty = false;
}

function calcBoxSize() {
	var ww = windowWidth-48;
	if (ww > 1056) ww = 1056;
	return ww / 22;
}

function calcCanvasHeight() {
	var b = calcBoxSize();
	return 16 + (13 * b);
}

function setSizes() {
	w = windowWidth-48;
	if (w > 1056) w = 1056;
	bs = w / 22;
	textSize(bs);
}

function slotHasLetter(x, l) {
	var slot = p.slots[x];
	var ll = l.toUpperCase();
	for (var i=0; i<slot.length; i++) {
		if (!slot[i].used && slot[i].l == ll) {
			slot[i].used = true;
			dirty = true;
			return true;
		}
	}
	return false;
}

function returnLetterToSlot(x, l) {
	var slot = p.slots[x];
	var ll = l.toUpperCase();
	for (var i=0; i<slot.length; i++) {
		if (slot[i].used && slot[i].l == ll) {
			slot[i].used = false;
			dirty = true;
			return;
		}
	}
}

function keyTyped() {
	if (key == ' ') {
		var idx = ((p.cur.y * 22) + p.cur.x);
		var oldLet = p.grid[idx];
		if (oldLet != ' ') {
			returnLetterToSlot(p.cur.x, oldLet);
		}
		p.grid[idx] = key.toUpperCase();
		handleKey(RIGHT_ARROW);
		p.status = getStatus();
	} else if (slotHasLetter(p.cur.x, key)) {
		var idx = ((p.cur.y * 22) + p.cur.x);
		var oldLet = p.grid[idx];
		if (oldLet != ' ') {
			returnLetterToSlot(p.cur.x, oldLet);
		}
		p.grid[idx] = key.toUpperCase();
		handleKey(RIGHT_ARROW);
		p.status = getStatus();
	}
}

function keyPressed() {
	print("keyCode: "+keyCode);
	handleKey(keyCode);
}

function handleKey(k) {
	var changed = false;
	if (k == UP_ARROW) {
		if (letAtXY(p.cur.x, p.cur.y-1) != "*") {
			p.cur.y = p.cur.y-1;
			changed = true;
		}
	} else if (k == DOWN_ARROW) {
		if (letAtXY(p.cur.x, p.cur.y+1) != "*") {
			p.cur.y = p.cur.y+1;
			changed = true;
		}
	} else if (k == LEFT_ARROW) {
		var idx = ((p.cur.y * 22) + p.cur.x);
		if (idx > 0) {
			var pidx = idx-1;
			while (pidx > 0 && letAt(pidx) == '*') {
				pidx--;
			}
			p.cur = {x: (pidx % 22), y: floor(pidx / 22)};
			changed = true;
		}
	} else if (k == RIGHT_ARROW) {
		var idx = ((p.cur.y * 22) + p.cur.x);
		if (idx < p.grid.length) {
			var pidx = idx+1;
			while (pidx < p.grid.length && letAt(pidx) == '*') {
				pidx++;
			}
			if (pidx < p.grid.length){
				p.cur = {x: (pidx % 22), y: floor(pidx / 22)};
				changed = true;
			}
		}
	} else if (k == BACKSPACE) {
		var idx = ((p.cur.y * 22) + p.cur.x);
		var oldLet = p.grid[idx];
		if (oldLet != ' ') {
			returnLetterToSlot(p.cur.x, oldLet);
			p.grid[idx] = ' ';
		}
		if (idx > 0) {
			var pidx = idx-1;
			while (pidx > 0 && letAt(pidx) == '*') {
				pidx--;
			}
			p.cur = {x: (pidx % 22), y: floor(pidx / 22)};
			changed = true;
		}
	} else if (k == 33) {
		doBack();
	} else if (k == 34) {
		doNext();
	}
	if (changed) {
		hightlightWord();
	}
}

function mouseClicked() {
	// where the mouse is
	var mx = mouseX;
	var my = mouseY;

	if (handleGridClick(mx, my)) {
		hightlightWord(handleButtonClick(mx, my));		
	} else if (handleButtonClick(mx, my)) {
		savePuzzleIndex();
	}
}

function doBack() {
	if (pidx > 0) {
		saveCurrent();
		pidx--;
		loadPuzzle();
		return true;
	} else {
		return false;
	}
}

function doNext() {
	if (pidx < (d.puzzles.length-1)) {
		saveCurrent();
		pidx++;
		loadPuzzle();
		return true;
	} else {
		return false;
	}
}

function handleButtonClick(mx, my) {
	// the upper-left corner of the button row
	var rc = p.rc;
	var yo = 8;
	var xo = (windowWidth - w) / 2;

	// make mouse pos relative to corner
	var mmx = mx - xo;
	var mmy = my - yo;
	if (mmx >= 0 && mmx <= bs && mmy >= 0 && mmy <= bs) {
		// back button
		return doBack();
	} else if (mmx >= (bs * 21) && mmx <= (bs * 22) && mmy >= 0 && mmy <= bs) {
		// next button
		return doNext();
	}
	return false;
}

function handleGridClick(mx, my) {
	// the upper-left corner of the letter grid
	var rc = p.rc;
	var yo = 8 + bs + (rc * bs);
	var xo = (windowWidth - w) / 2;

	// make mouse pos relative to corner
	var mmx = mx - xo;
	var mmy = my - yo;
	if (mmx < 0 || mmx > (bs * 22) || mmy < 0 || mmy > (bs * rc)) {
		return false;
	}

	// convert to grid coordinates
	var xx = floor(mmx / bs);
	var yy = floor(mmy / bs);

	// change cursor pos if needed
	if (xx != p.cur.x || yy != p.cur.y) {
		p.cur = {x: xx, y: yy};
	}
	return true;	
}

function charArrayToString(ca) {
	var s = ""
	for (var i=0; i<ca.length; i++) {
		s += ca[i];
	}
	return s;
}

function getStatus() {
	if (!p) return "ERROR";
	for (var i=0; i<p.grid.length; i++) {
		if (p.grid[i] == ' ') return "INCOMPLETE";
	}
	var test = charArrayToString(p.grid);
	var answer = charArrayToString(p.answer);
	if (test == answer) {
		return "COMPLETE";
	} else {
		return "INCORRECT";
	}

}
