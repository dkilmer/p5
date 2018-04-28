const SCR_WIDTH = 552;
const SCR_HEIGHT = 600;
const MARGIN = 20;
const PMARGIN = 2;
const IND_SIZE = 20;
const TILE_SIZE = 64;
const PSIZE = TILE_SIZE - (2 * PMARGIN);
const tiles_h = 8; //(SCR_WIDTH - (2 * MARGIN)) / TILE_SIZE;
const tiles_v = 8; //(SCR_HEIGHT - (2 * MARGIN)) / TILE_SIZE;
const MOVE_FRAMES = 15;
const TEXT_SIZE = 40;

const WALL = 1;
const PLAYER = 2;
const BOX = 3;
const SHELF = 4;
const EXIT = 5;

const NONE = 0;
const DUP = 1;
const DDOWN = 2;
const DLEFT = 3;
const DRIGHT = 4;

var keyDirs;

var pp = {x: 0, y: 0};
var xp = {x: 0, y: 0};
var bps = [];
var heading = DDOWN;
var attached = -1;
var mframe = 0;
var bframe = 0;
var fontRegular;
var fontInd;
var undos = [];

var curLevel;
var level;
var titleScreen = true;
var winScreen = false;

var level_strs = [
	'*......*'+
	'*....D.*'+
	'*....***'+
	'*......#'+
	'@....***'+
	'*.*....*'+
	'*......*'+
	'*..X...*',

	'.......@'+
	'.*..***.'+
	'.*......'+
	'...R..*#'+
	'**..****'+
	'X*......'+
	'.*.**...'+
	'....*...',

	'***#*...'+
	'*.*...*.'+
	'*.*.*.*.'+
	'*.*.*.*.'+
	'@.......'+
	'*.*.*.*.'+
	'*.*.*.*.'+
	'*X*U*...',

	'.......X'+
	'........'+
	'....*...'+
	'@..***.U'+
	'....*...'+
	'@..#....'+
	'..#...@.'+
	'.#......',

	'........'+
	'.******.'+
	'.*.....@'+
	'.*#.R...'+
	'X*......'+
	'.*#....@'+
	'.******.'+
	'........',

	'.......#'+
	'...****#'+
	'**...@*.'+
	'X*..@.*.'+
	'U*....*.'+
	'.*....*.'+
	'.****.*.'+
	'........',

	'...*****'+
	'.......#'+
	'.*.****#'+
	'**...@*.'+
	'X*..@.*.'+
	'U*....*.'+
	'.****.*.'+
	'........'
];

/*



	'........'+
	'........'+
	'........'+
	'........'+
	'........'+
	'........'+
	'........'+
	'........'
*/

function preload() {
  fontRegular = loadFont('RobotoSlab-Light.ttf');
  fontInd = loadFont('miso-bold.ttf');
}

function setup() {
	keyDirs = [
		{key: UP_ARROW, dir: DUP},
		{key: DOWN_ARROW, dir: DDOWN},
		{key: LEFT_ARROW, dir: DLEFT},
		{key: RIGHT_ARROW, dir: DRIGHT}
	];
  createCanvas(SCR_WIDTH, SCR_HEIGHT);
  noFill();
  textFont(fontInd);
  textSize(TEXT_SIZE);
  textAlign(CENTER);
  //strokeWeight(2);
  curLevel = 0;
  loadLevel();
}

function loadLevel() {
	bps = [];
	clearUndos();
	attached = -1;
	level = [];
	var l = level_strs[curLevel];
	for (var y=0; y<tiles_v; y++) {
		var row = [];
		for (var x=0; x<tiles_h; x++) {
			var i = (y * tiles_h) + x;
			switch (l[i]) {
				case '*': row.push(WALL); break;
				case '.': row.push(NONE); break;
				case '@': {
					row.push(NONE);
					bps.push(new Item(x, y, BOX));
					break;
				}
				case '#': row.push(SHELF); break;
				case 'X': row.push(EXIT); break;
				case 'U': {
					row.push(NONE); 
					heading = DUP;
					pp = new Item(x, y, PLAYER);
					break;
				}
				case 'D': {
					row.push(NONE); 
					heading = DDOWN; 
					pp = new Item(x, y, PLAYER);
					break;
				}
				case 'L': {
					row.push(NONE); 
					heading = DLEFT; 
					pp = new Item(x, y, PLAYER);
					break;
				}
				case 'R': {
					row.push(NONE); 
					heading = DRIGHT; 
					pp = new Item(x, y, PLAYER);
					break;
				}
				default: level.push(NONE);
			}
		}
		level.push(row);
	}
}

function keyTyped() {
	if (key === 'r') {
		loadLevel();
		clearUndos();
	} else if (key === ' ') {
		if (titleScreen) {
			titleScreen = false;
		} else if (winScreen) {
			winScreen = false;			
			curLevel++;
			if (curLevel >= level_strs.length) {
				curLevel = 0;
				titleScreen = true;
			}
			loadLevel();				
		}
	} else if (key === 'u') {
		popUndo();
	} else if (!isNaN(parseInt(key))) {
		var n = parseInt(key);
		if (n <= level_strs.length) {
			titleScreen = false;
			winScreen = false;
			curLevel = n-1;
			loadLevel();
		}
	}
}

function thingAt(x, y) {
	if (x < 0 || x >= tiles_h) return WALL;
	if (y < 0 || y >= tiles_v) return WALL;
	if (pp.x === x && pp.y === y) return PLAYER;
	for (var i=0; i<bps.length; i++) {
		if (bps[i].x === x && bps[i].y === y) {
			return bps[i].which;
		}
	}
	return level[y][x];
}

function thingAtDir(x, y, dir) {
	var xx = x;
	var yy = y;
	switch (dir) {
		case DUP: yy--; break;
		case DDOWN: yy++; break;
		case DLEFT: xx--; break;
		case DRIGHT: xx++; break;
	}
	return thingAt(xx, yy);
}

function canPlayerMove(dir) {
	var x = pp.x;
	var y = pp.y;
	switch(dir) {
		case DUP: y--; break;
		case DDOWN: y++; break;
		case DLEFT: x--; break;
		case DRIGHT: x++; break;
	}
	var thing = thingAt(x, y);
	if (thing === BOX && isAttached() && bps[attached].x === x && bps[attached].y === y) {
		return canBoxMove(attached, dir);
	}
	return (thing !== WALL && thing !== BOX);
}

function canBoxMove(i, dir) {
	var x = bps[i].x;
	var y = bps[i].y;
	switch(dir) {
		case DUP: y--; break;
		case DDOWN: y++; break;
		case DLEFT: x--; break;
		case DRIGHT: x++; break;
	}
	var thing = thingAt(x, y);
	if (thing === PLAYER && isAttached() && attached === i) {
		return canPlayerMove(dir);
	}
	return (thing !== WALL && thing != BOX && thing != PLAYER);
}

function howFarCanBoxMove(i, mx, my) {
	var x = bps[i].x + mx;
	var y = bps[i].y + my;
	var cnt = 0;
	while (x >= 0 && x < tiles_h && y >=0 && y < tiles_v) {
		var thing = thingAt(x, y);
		if (thing === WALL || thing === BOX || thing === PLAYER) break;
		cnt++;
		x += mx;
		y += my;
	}
	return cnt;
}

function playerMoving() {
	return (pp.doing !== NONE);
}

function boxMoving(i) {
	return (bps[i].doing !== NONE);
}

function anyBoxMoving() {
	for (var i=0; i<bps.length; i++) {
		if (boxMoving(i)) {
			return true;
		}
	}
	return false;
}

function isAttached() {
	return (attached >= 0);
}

function processInput() {
	if (playerMoving() || anyBoxMoving()) return;
	mframe = 0;
	for (var i=0; i<keyDirs.length; i++) {
		var kd = keyDirs[i];
		if (keyIsDown(kd.key)) {
			var moved = false;
			var wasHeading = heading;
			var wasAttached = attached;
			if (canPlayerMove(kd.dir)) {
				pp.doing = kd.dir;
				moved = true;
				if (isAttached()) {
					if (canBoxMove(attached, kd.dir)) {
						bps[attached].doing = kd.dir;
						bps[attached].dist = 1;
						bframe = 0;
					} else {
						attached = -1;
					}
				}
			}
			if (heading != kd.dir) {
				pushUndo(wasHeading, wasAttached);
				if (!isAttached()) heading = kd.dir;
				if (pp.doing === NONE) evaluateBoxMoves();
			} else if (moved) {
				pushUndo(wasHeading, wasAttached);
			}
			break;
		}
	}
}

function oppositeDir(dir) {
	switch (dir) {
		case DUP: return DDOWN;
		case DDOWN: return DUP;
		case DLEFT: return DRIGHT;
		case DRIGHT: return DLEFT;
	}
	return NONE;
}

function evaluateBoxAttract() {
	if (isAttached()) return;
	var x = pp.x;
	var y = pp.y;
	var mx = 0;
	var my = 0;
	switch (heading) {
		case DUP: y--; my = -1; break;
		case DDOWN: y++; my = 1; break;
		case DLEFT: x--; mx = -1; break;
		case DRIGHT: x++; mx = 1; break;
	}
	var ox = x;
	var oy = y;
	while (x >= 0 && x < tiles_h && y >=0 && y < tiles_v) {
		if (level[y][x] === WALL) return;
		for (var i=0; i<bps.length; i++) {
			if (bps[i].doing === NONE && bps[i].x === x && bps[i].y === y) {
				//console.log("starting attract at", x, y);
				bps[i].doing = oppositeDir(heading);
				if (ox === x) {
					bps[i].dist = Math.abs(oy - y);
				} else if (oy === y) {
					bps[i].dist = Math.abs(ox - x);
				} else {
					bps[i].dist = 0;
				}
				bframe = 0;
				return;
			}
		}
		x += mx;
		y += my;
	}	
}

function evaluateBoxRepel() {
	var x = pp.x;
	var y = pp.y;
	var mx = 0;
	var my = 0;
	switch (oppositeDir(heading)) {
		case DUP: y--; my = -1; break;
		case DDOWN: y++; my = 1; break;
		case DLEFT: x--; mx = -1; break;
		case DRIGHT: x++; mx = 1; break;
	}
	var ox = x;
	var oy = y;
	while (x >= 0 && x < tiles_h && y >=0 && y < tiles_v) {
		if (level[y][x] === WALL) return;
		for (var i=0; i<bps.length; i++) {
			if (bps[i].doing === NONE && bps[i].x === x && bps[i].y === y) {
				var d = howFarCanBoxMove(i, mx, my);
				if (d > 0) {
					//console.log("starting repel at", x, y);
					bps[i].doing = oppositeDir(heading);
					bps[i].dist = d;
					bframe = 0;
				}
				return;
			}
		}
		x += mx;
		y += my;
	}	
}

function evaluateBoxMoves() {
	evaluateBoxAttract();
	evaluateBoxRepel();
}

function updateBox(i) {
	var p = tilePos(bps[i].x, bps[i].y);
	if (!boxMoving(i)) return p;
	if (bframe >= MOVE_FRAMES || bps[i].dist === 0) {
		switch (bps[i].doing) {
			case DUP: bps[i].y-=bps[i].dist;  break;
			case DDOWN: bps[i].y+=bps[i].dist; break;
			case DLEFT: bps[i].x-=bps[i].dist; break;
			case DRIGHT: bps[i].x+=bps[i].dist; break;
		}
		if (thingAtDir(bps[i].x, bps[i].y, bps[i].doing) === PLAYER) {
			attached = i;
		}
		bps[i].doing = NONE;
		bps[i].dist = 0;
		//console.log('box '+i+' move done', bps[i].x, bps[i].y);
		return tilePos(bps[i].x, bps[i].y);
	}
	var howfar = cubicEaseInOut(bframe / MOVE_FRAMES) * (TILE_SIZE * bps[i].dist);
	switch (bps[i].doing) {
		case DUP: p.y -= howfar;  break;
		case DDOWN: p.y += howfar; break;
		case DLEFT: p.x -= howfar; break;
		case DRIGHT: p.x += howfar; break;		
	}
	bframe++;
	return p;
}

function evaluateWin() {
	if (level[pp.y][pp.x] !== EXIT) return;
	for (var i=0; i<bps.length; i++) {
		if (level[bps[i].y][bps[i].x] !== SHELF) return;
	}
	winScreen = true;
}

function updatePlayer() {
	var p = playerPos(pp.x, pp.y);
	if (!playerMoving()) return p;
	if (mframe >= MOVE_FRAMES) {
		switch (pp.doing) {
			case DUP: pp.y--;  break;
			case DDOWN: pp.y++; break;
			case DLEFT: pp.x--; break;
			case DRIGHT: pp.x++; break;
		}
		pp.doing = NONE;
		// player move is over. see if boxes can move.
		//console.log('player move done');
		if (isAttached()) updateBox(attached);
		evaluateBoxMoves();
		evaluateWin();
		return playerPos(pp.x, pp.y);
	}
	var howfar = cubicEaseInOut(mframe / MOVE_FRAMES) * TILE_SIZE;
	switch (pp.doing) {
		case DUP: p.y -= howfar;  break;
		case DDOWN: p.y += howfar; break;
		case DLEFT: p.x -= howfar; break;
		case DRIGHT: p.x += howfar; break;
	}
	mframe++;
	return p;
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

function drawWall(x, y) {
	stroke(120);
	fill(140);
	var tp = tilePos(x, y);
	rect(tp.x, tp.y, TILE_SIZE, TILE_SIZE);
	for (var xx=0; xx<TILE_SIZE; xx+=10) {
		line(tp.x+xx, tp.y, tp.x+TILE_SIZE, (tp.y+TILE_SIZE)-xx);
		line(tp.x, tp.y+xx, tp.x+(TILE_SIZE-xx), tp.y+TILE_SIZE);
	}
}

function drawShelf(x, y) {
	stroke(210);
	fill(240);
	var tp = tilePos(x, y);
	for (var xx=0; xx<TILE_SIZE/2; xx+=10) {
		rect(tp.x+xx, tp.y+xx, TILE_SIZE-(xx*2), TILE_SIZE-(xx*2));
	}		
}

function drawExit(x, y) {
	stroke(210);
	fill(240);
	var tp = playerPos(x, y);
	for (var xx=TILE_SIZE; xx>0; xx-=20) {
		ellipse(tp.x, tp.y, xx, xx);
		//rect(tp.x+xx, tp.y+xx, TILE_SIZE-(xx*2), TILE_SIZE-(xx*2));
	}		
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
				drawWall(x, y);
			} else if (level[y][x] === SHELF) {
				drawShelf(x, y);
			} else if (level[y][x] === EXIT) {
				drawExit(x, y);
			}
		}
	}	
}

function drawIndicators(p) {
	var plp = {x: p.x, y: p.y};
	var mnp = {x: p.x, y: p.y};
	var dist = ((PSIZE / 2) - (IND_SIZE / 2));
	switch (heading) {
		case DUP: {
			plp.y -= dist;
			mnp.y += dist;
			break;
		}
		case DDOWN: {
			plp.y += dist;
			mnp.y -= dist;
			break;
		}
		case DLEFT: {
			plp.x -= dist;
			mnp.x += dist;
			break;
		}
		case DRIGHT: {
			plp.x += dist;
			mnp.x -= dist;
			break;
		}
	}
	textSize(40);
	plp.y += (textAscent() / 2);
	mnp.y += (textAscent() / 2);
  //textAlign(CENTER);
	stroke(100);
	fill(200);
	text("+", plp.x, plp.y);
	text("-", mnp.x, mnp.y);
}

function drawBox(i) {
	stroke(160);
	fill(180);
	var tp = updateBox(i);
	rect(tp.x+PMARGIN, tp.y+PMARGIN, TILE_SIZE-(PMARGIN*2), TILE_SIZE-(PMARGIN*2));
	fill(200);
	ellipse(tp.x+14, tp.y+14, 10, 10);
	ellipse((tp.x+TILE_SIZE)-14, tp.y+14, 10, 10);
	ellipse(tp.x+14, (tp.y+TILE_SIZE)-14, 10, 10);
	ellipse((tp.x+TILE_SIZE)-14, (tp.y+TILE_SIZE)-14, 10, 10);
}

function drawPlayer() {
	//noStroke();
	stroke(100);
	fill(180);
	var p = updatePlayer();
	ellipse(p.x, p.y, PSIZE, PSIZE);
	drawIndicators(p);
}

function drawBoxes() {
	for (var i=0; i<bps.length; i++) {
		drawBox(i);
	}
}

function drawLevelText() {
	stroke(140);
	fill(230);
  //textAlign(LEFT);
	textSize(40);
	var y = (MARGIN * 2)+(tiles_v * TILE_SIZE)+ (textAscent() / 2);
	var x = MARGIN + ((tiles_h / 2) * TILE_SIZE);
	text('room '+(curLevel+1), x, y);
	y += 20;
	textSize(20);
	text('[arrows to move, R to restart level, U to undo]', x, y);
}

function drawGame() {
	background(250);
	drawBoard();
	drawBoxes();
	processInput();
	drawPlayer();
	drawLevelText();
}

function drawTitleScreen() {
	background(250);
	stroke(210);
	fill(240);
	rect(MARGIN, MARGIN, (TILE_SIZE * tiles_h), (TILE_SIZE * tiles_v));
	stroke(140);
	fill(230);
	textSize(40);
	var x = MARGIN + ((tiles_h / 2) * TILE_SIZE);
	var y = 220;
	text('sokobrokobot', x, y);
	y += 40;
	textSize(20);
	text('[press space to start]', x, y);
	y = 400;
	text('arrows to move, R to restart level', x, y);
	y += 40;
	text('move the boxes to                       then go to', x, y);
	stroke(210);
	fill(240);
	var tp = {x: 170, y: 450};
	for (var xx=0; xx<TILE_SIZE/2; xx+=10) {
		rect(tp.x+xx, tp.y+xx, TILE_SIZE-(xx*2), TILE_SIZE-(xx*2));
	}		
	tp = {x: 380, y: 450+ (TILE_SIZE/2)};
	for (var xx=TILE_SIZE; xx>0; xx-=20) {
		ellipse(tp.x, tp.y, xx, xx);
	}		

}

function drawWinScreen() {
	stroke(140);
	fill(230);
	textSize(40);
	var x = MARGIN + ((tiles_h / 2) * TILE_SIZE);
	var y = MARGIN + ((tiles_v / 2) * TILE_SIZE) + (textAscent() / 2);
	text('room done', x, y);
	y += 40;
	textSize(20);
	text('[press space to continue]', x, y);
}


function draw() {
	if (titleScreen) {
		drawTitleScreen();
	} else if (winScreen) {
		drawWinScreen();
	} else {
		drawGame();
	}
	// var fps = frameRate();
	// fill(255);
	// stroke(0);
	// text("FPS: " + fps.toFixed(2), 100, height - 10);
}

function cubicEaseInOut(p) {
	if (p < 0.5)	{
		return 4 * p * p * p;
	} else {
		var f = ((2 * p) - 2);
		return 0.5 * f * f * f + 1;
	}
}

function clearUndos() {
	undos = [];
}

function pushUndo(wasHeading, wasAttached) {
	undos.push(new Undo(wasHeading, wasAttached));
}

function popUndo() {
	if (undos.length === 0) return;
	var u = undos.pop();
	pp.x = u.playerPos.x;
	pp.y = u.playerPos.y;
	heading = u.playerHeading;
	attached = u.playerAttached;
	for (var i=0; i<bps.length; i++) {
		bps[i].x = u.boxPos[i].x;
		bps[i].y = u.boxPos[i].y;
	}

}

function Item(gridX, gridY, whichThing) {
	this.x = gridX;
	this.y = gridY;
	this.which = whichThing;
	this.doing = NONE;
	this.dist = 0;
}

function Undo(wasHeading, wasAttached) {
	this.playerPos = {x: pp.x, y: pp.y}
	this.boxPos = [];
	for (var i=0; i<bps.length; i++) {
		this.boxPos.push({x: bps[i].x, y: bps[i].y});
	}
	this.playerHeading = wasHeading;
	this.playerAttached = wasAttached;
}
