
const socket = io.connect("http://localhost:2000")

title = document.getElementById("title")

socket.on("counter", (arg) => {
	console.log("in counter", arg)
    title.innerHTML = parseInt(arg) + " people here!";
});

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}


// loads the song
// const song = new Audio("assets/sound/guitarsounds" + getRandomInt(5) + ".mp3")

// the sound socket
socket.on("sound", () => {
	const song = new Audio("assets/sound/guitarsounds" + getRandomInt(5) + ".mp3")
	song.play()
	console.log("Sound")
	console.log(song)
})

class Game{
	constructor(){
		if (! Detector.webgl){
			Detector.addGetWebGLMessage();
		}
		
		// setting the various properties of this class
		this.container;
		this.player = {};
		this.stats;
		this.controls;
		this.camera;
		this.scene;
		this.renderer;

		// const interaction = new Interaction(this.renderer, this.scene, this.camera);
		
		this.container = document.createElement('div');
		this.container.style.height = '100%';
		document.body.appendChild(this.container);
        
		let game = this;
		
		// asssets path to have easy access
		this.assetsPath = '../assets/';
		
		this.clock = new THREE.Clock();
        
		// calling the init function
        this.init();

		window.onError = (error) => {
			console.error(JSON.stringify(error));
		}
	}
	
	init() {

		// CAMERA
		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 20000);
		this.camera.position.set(1000, 400, 0);
        
		// SCENE 
		this.scene = new THREE.Scene();

		// AMBIENT LIGHT
        let ambient = new THREE.AmbientLight(0x00000);
        this.scene.add( ambient );

		// HEMISPHERE LIGHT
		let light = new THREE.HemisphereLight(0xdddddd, 0x444444, 1);
		light.position.set(0, 200, 0);
		this.scene.add(light);

		const pointLight = new THREE.PointLight( 0xff0000, 1, 100 );
		pointLight.position.set( 1000, 1000, 1000 );
		this.scene.add( pointLight );

		// MODEL
		let loader = new THREE.FBXLoader();
		let game = this;
		
		this.loadEnvironment(loader);
		
		// enable the shaow map for the renderer
		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = false;
		this.container.appendChild(this.renderer.domElement);
        
		// orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 150, 0);
        this.controls.update();
		
		window.addEventListener('resize', () => {
			game.onWindowResize()
		}, false)
	}
	
    loadEnvironment(loader){
		let game = this;

		// where to find our fbx file
		loader.load(`assets/fbx/musicShop.fbx`, (object) => {

			// adds interaction element to the three.js scene
			const interaction = new THREE.Interaction(this.renderer, this.scene, this.camera);

			// allows us to work with complicated animations
			game.environment = object;
			// game.colliders = [];
			game.scene.add(object);

			// turns the mouse into a cursor when hovering over scene
            object.cursor = "pointer"

			// plays the sound once the mouse hase been released
			object.on('mouseup', (ev) => {
				// console.log(ev)
				// emit a click event
				socket.emit("click")
				// console.log(song)
			});
			// going through all the children of this elemetn
			object.traverse( (child) => {
				// if the object is a mesh, then do the following
				if (child.isMesh){
					if (child.name.startsWith("proxy")){
						game.colliders.push(child);
						child.material.visible = false;
					} else {
						child.castShadow = true;
						child.receiveShadow = true;
					}
				}
			} );
			
			game.animate();
		})
	}
    
	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( window.innerWidth, window.innerHeight );

	}

	animate() {
		let game = this;
		let dt = this.clock.getDelta();

		requestAnimationFrame(() => {
			game.animate();
		})
		
		// requestAnimationFrame( function(){ game.animate(); } );
		
		// rendering the scene
		this.renderer.render(this.scene, this.camera);

	}
}