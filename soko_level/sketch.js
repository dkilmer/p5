const SCR_WIDTH = 552;
const SCR_HEIGHT = 636;
const MARGIN = 20;
const PMARGIN = 2;
const IND_SIZE = 20;
const TILE_SIZE = 64;
const PSIZE = TILE_SIZE - (2 * PMARGIN);
const tiles_h = (SCR_WIDTH - (2 * MARGIN)) / TILE_SIZE;
const tiles_v = tiles_h;
//const tiles_v = (SCR_HEIGHT - (2 * MARGIN)) / TILE_SIZE;
const MOVE_FRAMES = 15;
const TEXT_SIZE = 40;

const WALL = 1;
const PLAYER = 2;
const BOX = 3;
const SHELF = 4;

const NONE = 0;
const UP = 1;
const DOWN = 2;
const LEFT = 3;
const RIGHT = 4;

var level;
var fontRegular;
var fontInd;
var curLevel = 0;
var heading = RIGHT;
var sel = 2;

var level_strs = [
	'@.......'+
	'******..'+
	'.*X.....'+
	'.*..R...'+
	'.*......'+
	'.*X....@'+
	'.******.'+
	'........',

	'.......@'+
	'.*..***.'+
	'.*......'+
	'...R..*X'+
	'**..****'+
	'.*......'+
	'.*.**...'+
	'....*...',

	'........'+
	'........'+
	'........'+
	'........'+
	'........'+
	'........'+
	'........'+
	'........'
];

function preload() {
  fontRegular = loadFont('RobotoSlab-Light.ttf');
  fontInd = loadFont('miso-bold.ttf');
}

function setup() {
  createCanvas(SCR_WIDTH, SCR_HEIGHT);
  noFill();
  textSize(TEXT_SIZE);
  textAlign(CENTER);
  textFont(fontInd);
  loadLevel();
}

function loadLevel() {
	level = [];
	var l = level_strs[curLevel];
	for (var y=0; y<tiles_v; y++) {
		var row = [];
		for (var x=0; x<tiles_h; x++) {
			var i = (y * tiles_h) + x;
			switch (l[i]) {
				case '*': row.push(WALL); break;
				case '.': row.push(NONE); break;
				case '@': row.push(BOX); break;
				case 'X': row.push(SHELF); break;
				case 'U': row.push(PLAYER); break;
				case 'D': row.push(PLAYER); break;
				case 'L': row.push(PLAYER); break;
				case 'R': row.push(PLAYER); break;
				default: level.push(NONE);
			}
		}
		level.push(row);
	}
}

function keyTyped() {
	console.log("key typed", key);
	if (key === 'r') {
		loadLevel();
	}
}

function paintTiles() {
	if (mouseX > MARGIN && mouseX < MARGIN+(5 * TILE_SIZE) && mouseY > SCR_WIDTH) {
		sel = Math.floor((mouseX-MARGIN)/TILE_SIZE);
	} else if (mouseX > MARGIN && mouseX < MARGIN+(tiles_h * TILE_SIZE) && mouseY > MARGIN && mouseY<MARGIN+(tiles_v*TILE_SIZE)) {
		var xx = Math.floor((mouseX-MARGIN)/TILE_SIZE);
		var yy = Math.floor((mouseY-MARGIN)/TILE_SIZE);
		console.log("clicked", xx, yy);
		level[yy][xx] = sel;
	}	
}


function mouseClicked() {
	paintTiles();
}

function mouseDragged() {
	paintTiles();
}

function tilePos(tx, ty) {
	return {x: MARGIN + (tx * TILE_SIZE), y: MARGIN + (ty * TILE_SIZE)};
}

function playerPos(tx, ty) {
	var p = tilePos(tx, ty);
	p.x += (PMARGIN + PSIZE/2);
	p.y += (PMARGIN + PSIZE/2);
	return p;
}

function drawWall(tp) {
	stroke(120);
	fill(140);
	rect(tp.x, tp.y, TILE_SIZE, TILE_SIZE);
	for (var xx=0; xx<TILE_SIZE; xx+=10) {
		line(tp.x+xx, tp.y, tp.x+TILE_SIZE, (tp.y+TILE_SIZE)-xx);
		line(tp.x, tp.y+xx, tp.x+(TILE_SIZE-xx), tp.y+TILE_SIZE);
	}
}

function drawShelf(tp) {
	stroke(210);
	fill(240);
	for (var xx=0; xx<TILE_SIZE/2; xx+=10) {
		rect(tp.x+xx, tp.y+xx, TILE_SIZE-(xx*2), TILE_SIZE-(xx*2));
	}		
}

function drawIndicators(p) {
	var plp = {x: p.x, y: p.y};
	var mnp = {x: p.x, y: p.y};
	var dist = ((PSIZE / 2) - (IND_SIZE / 2));
	switch (heading) {
		case UP: {
			plp.y -= dist;
			mnp.y += dist;
			break;
		}
		case DOWN: {
			plp.y += dist;
			mnp.y -= dist;
			break;
		}
		case LEFT: {
			plp.x -= dist;
			mnp.x += dist;
			break;
		}
		case RIGHT: {
			plp.x += dist;
			mnp.x -= dist;
			break;
		}
	}
	plp.y += (textAscent() / 2);
	mnp.y += (textAscent() / 2);
	stroke(100);
	fill(200);
	text("+", plp.x, plp.y);
	text("-", mnp.x, mnp.y);
}

function drawBox(tp) {
	stroke(160);
	fill(180);
	rect(tp.x+PMARGIN, tp.y+PMARGIN, TILE_SIZE-(PMARGIN*2), TILE_SIZE-(PMARGIN*2));
	fill(200);
	ellipse(tp.x+14, tp.y+14, 10, 10);
	ellipse((tp.x+TILE_SIZE)-14, tp.y+14, 10, 10);
	ellipse(tp.x+14, (tp.y+TILE_SIZE)-14, 10, 10);
	ellipse((tp.x+TILE_SIZE)-14, (tp.y+TILE_SIZE)-14, 10, 10);
}

function drawPlayer(p) {
	//noStroke();
	stroke(100);
	fill(180);
	ellipse(p.x, p.y, PSIZE, PSIZE);
	drawIndicators(p);
}

function drawPalette() {
	var y = SCR_WIDTH;
	var x = MARGIN;
	stroke(210);
	fill(240);
	rect(x, y, TILE_SIZE, TILE_SIZE);
	var p = {x: x, y: y};
	
	p.x += TILE_SIZE;
	drawWall(p);
	
	p.x += TILE_SIZE;
	drawPlayer({x: p.x+(PSIZE+PMARGIN+PMARGIN)/2, y: p.y+(PSIZE+PMARGIN+PMARGIN)/2});

	p.x += TILE_SIZE;
	drawBox(p);
	
	p.x += TILE_SIZE;
	drawShelf(p);
	
	fill(255,0,0,128);
	stroke(255,0,0);
	rect((sel*TILE_SIZE)+MARGIN,p.y,TILE_SIZE,TILE_SIZE);

}

function drawBoard() {
	for (var y=0; y<tiles_v; y++) {
		for (var x=0; x<tiles_h; x++) {
			var tp = tilePos(x, y);
			stroke(210);
			fill(240);
			rect(tp.x, tp.y, TILE_SIZE, TILE_SIZE);
			//console.log("drawing ("+x+","+y+")");
			if (level[y][x] === WALL) {
				drawWall(tilePos(x, y));
			} else if (level[y][x] === SHELF) {
				drawShelf(tilePos(x, y));
			} else if (level[y][x] === PLAYER) {
				drawPlayer(playerPos(x, y));
			} else if (level[y][x] === BOX) {
				drawBox(tilePos(x, y));
			}
		}
	}	
}

function draw() {
	background(250);
	drawBoard();
	drawPalette();
}
