// Simple three.js example
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

var mesh, renderer, scene, camera, controls,armSkeleton;

function init() {
  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  // scene
  scene = new THREE.Scene();
  // camera
  camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set( 20, 20, 20 );
  // controls
  // controls = new OrbitControls( camera );
  // ambient
  scene.add( new THREE.AmbientLight( 0x222222 ) );
  // light
  var light = new THREE.DirectionalLight( 0xffffff, 1 );
  light.position.set( 20, 20, 0 );
  scene.add( light );
  // axes
  scene.add( new THREE.AxesHelper( 20 ) );
  // geometry
  var geometry = new THREE.SphereGeometry( 5, 12, 8 );
  // material
  var material = new THREE.MeshPhongMaterial( {
      color: 0x00ffff, 
      flatShading: true,
      transparent: true,
      opacity: 0.7,
  } );
  // mesh
  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

var bones = [];

var shoulder = new THREE.Bone();
var elbow = new THREE.Bone();
var hand = new THREE.Bone();

shoulder.add( elbow );
elbow.add( hand );

bones.push( shoulder );
bones.push( elbow );
bones.push( hand );

shoulder.position.y = -5;
elbow.position.y = 0;
hand.position.y = 5;

  armSkeleton = new THREE.Skeleton( bones );  
  console.log('Skeleton after creation',armSkeleton)
    
}

function animate() {

    requestAnimationFrame( animate );

    renderer.render( scene, camera );

}
export function saveSkeleton(){
  init();

  var options = {
    trs: false,
    onlyVisible: true,
    truncateDrawRange: true,
    embedImages: true,
    animations: [],
    forceIndices: false,
    forcePowerOfTwoTextures: false
  }; 
  
  // Instantiate a exporter
  var exporter = new GLTFExporter( options );
  
  //Create dummy mesh to attach skeleton to
  var geometry = new THREE.SphereBufferGeometry( 5, 32, 32 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  var mesh = new THREE.SkinnedMesh( geometry, material );
  
  var rootBone = armSkeleton.bones[ 0 ];
  mesh.add( rootBone );
  mesh.bind( armSkeleton );  
  

  // Parse the input and generate the     glTF output
  exporter.parse(
    mesh, 
    (gltf) => {
      const blob = new Blob([JSON.stringify(gltf)], { type: 'text/json' });
      const objURL = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = 'result.gltf';
      a.href = objURL;
      a.click();
    }, 
    options
  );  
}