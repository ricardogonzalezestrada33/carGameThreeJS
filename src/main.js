import * as THREE from "three";
import { OrbitControls} from '../threejs/examples/jsm/controls/OrbitControls.js';
import GUI from '../threejs/examples/jsm/libs/lil-gui.module.min.js';

import * as CANNON from "../cannonjs/cannon-es.js";
import CannonDebugger from "../cannonjs/cannon-es-debugger.js";

let elThreejs = document.getElementById("threejs");
let camera,scene,renderer;

// helpers to debug
let axesHelper;
let controls;
let gui;

// show and move cube
let cubeThree;
let keyboard = {};

// camera follow player
let enableFollow;

// cannon variables
let world;
let cannonDebugger;
let timeStep = 1 / 60;
let cubeBody, planeBody;
let slipperyMaterial, groundMaterial;
let obstacleBody;


init();

function init() {

  // Scene
	scene = new THREE.Scene();

  // Camera
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
  camera.position.z = 5;
  camera.position.y = 1;


  // render
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.outputEncoding = THREE.sRGBEncoding;


  // axesHelper
	axesHelper = new THREE.AxesHelper( 100 );
	scene.add( axesHelper );

  // orbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.rotateSpeed = 1.0
  controls.zoomSpeed = 1.2
  controls.enablePan = false
  controls.dampingFactor = 0.2
  controls.minDistance = 10
  controls.maxDistance = 500
  controls.enabled = true

	elThreejs.appendChild(renderer.domElement);

  initCannon();

  addPlaneBody();
  addPlane();

  addCubeBody();
  addCube();

  addObstacleBody();
  addObstacle();

  addContactMaterials();

  addKeysListener();
	addGUI();

  animate()
}

function animate(){
	renderer.render(scene, camera);

  movePlayer();

  if (enableFollow) followPlayer();

  world.step(timeStep);
	cannonDebugger.update();

	requestAnimationFrame(animate);

}

function addCubeBody(){
  slipperyMaterial = new CANNON.Material('slippery')
  let cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  cubeBody = new CANNON.Body({ mass: 100,material: slipperyMaterial });
  cubeBody.addShape(cubeShape);
  cubeBody.position.set(0, 2, 0);
  world.addBody(cubeBody);
  console.log(cubeBody, "cubeBody");
}

function addCube(){
  let geometry = new THREE.BoxGeometry(1,1,1);
  let material = new THREE.MeshBasicMaterial({color: 'pink'});
  cubeThree = new THREE.Mesh(geometry, material);
  cubeThree.position.set(0, 0.5, 0);
  console.log(cubeThree, "cube");
  scene.add(cubeThree);
}


function addPlaneBody(){
  groundMaterial = new CANNON.Material('ground')
  const planeShape = new CANNON.Box(new CANNON.Vec3(10, 0.01, 100));
	planeBody = new CANNON.Body({ mass: 0, material: groundMaterial });
	planeBody.addShape(planeShape);
	planeBody.position.set(0, 0, -90);
	world.addBody(planeBody);
}



function addPlane(){
  let geometry =  new THREE.BoxGeometry(20, 0, 200);
  let material = new THREE.MeshBasicMaterial({color: 'gray'});
  let planeThree = new THREE.Mesh(geometry, material);
  planeThree.position.set(0, 0, -90);
  scene.add(planeThree);
}

function addObstacleBody(){
  let obstacleShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  obstacleBody = new CANNON.Body({ mass: 10 });
  obstacleBody.addShape(obstacleShape);
  obstacleBody.position.set(0, 0.5, -10);
  world.addBody(obstacleBody);
  console.log(obstacleBody, "cubeBody");
}

function addObstacle(){
  let geometry = new THREE.BoxGeometry(1,1,1);
  let material = new THREE.MeshBasicMaterial({color: 'red'});
  let obstacle = new THREE.Mesh(geometry, material);
  obstacle.position.set(0, 0.5, -10);
  scene.add(obstacle);
}


function addContactMaterials(){
  const slippery_ground = new CANNON.ContactMaterial(groundMaterial, slipperyMaterial, {
    friction: 0.0001,
    restitution: 0.3,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
  })

  // We must add the contact materials to the world
  world.addContactMaterial(slippery_ground)

}


function addKeysListener(){
  window.addEventListener('keydown', function(event){
    keyboard[event.keyCode] = true;
  } , false);
  window.addEventListener('keyup', function(event){
    keyboard[event.keyCode] = false;
  } , false);
}

function movePlayer(){

  // up letter W
  // if(keyboard[87]) cubeThree.position.z -= 0.1
  // if(keyboard[87]) cubeThree.translateZ(-0.1);
  const strengthWS = 200;
  const forceForward = new CANNON.Vec3(0, 0, -strengthWS)
  if(keyboard[87]) cubeBody.applyLocalForce(forceForward);

  // // down letter S
  const forceBack = new CANNON.Vec3(0, 0, strengthWS)
  if(keyboard[83]) cubeBody.applyLocalForce(forceBack);

  // left letter A
  // if(keyboard[65]) cube.rotation.y += 0.01;
  // if(keyboard[65]) cube.rotateY(0.01);
  const strengthAD = 20;
  const forceLeft= new CANNON.Vec3(0, strengthAD, 0)
  if(keyboard[65]) cubeBody.applyTorque(forceLeft);

  // // right letter D
  const forceRigth= new CANNON.Vec3(0, -strengthAD, 0)
  if(keyboard[68]) cubeBody.applyTorque(forceRigth);

}


function followPlayer(){
  camera.position.x = cubeThree.position.x;
  camera.position.y = cubeThree.position.y + 1;
  camera.position.z = cubeThree.position.z + 5;
}


function addGUI(){
  gui = new GUI();

  const options = {
		orbitsControls: true
	}

  gui.add(options, 'orbitsControls').onChange( value => {
		if (value){
			controls.enabled = true;
			enableFollow = false;
		}else{
			controls.enabled = false;
			enableFollow = true;
		}
	});

}

function initCannon() {
	// Setup world
	world = new CANNON.World();
	world.gravity.set(0, -9.8, 0);

	initCannonDebugger();
}

function initCannonDebugger(){
  cannonDebugger = new CannonDebugger(scene, world, {
		onInit(body, mesh) {
			// Toggle visibiliy on "d" press
			document.addEventListener("keydown", (event) => {
				if (event.key === "f") {
					mesh.visible = !mesh.visible;
				}
			});
		},
	});
}