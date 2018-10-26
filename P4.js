// SETUP RENDERER & SCENE
var canvas = document.getElementById('canvas');
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
// renderer.setClearColor(0xFFFFFF); // white background colour
canvas.appendChild(renderer.domElement);


// SETUP CAMERA
var camera = new THREE.PerspectiveCamera(30,1,0.1,1000); // view angle, aspect ratio, near, far
var controls = new THREE.OrbitControls(camera);
controls.enabled = false;
camera.position.set(0,400,0);
camera.lookAt(scene.position);
scene.add(camera);

//SETUP FPS
var fps;
var fpsHelper = {	startTime : 0,	frameNumber : 0,
  getFPS : function() {
    this.frameNumber++;
    var d = new Date().getTime(), currentTime = ( d - this.startTime ) / 1000, result = Math.floor( ( this.frameNumber / currentTime ) );
    if( currentTime > 1 ) {
      this.startTime = new Date().getTime();
      this.frameNumber = 0;
    }
    return result;
  }
};

// SETUP TIMER

var time = 0;
var running = false;

function startTimer() {
    running = true;
    increment();
}

function resetTimer() {
  time = 0;
}

function increment() {
  if (running) {
    setTimeout(function() {
      time++;
      var minutes = Math.floor(time/10/60);
      var seconds = Math.floor(time/10 % 60);
      var ms = time % 10;
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      if (document.getElementById("timer") != null) {
        document.getElementById("timer").innerHTML = minutes + ":" + seconds + ":" + "0" + ms;
        increment();
      }
    }, 100);
  }
}

// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}

// EVENT LISTENER RESIZE
window.addEventListener('resize',resize);
resize();

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
     window.scrollTo(0,0);
   }

// SETUP MOUSE ROTATION
var maxRotation = 45;
var targetRotationZAxis = 0;
var targetRotationXAxis = 0;
var targetRotationZAxisOnMouseDown = 0;
var targetRotationXAxisOnMouseDown = 0;
var mouseX = 0;
var mouseY = 0;
var mouseXOnMouseDown = 0;
var mouseYOnMouseDown = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

document.getElementById("startButton").addEventListener("click", startGame);

function onDocumentMouseDown( event ) {
				event.preventDefault();
				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				document.addEventListener( 'mouseup', onDocumentMouseUp, false );
				document.addEventListener( 'mouseout', onDocumentMouseOut, false );
				mouseXOnMouseDown = event.clientX - windowHalfX;
        mouseYOnMouseDown = event.clientY - windowHalfY;
				targetRotationZAxisOnMouseDown = targetRotationZAxis;
        targetRotationXAxisOnMouseDown = targetRotationXAxis;
			}

function onDocumentMouseMove( event ) {
				mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
        if (!event.ctrlKey){
          if (Math.abs(targetRotationZAxis) < maxRotation) {
				        targetRotationZAxis = targetRotationZAxisOnMouseDown + ( mouseX * -1 - mouseXOnMouseDown ) * 0.005;
              }
            }
        if (!event.shiftKey) {
          if (Math.abs(targetRotationXAxis) < maxRotation) {
              targetRotationXAxis = targetRotationXAxisOnMouseDown + (mouseY * -1 - mouseXOnMouseDown ) * 0.005;
            }
          }
			}

function onDocumentMouseUp( event ) {
				document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
				document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
				document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
				if (event.which == 3) {
					movement = false;
				}
			}

function onDocumentMouseOut( event ) {
				document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
				document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
				document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
			}

function onDocumentTouchStart( event ) {
				if ( event.touches.length == 1 ) {
					event.preventDefault();
					mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
          mouseYOnMouseDown = event.touches[ 0 ].pageY - windowHalfY;

					targetRotationZAxisOnMouseDown = targetRotationZAxis;
          targetRotationXAxisOnMouseDown = targetRotationZAxis;

				}
			}

function onDocumentTouchMove( event ) {
				if ( event.touches.length == 1 ) {
					event.preventDefault();
					mouseX = event.touches[ 0 ].pageX - windowHalfX;
          mouseX = event.touches[ 0 ].pageX - windowHalfX;

					targetRotationZAxis = targetRotationZAxisOnMouseDown + ( mouseX *-1 - mouseXOnMouseDown ) * 0.0125;
          targetRotationXAxis = targetRotationXAxisOnMouseDown + ( mouseY * -1- mouseXOnMouseDown ) * 0.0125;
				}
			}

//MAZE CREATION Randomized Prim's algorithm
var X_AXIS = new THREE.Vector3(1, 0, 0);
var Y_AXIS = new THREE.Vector3(0, 1, 0);
var Z_AXIS = new THREE.Vector3(0, 0, 1);

var perimeterMaxX = 10;
var perimeterMaxZ = 10;

var cellList = new Array();
for (i = 0; i < perimeterMaxX; i++) {
	cellList[i] = new Array(perimeterMaxZ);
}

function Wall(x, z, direction) {
	this.x = x;
	this.z = z;
	this.direction = direction;
}

function Cell(x, z){
	this.mazeCell = false;
	this.goalCell = false;
	this.wallNorth = new Wall(x, z, "North");
	this.wallSouth = new Wall(x, z, "South");
	this.wallWest = new Wall(x, z, "West");
	this.wallEast = new Wall(x, z, "East");
	this.position = null;
}

//count the number of maze cells neighbouring the cell of the wall to be checked and if only one add it to the maze path
function checkCell(wall) {
	var numMazeCells = 1;
	switch (wall.direction) {
		case "North":
			if (wall.z + 2 < perimeterMaxZ && cellList[wall.x][wall.z + 2].mazeCell) {
				numMazeCells++;
			}
			if (wall.x - 1 >= 0 && cellList[wall.x - 1][wall.z + 1].mazeCell) {
				numMazeCells++;
			}
			if (wall.x + 1 < perimeterMaxX && cellList[wall.x + 1][wall.z + 1].mazeCell) {
				numMazeCells++;
			}
			break;

		case "South":
			if (wall.z - 2 >= 0 && cellList[wall.x][wall.z - 2].mazeCell) {
				numMazeCells++;
			}
			if (wall.x - 1 >= 0 && cellList[wall.x - 1][wall.z - 1].mazeCell) {
				numMazeCells++;
			}
			if (wall.x + 1 < perimeterMaxX && cellList[wall.x + 1][wall.z - 1].mazeCell) {
				numMazeCells++;
			}
			break;

		case "West":
			if (wall.z + 1 < perimeterMaxZ && cellList[wall.x - 1][wall.z + 1].mazeCell) {
				numMazeCells++;
			}
			if (wall.z - 1 >= 0 && cellList[wall.x - 1][wall.z - 1].mazeCell) {
				numMazeCells++;
			}
			if (wall.x - 2 >= 0 && cellList[wall.x - 2][wall.z].mazeCell) {
				numMazeCells++;
			}
			break;

		case "East":
			if (wall.z + 1 < perimeterMaxZ && cellList[wall.x + 1][wall.z + 1].mazeCell) {
				numMazeCells++;
			}
			if (wall.z - 1 >= 0 && cellList[wall.x + 1][wall.z - 1].mazeCell) {
				numMazeCells++;
			}
			if (wall.x + 2 < perimeterMaxX && cellList[wall.x + 2][wall.z].mazeCell) {
				numMazeCells++;
			}
			break;
	}
	return (numMazeCells == 1)
}

function addWalls(wall) {
	switch (wall.direction) {
		case "North": //Within perimeter add all neighbouring walls in above cell
			cellList[wall.x][wall.z + 1].mazeCell = true;
			if (wall.z  + 1 < perimeterMaxZ - 1) {
				wallList.push(cellList[wall.x][wall.z + 1].wallNorth);
			}
			if (wall.x > 0) {
				wallList.push(cellList[wall.x][wall.z + 1].wallWest);
			}
			if (wall.x < perimeterMaxX - 1) {
				wallList.push(cellList[wall.x][wall.z + 1].wallEast);
			}
			break;

		case "South":
			cellList[wall.x][wall.z - 1].mazeCell = true;
			if (wall.z - 1 > 0) {
				wallList.push(cellList[wall.x][wall.z - 1].wallSouth);
			}
			if (wall.x > 0) {
				wallList.push(cellList[wall.x][wall.z - 1].wallWest);
			}
			if (wall.x < perimeterMaxX - 1) {
				wallList.push(cellList[wall.x][wall.z - 1].wallEast);
			}
			break;

		case "West":
			cellList[wall.x - 1][wall.z].mazeCell = true;
			if (wall.z < perimeterMaxZ - 1) {
				wallList.push(cellList[wall.x - 1][wall.z].wallNorth);
			}
			if (wall.z > 0) {
				wallList.push(cellList[wall.x - 1][wall.z].wallSouth);
			}
			if (wall.x - 1 > 0) {
				wallList.push(cellList[wall.x - 1][wall.z].wallWest);
			}
			break;

		case "East":
			cellList[wall.x + 1][wall.z].mazeCell = true;
			if (wall.z < perimeterMaxZ - 1) {
				wallList.push(cellList[wall.x + 1][wall.z].wallNorth);
			}
			if (wall.z > 0) {
				wallList.push(cellList[wall.x + 1][wall.z].wallSouth);
			}
			if (wall.x + 1 < perimeterMaxX - 1) {
				wallList.push(cellList[wall.x + 1][wall.z].wallEast);
			}
			break;
	}
}

for (i = 0; i < perimeterMaxX; i++) {
	for (j = 0; j < perimeterMaxZ; j++) {
		cellList[i][j] = new Cell(i, j);
	}
}

var wallList = [cellList[0][0].wallNorth, cellList[0][0].wallEast];
cellList[0][0].mazeCell = true;

while (wallList.length != 0 ) {
	var random = Math.floor(Math.random() * wallList.length);
	if (checkCell(wallList[random])) {
		addWalls(wallList[random]);
	}
	wallList.splice(random, 1);
}

//textures
var floorTexture = new THREE.ImageUtils.loadTexture('images/checkerboard.jpg');
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(perimeterMaxX / 4, perimeterMaxZ / 4);

var wallTexture = new THREE.ImageUtils.loadTexture('images/wall.jpg');
wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(1, 1);

var ballTexture = new THREE.ImageUtils.loadTexture('images/ball.jpg');
ballTexture.wrapS = ballTexture.wrapT = THREE.RepeatWrapping;
ballTexture.repeat.set(1, 1);

var spikeTexture = new THREE.ImageUtils.loadTexture('images/spike.jpg');
spikeTexture.wrapS = spikeTexture.wrapT = THREE.RepeatWrapping;
spikeTexture.repeat.set(1, 1);

var floorMaterial = new THREE.MeshLambertMaterial({ map: floorTexture});
var wallMaterial = new THREE.MeshLambertMaterial({ map: wallTexture });
var ballMaterial = new THREE.MeshLambertMaterial({ map: ballTexture });
var spikeMaterial = new THREE.MeshLambertMaterial({ map: spikeTexture });

var wallWidth = 16;
var wallDepth = 16;
var wallHeight = 16;
var spikeWidth = wallWidth/6;
var spikeDepth = wallDepth;
var spikeHeight = wallWidth/3
var floorWidth = perimeterMaxX * wallWidth;
var floorDepth = perimeterMaxZ * wallDepth;
var floorHeight = 0.1;
var ballRadius = 2;

var floor = new THREE.Mesh( new THREE.BoxGeometry( floorWidth, floorHeight, floorDepth ), floorMaterial  );
var box = new THREE.BoxGeometry( wallWidth, wallHeight, wallDepth );
var cone = new THREE.CylinderGeometry(0, spikeWidth, spikeHeight, 4, 1, true);

var spikeTranslationAxis;
var spikeTranslationDirection;
var spikeList = [];

var goalX = 1;
var goalZ = 1;
while ( !cellList[goalX][goalZ].mazeCell || (goalX + goalZ) <= Math.max(perimeterMaxX, perimeterMaxZ) ) {
		goalX = Math.floor(Math.random() * (perimeterMaxX - 1));
		goalZ = Math.floor(Math.random() * (perimeterMaxZ - 1));
};
//coordinates start at bottom left (0,0)
for (i = 0; i < perimeterMaxX; i++) {
	for (j = 0; j < perimeterMaxZ; j++) {
		if (i == goalX && j == goalZ) {
			cellList[i][j].goalCell = true;
			cellList[i][j].position = new THREE.Vector3(-floorWidth / 2 + wallWidth * i + wallWidth / 2, wallHeight / 2, floorDepth / 2 - wallDepth * j - wallDepth / 2)
		}
		else {
			var wall = new THREE.Mesh( box, wallMaterial );
			floor.add(wall);
			wall.translateOnAxis(X_AXIS, i * wallWidth);
			wall.translateOnAxis(Z_AXIS, Math.abs(j - perimeterMaxZ + 1) * wallDepth);

			wall.translateOnAxis(X_AXIS, -floorWidth / 2 + wallWidth / 2);
			wall.translateOnAxis(Z_AXIS, -floorDepth / 2 + wallDepth / 2);

			if (cellList[i][j].mazeCell == false) {
				wall.translateOnAxis(Y_AXIS, wallHeight / 2);
				cellList[i][j].position = wall.position;

        var spike = new THREE.Mesh( cone, cookTorranceShading );

        wall.add(spike);
        spike.rotateOnAxis(Y_AXIS, Math.PI / 4);
        if ((Math.floor((Math.random() * 10) + 1)) % 2 == 0) {
            spikeTranslationAxis = X_AXIS;
        }
        else {
            spikeTranslationAxis = Z_AXIS
        }
        if ((Math.floor((Math.random() * 10) + 1)) % 2 == 0) {
            spikeTranslationDirection = 1;
        }
        else {
            spikeTranslationDirection = -1;
        }
        spike.translateOnAxis(spikeTranslationAxis, wallWidth);
        spike.translateOnAxis(Y_AXIS, -spikeHeight);

        spikeList.push(spike);

			}
			else {
				wall.translateOnAxis(Y_AXIS, -wallHeight * 2 + wallHeight / 2);
				cellList[i][j].position = null;
			}
		}
	}
}

var goal = new THREE.Mesh(box, ballMaterial);
floor.add(goal);
goal.position.set(cellList[goalX][goalZ].position.x, cellList[goalX][goalZ].position.y, cellList[goalX][goalZ].position.z);
cellList[goalX][goalZ].position = null;
goal.translateOnAxis(Y_AXIS, -wallHeight + floorHeight * 2);

var wallPerimeterNorth = [];
var wallPerimeterSouth = [];
var wallPerimeterWest = [];
var wallPerimeterEast = [];

for (i = 0; i < perimeterMaxX; i++) {
	var wallNorth = new THREE.Mesh( box, wallMaterial );
	floor.add(wallNorth);
	wallNorth.translateOnAxis(Y_AXIS, wallHeight / 2);
	wallNorth.translateOnAxis(Z_AXIS, -floorDepth / 2 - wallDepth / 2);
	wallNorth.translateOnAxis(X_AXIS, -i * wallWidth + floorWidth / 2 - wallWidth / 2);
	wallPerimeterNorth[i] = wallNorth;

	var wallSouth = new THREE.Mesh( box, wallMaterial );
	floor.add(wallSouth);
	wallSouth.translateOnAxis(Y_AXIS, wallHeight / 2);
	wallSouth.translateOnAxis(Z_AXIS, floorDepth / 2 + wallDepth / 2);
	wallSouth.translateOnAxis(X_AXIS, -i * wallWidth + floorWidth / 2 - wallWidth / 2 );
	wallPerimeterSouth[i] = wallSouth;
}

for (i = 0; i < perimeterMaxZ; i++) {
	var wallWest = new THREE.Mesh( box, wallMaterial );
	floor.add(wallWest);
	wallWest.translateOnAxis(Y_AXIS, wallHeight / 2);
	wallWest.translateOnAxis(X_AXIS, -floorWidth / 2 - wallWidth / 2);
	wallWest.translateOnAxis(Z_AXIS, -i * wallDepth + floorDepth / 2 - wallDepth / 2);
	wallPerimeterWest[i] = wallWest;

	var wallEast = new THREE.Mesh( box, wallMaterial );
	floor.add(wallEast);
	wallEast.translateOnAxis(Y_AXIS, wallHeight / 2);
	wallEast.translateOnAxis(X_AXIS, floorWidth / 2 + wallWidth / 2);
	wallEast.translateOnAxis(Z_AXIS, -i * wallDepth + floorDepth / 2 - wallDepth / 2);
	wallPerimeterEast[i] = wallEast;
}

var ball = new THREE.Mesh( new THREE.SphereGeometry(ballRadius), ballMaterial );
var ballVelocityX = 0;
var ballVelocityZ = 0;
var maxVelocity = .5;
var ballCollideDirection;
ball.translateOnAxis(Y_AXIS, ballRadius);
ball.translateOnAxis(X_AXIS, -floorWidth / 2 + wallWidth / 2);
ball.translateOnAxis(Z_AXIS, floorDepth / 2 - wallDepth / 2);

scene.add(floor);
floor.add(ball);
//maze end

//Lighting
var light = new THREE.PointLight(0xffffff);
light.position.set(0, wallHeight * 10, 0);
scene.add(light);

var spotLight = new THREE.SpotLight( 0xffffff, 1 );
spotLight.exponent = 5;
spotLight.decay = 0.5;
ball.add( spotLight );

//SETUP LIGHT/SHADERS

var shaderFiles = [
	'glsl/cookTorrance.vs.glsl',
  'glsl/cookTorrance.fs.glsl',
];

new THREE.SourceLoader().load(shaderFiles, function(shaders) {

	cookTorranceShading.vertexShader = shaders['glsl/cookTorrance.vs.glsl'];
	cookTorranceShading.fragmentShader = shaders['glsl/cookTorrance.fs.glsl'];
	cookTorranceShading.needsUpdate = true;

})

var lightColor = new THREE.Color(.5,1,1);
var ambientColor = new THREE.Color(0.4,0.4,0.4);
var lightPosition = new THREE.Vector3(light.position.x, light.position.y, light.position.z);

var kAmbient = 0.1;
var kDiffuse = 0.3;
var kSpecular = 0.1;
var shininess = 0.1;

var cookTorranceShading = new THREE.ShaderMaterial({
	uniforms: {
		lightColor : {type : 'c', value: lightColor},
		ambientColor : {type : 'c', value: ambientColor},
		lightPosition : {type: 'v3', value: lightPosition},
		kAmbient : {type : 'f', value: kAmbient},
		kDiffuse : {type : 'f', value: kDiffuse},
		kSpecular : {type : 'f', value: kSpecular},
		shininess : {type : 'f', value: shininess},
    roughness : {type : 'f', value: 1}
  }
});


//particles
var particleTexture = THREE.ImageUtils.loadTexture( 'images/ball.jpg' );
var maxParticles = 800;
var particles = new THREE.Object3D();
var particleRadius = 50;
	for (i = 0; i < maxParticles; i++) {
		var spriteMaterial = new THREE.SpriteMaterial({ map: particleTexture, transparent: true });
		var sprite = new THREE.Sprite(spriteMaterial);
		sprite.position.set(0, 0, 0);
		sprite.position.setLength(particleRadius * (Math.random() + 0.5));
		sprite.material.color.setHSL(Math.random(), Math.random(), Math.random());
		sprite.material.blending = THREE.AdditiveBlending;
		particles.add(sprite);
	}

function particleMovement() {
	for (i = 0; i < maxParticles; i++) {
		particles.children[i].position.set(Math.random() - 0.5 - mouse.y, Math.random(), Math.random() - 0.5 - mouse.x);
		particles.children[i].position.setLength(particleRadius * (Math.random() + 0.5));
		particles.children[i].material.color.setHSL(Math.random(), Math.random(), Math.random());
	}
	  requestAnimationFrame(particleMovement);
}


//check adjacent cells and perimeter return true if ball at position will collide with adjacent walls to (cellX, cellY)
function collisionDetection(cellX, cellZ, position) {
	var willCollide = false;

	if(cellX < 0) {
		cellX = 0;
	}
	if(cellX >= perimeterMaxX) {
		cellX = perimeterMaxX - 1;
	}

	if(cellZ < 0) {
		cellZ = 0;
	}
	if(cellZ >= perimeterMaxZ) {
		cellZ = perimeterMaxZ - 1;
	}

	if (cellZ + 1 < perimeterMaxZ && cellList[cellX][cellZ + 1].position != null) {
		if (position.z - ballRadius <= cellList[cellX][cellZ + 1].position.z + wallDepth / 2) {
			willCollide = true;
			ballCollideDirection = "North";
		}
	}
	if (cellZ - 1 >= 0 && cellList[cellX][cellZ - 1].position != null) {
		if (position.z + ballRadius >= cellList[cellX][cellZ - 1].position.z - wallDepth / 2) {
			willCollide = true;
			ballCollideDirection = "South";
		}
	}
	if (cellX - 1 >= 0 && cellList[cellX - 1][cellZ].position != null) {
		if (position.x - ballRadius <= cellList[cellX - 1][cellZ].position.x + wallWidth / 2) {
			willCollide = true;
			ballCollideDirection = "West";
		}
	}
	if (cellX + 1 < perimeterMaxX && cellList[cellX + 1][cellZ].position != null) {
		if (position.x + ballRadius >= cellList[cellX + 1][cellZ].position.x - wallWidth / 2) {
			willCollide = true;
			ballCollideDirection = "East";
		}
	}

	if (position.z - ballRadius <= wallPerimeterNorth[cellX].position.z + wallDepth / 2) {
		willCollide = true;
		ballCollideDirection = "North";
	}
	if (position.z + ballRadius >= wallPerimeterSouth[cellX].position.z - wallDepth / 2) {
		willCollide = true;
		ballCollideDirection = "South";
	}
	if (position.x - ballRadius <= wallPerimeterWest[cellZ].position.x + wallWidth / 2) {
		willCollide = true;
		ballCollideDirection = "West";
	}
	if (position.x + ballRadius >= wallPerimeterEast[cellZ].position.x - wallWidth / 2) {
		willCollide = true;
		ballCollideDirection = "East";
	}

	if (position.y - ballRadius / 2 < 0) {
		willCollide = true;
		ballCollideDirection = "Floor";
	}

	return willCollide;
}

//Move ball away from collision point and reflect the velocity
function resolveCollision() {
	(Math.abs(ballVelocityX) < 0.0001)? ballVelocityX = 0 : (ballVelocityX = ballVelocityX / -5);
	(Math.abs(ballVelocityZ) < 0.0001)? ballVelocityZ = 0 : (ballVelocityZ = ballVelocityZ / -5);
	switch (ballCollideDirection) {
		case "North":
				ball.translateOnAxis(Z_AXIS, ballRadius);
			break;

		case "South":
				ball.translateOnAxis(Z_AXIS, -ballRadius);
			break;

		case "West":
				ball.translateOnAxis(X_AXIS, ballRadius);
			break;

		case "East":
				ball.translateOnAxis(X_AXIS, -ballRadius);
			break;

		case "Floor":
			camera.translateY(ballRadius);
			break;
	}
	
	if (mode == "1st Person") {
			camera.position.set(ball.position.x, ball.position.y, ball.position.z);
	}
}

function checkGoal() {
	return (ball.position.x >= goal.position.x - wallWidth / 2 && ball.position.x <= goal.position.x + wallWidth / 2 &&
			ball.position.z >= goal.position.z - wallWidth / 2 && ball.position.z <= goal.position.z + wallWidth / 2);
}

function gameEnd() {
    running = false;
		reset();
		camera.position.set(0, 400, 0);
		scene.remove(light);
		scene.add(particles);
		particles.translateOnAxis(Y_AXIS, 25);
		particleMovement();
		score += 10000 - time * 0.5;
		document.getElementById("score").innerHTML = "Score: " + score;
    document.addEventListener( 'mousemove', cameraMovement, false);

    var endText = document.createElement('div');
    endText.style.position = 'absolute';
    endText.style.fontFamily = 'Verdana';
    endText.style.color = 'white';
    endText.innerHTML = "Congrats! You finished the maze! Your final time was: " + document.getElementById("timer").innerHTML + " Refresh to play again!";
    endText.style.top = 200 + 'px';
    endText.style.left = 200 + 'px';
    document.body.appendChild(endText);

}

function updateBall(){
	if ( collisionDetection(Math.floor( (ball.position.x + perimeterMaxX * wallWidth / 2) / wallWidth ),
			Math.abs(Math.ceil( (ball.position.z - perimeterMaxZ * wallDepth / 2) / wallDepth )), ball.position) ) {
		resolveCollision();
		score -= 50;
		document.getElementById("score").innerHTML = "Score: " + score;
	}
	else {
    if (running) {
			switch (true) {
			
				case key == "w":
					(ballVelocityZ < -maxVelocity)? -maxVelocity : ballVelocityZ -= 0.01;
					break;

				case key == "a":
					(ballVelocityX < -maxVelocity)? -maxVelocity : ballVelocityX -= 0.01;
					break;

				case key == "s":
					(ballVelocityZ > maxVelocity)? maxVelocity : ballVelocityZ += 0.01;
					break;

				case key == "d":
					(ballVelocityX > maxVelocity)? maxVelocity : ballVelocityX += 0.01;
					break;

			}
		}
	}
	switch (mode) {
		case "1st Person":
			camera.translateZ(ballVelocityZ);
			camera.translateX(ballVelocityX);
			ball.position.set(camera.position.x, camera.position.y, camera.position.z);
			break;

		case  "2":
			if (Math.abs(ballVelocityX) < maxVelocity) {
				ballVelocityX += targetRotationXAxis * -1;
			}
			if (Math.abs(ballVelocityZ) < maxVelocity) {
					ballVelocityZ += targetRotationZAxis;
			}
			ball.translateOnAxis(X_AXIS, ballVelocityX);
			ball.translateOnAxis(Z_AXIS, ballVelocityZ);
			break;
	}
}

var anchorX = new THREE.Mesh( new THREE.SphereGeometry(10), ballMaterial );
anchorX.visible = false;
var cameraPointX = new THREE.Mesh( new THREE.SphereGeometry(5), ballMaterial );
floor.add(anchorX);
anchorX.add(cameraPointX);
cameraPointX.position.set(anchorX.position.x + floorWidth, anchorX.position.y, anchorX.position.z);

function updateCamera() {
	switch (mode) {
		case "1st Person":
			var position = new THREE.Vector3().setFromMatrixPosition( cameraPointX.matrixWorld );
			position.y = ballRadius;
			camera.lookAt(position);
			raycaster.setFromCamera( mouse, camera );
			var intersects = raycaster.intersectObjects(floor.children);
			if (intersects.length > 0) {
				spotLight.target = intersects[0].object;
			}
			break;
	}
}

var oldX = 0;
var movement = false;
function cameraMovement( event ) {
		if (movement && event.clientX > oldX ) {
			anchorX.rotateOnAxis(Y_AXIS, -0.05);
		}
		if (movement && event.clientX < oldX)  {
			anchorX.rotateOnAxis(Y_AXIS, 0.05);
		}
		
		oldX = event.clientX;
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( (event.clientY) / (window.innerHeight) ) * 2 + 1;
}

//picking
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var score = 0;
function picking (event) {
			switch (event.which) {
				case 1://left click
					raycaster.setFromCamera( mouse, camera );
					var intersects = raycaster.intersectObjects(floor.children);
					if (intersects.length > 0) {
						var i = Math.floor((intersects[0].object.position.x + (perimeterMaxX * wallWidth / 2)) / wallWidth);
						var j = Math.abs(Math.ceil( (intersects[0].object.position.z - perimeterMaxZ * wallDepth / 2) / wallDepth ));
						//can't remove perimeter, ball, or goal
						if (intersects[0].object.position.z < floorDepth / 2 + wallDepth / 2 && intersects[0].object.position.z > -floorDepth / 2 - wallDepth / 2 &&
								intersects[0].object.position.x < floorWidth / 2 + wallWidth / 2 && intersects[0].object.position.x > -floorWidth / 2 - wallWidth / 2 &&
								intersects[0].object.position != ball.position && intersects[0].object.position != goal.position ) {
							if (intersects[0].object.position.y < floorHeight) {
								intersects[0].object.translateY(wallHeight * 2);
								cellList[i][j].position = intersects[0].object.position;
							}
							else {
								intersects[0].object.translateY(-wallHeight * 2);
								cellList[i][j].position = null;
							}
							if (mode == "1st Person") {
								score -= 500;
								document.getElementById("score").innerHTML = "Score: " + score;
							}
						}
					}
					break;
			case 3://right click
					movement = true;
					document.addEventListener( 'mouseup', onDocumentMouseUp, false );
					break;
		}
}

function checkSpikeCollision () {

    for (var i = 0; i < spikeList.length; i++)
    {
          var ballVector = new THREE.Vector3( ball.position.x, ball.position.y, ball.position.z);
          var spikeVector = new THREE.Vector3(spikeList[i].position.x, spikeList[i].position.y, spikeList[i].position.z);
          var directionVector = spikeVector.sub(ballVector);

          var ray = new THREE.Raycaster( ball.position, directionVector.normalize() );
          var intersections = ray.intersectObjects(spikeList);
          if ( intersections.length > 0 && intersections[0].distance <= ballRadius * 2 )
          {
              score -= 150;
							document.getElementById("score").innerHTML = "Score: " + score;

							if (mode == "1st Person") {
								reset();
								mode = "1st Person";
								document.addEventListener( 'mousedown', picking, false);
								document.addEventListener( 'mousemove', cameraMovement, false);
								camera.position.set(ball.position.x, ball.position.y, ball.position.z);
								light.intensity = 0.9;
							}
							else {
								reset();
							}
          }
    }
}

function reset() {
	controls.enabled = false;
	camera.position.set(0,400,0);
	camera.lookAt(scene.position);
	document.removeEventListener( 'mousemove', cameraMovement, false);
	document.removeEventListener( 'mousedown', picking, false);
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	ball.position.set(-floorWidth / 2 + wallWidth / 2, ballRadius, floorDepth / 2 - wallDepth / 2);
  ballVelocityZ = ballVelocityX = 0;
  floor.rotation.z = targetRotationXAxis = 0;
  floor.rotation.x = targetRotationZAxis = 0;
	scene.add(light);
	light.intensity = 1;
	mode = "";
}
var keyboard = new THREEx.KeyboardState();
var key;
var mode;

keyboard.domElement.addEventListener('keydown',function(event){
  if (event.repeat)
    return;

	else if (keyboard.eventMatches(event, "w")) {
			key = "w";
		}

		else if (keyboard.eventMatches(event, "a")) {
			key = "a";
		}

		else if (keyboard.eventMatches(event, "s")) {
			key = "s";
		}

		else if (keyboard.eventMatches(event, "d")) {
			key = "d";
		}
		else if(keyboard.eventMatches(event, "r")) {
			key = "r";
		}
		else if(keyboard.eventMatches(event, "1")) {
			reset();
			mode = "1st Person";
			document.addEventListener( 'mousedown', picking, false);
			document.addEventListener( 'mousemove', cameraMovement, false);
			camera.position.set(ball.position.x, ball.position.y, ball.position.z);
			light.intensity = 0.9;
		}
		else if(keyboard.eventMatches(event, "2")) {
			reset();
			mode = "2";
		}
		else if(keyboard.eventMatches(event, "3")) {
			reset();
			mode = "3";
			document.addEventListener( 'mousedown', picking, false);
			document.addEventListener( 'mousemove', cameraMovement, false);
		}
 });

 keyboard.domElement.addEventListener('keyup', function(event) {
	if (keyboard.eventMatches(event, "w")) {
		key = "";
	}

	else if (keyboard.eventMatches(event, "a")) {
		 key = "";
	}

	else if (keyboard.eventMatches(event, "s")) {
		key = "";
	}

	else if (keyboard.eventMatches(event, "d")) {
	 key = "";
	}
	
	else if (keyboard.eventMatches(event, "space")) {
			var position = new THREE.Vector3().setFromMatrixPosition( ball.matrixWorld );
			console.log(position)
			ball.position.set(goal.position.x, goal.position.y, goal.position.z);
	}
 });
 
function update() {
	if (mode == "2") {
		floor.rotation.z +=( targetRotationXAxis - floor.rotation.z) * 0.05;
		floor.rotation.x +=( targetRotationZAxis - floor.rotation.x) * 0.05;
	}
  fps = fpsHelper.getFPS();
  if ( document.getElementById("fpsCounter") != null) {
      document.getElementById("fpsCounter").innerHTML = "FPS: " + fps;
    }

	updateBall();
  checkSpikeCollision();
	updateCamera();
	if (checkGoal()) {
		gameEnd();
	}
  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

function startGame() {
  console.log("starting game");

  document.getElementById("startButton").removeEventListener("click", startGame);
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );

  startTimer();
  if (mode == "") {mode = "2"} else {mode = "1st Person"};
  if (mode == "1st Person") {

    document.addEventListener( 'mousedown', picking, false);
    document.addEventListener( 'mousemove', cameraMovement, false);
    camera.position.set(ball.position.x, ball.position.y, ball.position.z);
  }
  console.log(mode);
}
update();
