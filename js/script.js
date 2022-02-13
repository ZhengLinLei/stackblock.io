// GAME DETAILS
let GAME_ = {
    status: false,
    end: false,
    active: false, // ACTIVE THE GAME IN THE FIRST TIME
    score: 0,
    bestResult: (window.localStorage.getItem('bestResult')) ? window.localStorage.getItem('bestResult') : 0,
    newRecord: false, // TO RESET SCREEN
    designPalette: 0
}

// ==================================
// DEFINE STACK COLOR
const colorDesign = [
    [30, 50, 70],
    [200, 80, 60]
];

// DEFINE BOX SIZE
const boxSize = {
    x: 3,
    y: 1,
    z: 3,
    range: 10
}
// DEFINE CAMERA POSITION
const c_width = 10;
const cameraPos = {
    width: c_width,
    height: c_width * (window.innerHeight/window.innerWidth),
    near: 1,
    far: 100,
    size: (window.innerWidth > 700)? 1 : 2
}

// DEFINE VARIABLES
let world, scene, camera, renderer;
// STACK ARR
let stackBoxArr = [], outBoxArr = [];


window.addEventListener('load', ()=>{
    // DOM TAB
    let resultTabDom = document.querySelector('.result-area');
    let pointDom = document.querySelector('.point-result');
    let scoreTab = document.querySelector('.score-tab');
    /* ==========================================
    =   FUNCTIONS
    ============================================*/
    function changeBackground(){
        scene.background = new THREE.Color(hslToHex(colorDesign[GAME_.designPalette][0] + 120 + (stackBoxArr.length*4), colorDesign[GAME_.designPalette][1], colorDesign[GAME_.designPalette][2]));
    }
    // EXTERNAL FNC
    function printPoints(num){
        pointDom.innerHTML = num;
    }
    // CREATE OUTBOX AND FALLING ANIMATION
    function addOutBox(x, z, width, depth){
        const layerY = boxSize.y * (stackBoxArr.length-1);

        const outBox = generateBox(x, layerY, z, width, depth, true);

        outBoxArr.push(outBox);
    }
    function updatePhisics(){
        world.step(1/60); // 60fps

        // FOREACH OUTBOX AND DEFINE THEIR POSITION
        outBoxArr.forEach(i =>{
            i.threejs.position.copy(i.cannonjs.position); // EXTRACT ALL DATA TO THREEJS
            i.threejs.quaternion.copy(i.cannonjs.quaternion); // EXTRACT ALL DATA TO THREEJS
        });
    }
    // CREATE INLINE BOX
    function addLayer(x, z, width, depth, direction){
        const layerY = boxSize.y * stackBoxArr.length; // ELEVATE LAYER LEVEL ONCE THE BOX HAS BEEN PUSHED

        const layer = generateBox(x, layerY, z, width, depth, false);
        layer.direction = direction;
        layer.positive = true; // THE NEW BOX WILL MOVE INTO POSITIVE VALUES

        stackBoxArr.push(layer);

    }
    function generateBox(x, y, z, width, depth, animation = false){

        let colorPath = (animation) ? (stackBoxArr.length-1)*4 : stackBoxArr.length*4; // IF IT IS AN OUTBOX, GENERATE THE SAME COLOR AS THE INBOX

        const color = new THREE.Color(hslToHex(colorDesign[GAME_.designPalette][0] + (colorPath), colorDesign[GAME_.designPalette][1], colorDesign[GAME_.designPalette][2]));

        const geometry = new THREE.BoxGeometry(width, boxSize.y, depth);
        const material = new THREE.MeshLambertMaterial({ color });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);

        // FALL ANIMATION (CANNONJS)
        const shape = new CANNON.Box(
            new CANNON.Vec3(width/2, boxSize.y/2, depth/2) // CENTER
        );
        let mass = animation ? 5 : 0; // WHEN THE OBJECT HAS GOT 0 AS VALUE THE OBJECT WILL NOT BE AFFECTED BY THE GRAVITY
        const body = new CANNON.Body({ mass, shape });
        body.position.set(x, y, z);
        world.addBody(body);
        // ADD ITEM TO SCENE
        scene.add(mesh);

        return {
            threejs: mesh,
            geometry,
            material, // SET IT TO BE CLEANED 
            cannonjs: body,
            x,
            y,
            z,
            width,
            depth
        }
    }


    // COLOR HSL TO HEX
    function hslToHex(h, s, l) {
        l = (l>101)?100:l;
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }
    
    // RESET COLISION WORLD AND SCENE
    function reset(){
        // GAME_.designPalette = Math.floor(Math.random() * colorDesign.length);

        // CAMERA
        camera.position.set(4, 4, 4);
        camera.lookAt(0, 0, 0);

        // SCENE & WORLD
        stackBoxArr.forEach(i =>{
            scene.remove(i.threejs);

			// clean up
			i.geometry.dispose();
			i.material.dispose();

            //====
            world.removeBody(i.cannonjs);
        });
        outBoxArr.forEach(i =>{
            scene.remove(i.threejs);

			// clean up
			i.geometry.dispose();
			i.material.dispose();

            //====
            world.removeBody(i.cannonjs);
        });

        stackBoxArr = [], outBoxArr = [];

        // POINTS
        GAME_.score = 0;

        // FIRST LAYER
        addLayer(0, 0, boxSize.x, boxSize.z, 'x'); // TOP LEVEL
        
    }
    // =============================================
    // WORLD DEFINE
    world = new CANNON.World();
    world.gravity.set(0, -9.8, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.interations = 40;

    // SHOW BEST RESULT
    printPoints(GAME_.bestResult);

    // CREATE THE SCENE AND DECORATE IT
    scene = new THREE.Scene();
    changeBackground();

    addLayer(0, 0, boxSize.x, boxSize.z, 'x'); // TOP LEVEL


    // ILUMINATION
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 20, 0);
    scene.add(directionalLight);

    // CAMERA
    camera = new THREE.OrthographicCamera(
        cameraPos.width / -cameraPos.size, // left
        cameraPos.width / cameraPos.size, // right
        cameraPos.height / cameraPos.size, // top
        cameraPos.height / -cameraPos.size, // bottom
        cameraPos.near, // near
        cameraPos.far // far
    );
    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);

    // RENDER SCENE
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    // DISPLAY
    document.body.appendChild(renderer.domElement);

    //=====================================
    /*===============================
    =  GAME CORE
    ================================*/
    const fncStart = ()=>{

        // ACTIVE GAME STATUS
        if(!GAME_.status){

            // FIRST TIME PLAYING THE GAME?
            if(!GAME_.active){
                // ANIMATION FRAME 60fps
                renderer.setAnimationLoop(animation);
                GAME_.active = true; // ACTIVE GAME
            }else{
                reset(); // WHEN IT ISN'T THE FIRST TIME, ONLY HAVE TO RESET THE WORLD
            }

            printPoints(GAME_.score); // = 0

            // ADD ACTION LAYER
            addLayer(0, 0, boxSize.x, boxSize.z, 'z');
            // DISABLE RSULT AND DISPLAY POINTS
            resultTabDom.classList.toggle('disable');
            pointDom.classList.toggle('active');

            // DISABLE NEW RECORD
            if(GAME_.newRecord){
                GAME_.newRecord = false;

                scoreTab.classList.remove('new');
            }

            // ACTIVE GAME
            GAME_.status = true;
            GAME_.end = false;
        }else{
            // INIT
            let newWidth, newDepth;
            // ========
            const lastLayer = stackBoxArr[stackBoxArr.length -1];
            const previousLayer = stackBoxArr[stackBoxArr.length -2];

            // LAST LAYER DIRECTION
            let lastDirection = lastLayer.direction;

            // CALCULATE OUTBOX 
            let delta = lastLayer.threejs.position[lastDirection] - previousLayer.threejs.position[lastDirection] // !NOTE: THE BOTH BOX MUST BE CALCULATED WITH THE SAME DIRECTION
            let alpha = Math.abs(delta); // GET POSITIVE NUM

            // CALCULATE OUTBOX WIDTH DEPTH
            let outbox = (lastDirection === "x")? lastLayer.width : lastLayer.depth;
            let inbox = outbox - alpha;

            if(inbox > 0){
                // CUT TOP LAYER
                newWidth = (lastDirection === "x")? inbox : lastLayer.width;
                newDepth = (lastDirection === "z")? inbox : lastLayer.depth;

                lastLayer.width = newWidth;
                lastLayer.depth = newDepth;

                lastLayer.threejs.scale[lastDirection] = inbox / outbox;

                // MOVE TO POSITIVE IF THE BOX IS MOVING IN POSITIVE AND NEGATIVE IF IT'S MOVING IN NEGATIVE RESPECT THE LAST ONE 
                lastLayer.threejs.position[lastDirection] -= delta / 2; 
                // UPDATE PHISICS AND CREATE THE NEW SHAPE
                lastLayer.cannonjs.position[lastDirection] -= delta / 2; 
                const shape = new CANNON.Box(
                    new CANNON.Vec3(newWidth/2, boxSize.y/2, newDepth/2) // CENTER
                );

                lastLayer.cannonjs.shapes = [];
                lastLayer.cannonjs.addShape(shape);

                // OUTBOX FALLING =============
                let outboxCenter = Math.sign(delta) * ((inbox / 2) + (alpha / 2)); // ALSO YOU CAN USE Math.sign(delta) = delta + (alpha-1)
                // THIS VARIABLE CALCULATE THE POSITION OF THE OUTBOX
                // THE MIDDLE OF THE OUTBOX SIZE + MIDDLE OF THE INBOX SIZE = OUTBOX CENTER POSITION
                const outboxPos = {
                    x: (lastDirection === "x")? lastLayer.threejs.position.x + outboxCenter : lastLayer.threejs.position.x,
                    z: (lastDirection === "z")? lastLayer.threejs.position.z + outboxCenter : lastLayer.threejs.position.z,
                    width: (lastDirection === "x")? alpha : newWidth,
                    depth: (lastDirection === "z")? alpha: newDepth
                }
                // ADD OUTBOX
                addOutBox(outboxPos.x, outboxPos.z, outboxPos.width, outboxPos.depth);
                // NEW LAYER ==================
                let x = (lastDirection === "x")? lastLayer.threejs.position.x : -(boxSize.range-1); // AVOID COLAPSE WITH LIMIT COLISION IN -10
                let z = (lastDirection === "z")? lastLayer.threejs.position.z : -(boxSize.range-1); // AVOID COLAPSE WITH LIMIT COLISION IN -10

                let direction = (lastDirection === "x")? "z" : "x";

                // ADD NEW ONE
                addLayer(x, z, newWidth, newDepth, direction);
                // ADD ONE POINT
                GAME_.score++;
                printPoints(GAME_.score);

            }else{
                // FINISH THE GAME
                GAME_.end = true; // GAME.isEnd();
                // FALL ANIMATION (CANNONJS)
                world.remove(lastLayer.cannonjs); // FIRST REMOVE THE STATIC BODY

                const shape = new CANNON.Box(
                    new CANNON.Vec3(lastLayer.width/2, boxSize.y/2, lastLayer.depth/2) // CENTER
                );
                let mass = 5; // WHEN THE OBJECT HAS GOT 0 AS VALUE THE OBJECT WILL NOT BE AFFECTED BY THE GRAVITY
                const body = new CANNON.Body({ mass, shape });
                body.position.set(lastLayer.threejs.position.x, lastLayer.threejs.position.y, lastLayer.threejs.position.z);
                world.addBody(body); // ADD THE DYNAMIC BODY

                lastLayer.cannonjs = body;

                // STOP RENDERING LAYERS, BUT THE PHISICS STILL WORKING
                // ACTIVE RSULT AND DISPLAY POINTS
                resultTabDom.classList.toggle('disable');
                pointDom.classList.toggle('active');
                
                GAME_.status = false;


                // CHECK BEST SCORE
                if(GAME_.score > GAME_.bestResult){
                    playConfetti(); // PARTY YEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH!!!!!!!!!!!!

                    // UPDATE LOCALSTORAGE
                    GAME_.bestResult = GAME_.score;
                    window.localStorage.setItem('bestResult', GAME_.score);

                    // SHOW NEWRECORD
                    scoreTab.classList.add('new');

                    // ACTIVE RECORD MODE
                    GAME_.newRecord = true;
                }

            }
        }
    }

    function animation(){
        if(!GAME_.end){
            // MOVE TOP LAYER
            const layer = stackBoxArr[stackBoxArr.length -1];
            const speed = (layer.positive) ? 0.15 : -0.15;

            // CHECK LIMIT
            if(layer.threejs.position[layer.direction] >= (boxSize.range-5)){ // LIMIT 5
                layer.positive = false;
            }
            if(layer.threejs.position[layer.direction] <= -(boxSize.range-5)){ // LIMIT -5
                layer.positive = true;
            }
            layer.threejs.position[layer.direction] += speed;
            layer.cannonjs.position[layer.direction] += speed;

            // MOVE CAMERA INTO THE TOP
            // 4 IS THE CURRENT Y
            if(camera.position.y < boxSize.y * (stackBoxArr.length - 2) + 4){
                camera.position.y += speed;
            }

        }else{
            // FINISH LAST BOX ANIMATION
            stackBoxArr[stackBoxArr.length-1].threejs.position.copy(stackBoxArr[stackBoxArr.length-1].cannonjs.position); // EXTRACT ALL DATA TO THREEJS
            stackBoxArr[stackBoxArr.length-1].threejs.quaternion.copy(stackBoxArr[stackBoxArr.length-1].cannonjs.quaternion); // EXTRACT ALL DATA TO THREEJS
        }
        
        updatePhisics();
        renderer.render(scene, camera);
        
    }


    let supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
    let eventType = supportsTouch ? 'touchstart' : 'click';
    window.addEventListener(eventType, fncStart); // ADD FNC
});


// PARTY FNC
function playConfetti(){
    party.confetti(party.Rect.fromScreen(), {
        count: party.variation.range(60, 80),
    });
}