// const log = console.log;
// MEMORY DETAILS
let MEMORY_ = {
    localStorage: {
        bestResult: 'bestResult',
        achievement: 'st-ach',
        installNo: 'installDismissed'
    }
}
// GAME DETAILS
let GAME_ = {
    // Get IOS, Android, Windows, Mac or Linux
    platform: (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) ? 'ios' : (navigator.userAgent.match(/(Android)/g)) ? 'android' : (navigator.userAgent.match(/(Windows)/g)) ? 'windows' : (navigator.userAgent.match(/(Mac)/g)) ? 'mac' : (navigator.userAgent.match(/(Linux)/g)) ? 'linux' : 'unknown',
    status: false,
    fpsCtrl: {
        forceLag: false, // Force lag to test lag warning (Make sure to disable it in production)
        // Wanted fps
        fps: 60,
        // Measured fps -> If this number is under fps/2 must take care
        mFps: 0,
        fpsInterval: 0,
        now: 0,
        then: 0,
        delta: 0,
        // Lag warning
        lagWarning: {
            enable: true, // Once the warning has been showed, disable it
            lastWarning: 0, // Enable the warning after 30 seconds
            frames: 0, // Count the frames, when started lagging. If the frames are over framesMax, show the warning
            framesMax: 60 * 3, // 3 seconds
        }
    },
    end: false,
    active: false, // ACTIVE THE GAME IN THE FIRST TIME
    score: 0,
    combo: 0,
    gamesPlayed: 0,
    bestResult: window.localStorage.getItem(MEMORY_.localStorage.bestResult) ?? 0,
    newRecord: false, // TO RESET SCREEN
    designPalette: 0,
    //
    // Stackoverflow: https://stackoverflow.com/questions/30628064/how-to-toggle-preservedrawingbuffer-in-three-js
    // Stackoverflow: https://stackoverflow.com/a/30647502
    screenshot: {
        service: true, // If this service mus be disable, change value to false
        enable: false,
        frames: 0,
        framesMax: 5,
        // Take screenshot after x frames 
        callback: null,
        blob: null
        // Image content buffer
    },
    botMode: false,
    confetti: {
        range: [30, 50],
    },
    zoomOut: {
        service: true, // If this service must be disable, change value to false
        enable: false,
        frames: 0,
        framesMax: 20,
        finished: false
    }, // Zoom out the camera fter every game over
    // DEFINE STACK COLOR
    colorDesign : [
        [30, 70, 50],
        [120, 80, 60],
        [224, 68, 62],
        [251, 50, 60],
        [339, 62, 48],
        [231, 50, 47],
        [165, 30, 68]
    ],

    // DEFINE BOX SIZE

    boxSize : {
        x: 3,
        y: 1,
        z: 3,
        range: 10
    },

    // DEFINE CAMERA POSITION
    c_width: 10,
    cameraPos : {
        width: 10,
        height: 10 * (window.innerHeight/window.innerWidth),
        near: 1,
        far: 100,
        size: (window.innerWidth > 700)? 1 : 2
    },
    // DEFINE VARIABLES
    world: undefined, 
    scene: undefined, 
    camera: undefined, 
    renderer: undefined, 
    fncStart: undefined,
    // STACK ARR
    stackBoxArr : [], 
    outBoxArr : [],
    achievement: JSON.parse(window.localStorage.getItem(MEMORY_.localStorage.achievement)) ?? {
        default: {
            message: "Default",
        },
        length: 0,
    },
    achievementUnlockMin: 4,
    // Sountrack list
    soundTrack: {
        menu: {
            name: "menu",
            current: null,
            next: null,
            list: [
                'Hello_its_Me_00_Pix_64kbps.mp3',
                // 'Dark_Sanctum_00_Uname_World_00kps.mp3'
            ],
        },
        game: {
            name: "game",
            current: [null, null, null],
            next: [null, null, null],
            list: [
                ['Begin_Your_Journey_', '_Pix_64kbps.mp3'],
                ['Dark_Sanctum_', '_Uname_World_00kps.mp3'],
            ],
        },
        other: {
            name: "other",
            list: [
                ['Start_Game_effect.mp3', 'start'],
                ['End_Game_effect.mp3', 'end'],
                ['New_Record_effect.mp3', 'newRecord'],
            ],
        },
        load: null,
        next: null,
    },

}

// ==================================

// PARTY FNC
function playConfetti(min, max){
    party.confetti(party.Rect.fromScreen(), {
        count: party.variation.range(min?min:60, max?max:80),
    });
}

// ALPHABOT v1.0 INTERNAL BOT FOR TESTING
function playBot(precision, timer, output=true){ //PRECISION BETWEEN 0 TO 1
    GAME_.unlockAchieve('cheater', 'Faker, cheater... 🤬');
    GAME_.botMode = true;
    let botTimer = setInterval(()=>{
        try {
            const lastLayer = GAME_.stackBoxArr[GAME_.stackBoxArr.length -1];
            const previousLayer = GAME_.stackBoxArr[GAME_.stackBoxArr.length -2];
        
            // LAST LAYER DIRECTION
            let lastDirection = lastLayer.direction;
        
            // CALCULATE OUTBOX 
            let delta = lastLayer.threejs.position[lastDirection] - previousLayer.threejs.position[lastDirection] // !NOTE: THE BOTH BOX MUST BE CALCULATED WITH THE SAME DIRECTION
            let alpha = Math.abs(delta); // GET POSITIVE NUM
        
            // CALCULATE OUTBOX WIDTH DEPTH
            let outbox = (lastDirection === "x")? lastLayer.width : lastLayer.depth;
            let inbox = outbox - alpha;
                
            const boxRelation = inbox / outbox; // 0 to 1
            if(boxRelation >= (precision?precision:0.95)){
                fncStart();
                if(output){
                    console.log(boxRelation); // OUTPUT
                }
            }
        } catch (e) {
            // BY DEFAULT START GAME
            fncStart();
        }
    }, timer?timer:20);
}

// LOAD MUSIC
GAME_.soundTrack.load = (type, list) => {
    let a;
    // Random list or set string
    let target = (list.constructor === Array) ? list[Math.floor(Math.random() * list.length)] : list
    // Two types: [menu, game, other]
    if (type == 'game') {
        a = [null, null, null];
        for(let i = 0; i < 3; i++) {
            a[i] = new Audio(`./music/${type}/${target[0]}0${i}${target[1]}`);
            a[i].loop = true;
            a[i].currentTime = 0;
            //
            a[i].addEventListener('ended', () => {
                this.currentTime = 0;
                this.play();
            }, false);
        }
    } else {
        a = new Audio(`./music/${type}/${target}`);
        a.currentTime = 0;
        if (type != "other") {
            // Add loop
            a.loop = true;
            // And force it in case that browser doesn't support it
            a.addEventListener('ended', () => {
                this.currentTime = 0;
                this.play();
            }, false);
        }        
    }

    return a;
}

// PASS TO NEXT AUDIO AND LOAD NEW
GAME_.soundTrack.next = (obj) => {
    obj.current = obj.next.slice(0);
    obj.next = null;
    obj.next = GAME_.soundTrack.load(obj.name, obj.list);
}


// PRELOAD MENU MUSIC AND BG MUSIC
GAME_.soundTrack.menu.current = GAME_.soundTrack.load('menu', GAME_.soundTrack.menu.list);
GAME_.soundTrack.game.current = GAME_.soundTrack.load('game', GAME_.soundTrack.game.list);
GAME_.soundTrack.game.next = GAME_.soundTrack.load('game', GAME_.soundTrack.game.list);

// PRELOAD SOUND EFFECT
GAME_.soundTrack.other.list.forEach(el => {
    GAME_.soundTrack.other[el[1]] = GAME_.soundTrack.load('other', el[0]);
});

window.addEventListener('load', ()=>{
    // PLAY MENU BG (NOT WORKING DUE PRIVILEGIES) 
    //!TODO CHANGE IT
    GAME_.soundTrack.menu.current.play();
    // CHECK USER BROSWER AND OS
    // IF OS == ios AND BROWSER == safari
    if(GAME_.platform === 'ios' && navigator.userAgent.match(/(Safari)/g)){
        document.querySelector('.pwa-install-title').innerText = "Apple StackBlock.io";
        document.querySelector('.pwa-install-description').innerHTML = `Download the APP in <img src="https://help.apple.com/assets/64F2669B7BEF8AE318002477/64F266A17BEF8AE3180024A8/en_US/d26fe35d3438fe81179a80c2b6c9b0c9.png" width="10" originalimagename="GlobalArt/IL_ShareBlue.png">`;
        document.querySelector('.pwa-install-button').innerHTML = `
        <a id="pwa-dismiss-btn" class="pwa-install-btn">Not now</a>
        <a id="pwa-install-btn" class="pwa-install-btn-apple" href="https://support.apple.com/en-gb/guide/iphone/iph42ab2f3a7/ios#iph4f9a47bbc">See more</a>
        `;
    }
    // DOM TAB
    let resultTabDom = document.querySelector('.result-area');
    let pointDom = document.querySelector('.point-result');
    let scoreTab = document.querySelector('.score-tab');
    let comboStrike = document.querySelector('.combo-strike');
    let comboExtraPoint = document.querySelector('.combo-extra-point');
    // EVENT LAYER DOM
    let eventLayer = document.querySelector('#click-event');
    // RECORD SHARE
    let recordShare = document.querySelector('#record-share');

    /* ==========================================
    =   FUNCTIONS
    ============================================*/
    function changeBackground(hslDark = false){
        let hex = hslToHex(GAME_.colorDesign[GAME_.designPalette][0] + 120 + (GAME_.stackBoxArr.length), GAME_.colorDesign[GAME_.designPalette][1], GAME_.colorDesign[GAME_.designPalette][2]);
        GAME_.scene.background = new THREE.Color(hex);

        // Add a dark layer background rgba(0, 0, 0, .8)
        if (hslDark) hex = hslToHex(GAME_.colorDesign[GAME_.designPalette][0] + 120 + (GAME_.stackBoxArr.length), GAME_.colorDesign[GAME_.designPalette][1], 10);
        // Change theme-color
        document.querySelector('meta[name="theme-color"]').setAttribute("content", hex);
        document.body.style.backgroundColor = hex;
        // Change msapplication-TileColor only with supported platforms
        if (GAME_.platform === 'windows')
            // Windows 8 and Related
            document.querySelector('meta[name="msapplication-TileColor"]').setAttribute("content", hex);
    }
    // EXTERNAL FNC
    function printPoints(num){
        pointDom.innerHTML = num;
    }
    // CREATE OUTBOX AND FALLING ANIMATION
    function addOutBox(x, z, width, depth){
        const layerY = GAME_.boxSize.y * (GAME_.stackBoxArr.length-1);

        const outBox = generateBox(x, layerY, z, width, depth, true);

        GAME_.outBoxArr.push(outBox);
    }
    function updatePhisics(){
        GAME_.world.step(1/60); // 60fps

        // FOREACH OUTBOX AND DEFINE THEIR POSITION
        GAME_.outBoxArr.forEach(i =>{
            i.threejs.position.copy(i.cannonjs.position); // EXTRACT ALL DATA TO THREEJS
            i.threejs.quaternion.copy(i.cannonjs.quaternion); // EXTRACT ALL DATA TO THREEJS
        });
    }
    // CREATE INLINE BOX
    function addLayer(x, z, width, depth, direction){
        const layerY = GAME_.boxSize.y * GAME_.stackBoxArr.length; // ELEVATE LAYER LEVEL ONCE THE BOX HAS BEEN PUSHED

        const layer = generateBox(x, layerY, z, width, depth, false);
        layer.direction = direction;
        layer.positive = true; // THE NEW BOX WILL MOVE INTO POSITIVE VALUES

        GAME_.stackBoxArr.push(layer);

    }
    function generateBox(x, y, z, width, depth, animation = false){

        let colorPath = (animation) ? (GAME_.stackBoxArr.length-1)*4 : GAME_.stackBoxArr.length*4; // IF IT IS AN OUTBOX, GENERATE THE SAME COLOR AS THE INBOX

        const color = new THREE.Color(hslToHex(GAME_.colorDesign[GAME_.designPalette][0] + (colorPath), GAME_.colorDesign[GAME_.designPalette][1], GAME_.colorDesign[GAME_.designPalette][2]));

        const geometry = new THREE.BoxGeometry(width, GAME_.boxSize.y, depth);
        const material = new THREE.MeshLambertMaterial({ color });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);

        // FALL ANIMATION (CANNONJS)
        const shape = new CANNON.Box(
            new CANNON.Vec3(width/2, (GAME_.boxSize.y)/2, depth/2) // CENTER
        );
        let mass = animation ? 5 : 0; // WHEN THE OBJECT HAS GOT 0 AS VALUE THE OBJECT WILL NOT BE AFFECTED BY THE GRAVITY
        const body = new CANNON.Body({ mass, shape });
        body.position.set(x, y, z);
        GAME_.world.addBody(body);
        // ADD ITEM TO SCENE
        GAME_.scene.add(mesh);

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
    // CHANGE CAMERA DATA
    function refreshCameraView() {
        GAME_.camera.right = GAME_.cameraPos.width / GAME_.cameraPos.size;
        GAME_.camera.left = GAME_.cameraPos.width / -GAME_.cameraPos.size;
        GAME_.camera.top = GAME_.cameraPos.height / GAME_.cameraPos.size; 
        GAME_.camera.bottom = GAME_.cameraPos.height / -GAME_.cameraPos.size;
        GAME_.camera.updateProjectionMatrix();
    }
    // GET ms NOW()
    function timeNow() {
        if ('now' in window) return now();
        if ('now' in performance && 'performance' in window) return performance.now();
        return Date.now();
    }

    function matchLadscape() {
        // If it's landscape change in <meta> viewport-fit from contaion to cover
        let content = document.querySelector('meta[name="viewport"]').getAttribute("content");

        // Check if browser support matchMedia
        if ('matchMedia' in window) {
            if (window.matchMedia("(orientation: landscape)").matches) {
                document.querySelector('meta[name="viewport"]').setAttribute("content", content.replace("contain", "cover"));
            } else {
                document.querySelector('meta[name="viewport"]').setAttribute("content", content.replace("cover", "contain"));
            }
        } else {
            // If not supported, check if it's landscape
            if (window.innerHeight > window.innerWidth) {
                document.querySelector('meta[name="viewport"]').setAttribute("content", content.replace("contain", "cover"));
            } else {
                document.querySelector('meta[name="viewport"]').setAttribute("content", content.replace("cover", "contain"));
            }
        }
    }

    function resizeCanvas() {
        // Resize canvas
        GAME_.cameraPos.height = GAME_.c_width * (window.innerHeight/window.innerWidth);
        GAME_.cameraPos.size = (window.innerWidth > 700)? 1 : 2;
        refreshCameraView()

        // Resize canvas
        GAME_.renderer.setSize(window.innerWidth, window.innerHeight);
        GAME_.renderer.render(GAME_.scene, GAME_.camera);
    }

    function alertLog(text){
        // Reset
        document.querySelector('#noti-popup').classList.remove('display');
        // Push
        document.querySelector('#noti-popup-text').innerHTML = text;
        document.querySelector('#noti-popup').classList.add('display');
        setTimeout(() => document.querySelector('#noti-popup').classList.remove('display')
        ,
        5200 // IF YOU CAHNGE THE DELAY TIME, YOU MUST CHANGE CSS CODE
        );
    }

    GAME_.unlockAchieve = (achieve, message) => {
        if (achieve in GAME_.achievement)
            return;

        // Save
        GAME_.achievement[achieve] = {
            message
        }

        GAME_.achievement.length++;
        // console.log(GAME_.achievement[achieve]);
        if (GAME_.achievement.length > GAME_.achievementUnlockMin)
            document.body.classList.add('unlocked-achie');

        // Show
        document.querySelector('#achie-text .message').innerHTML = message;
        // Reset
        document.querySelector('#achie-popup').classList.remove('display');
        // Push
        document.querySelector('#achie-popup').classList.add('display');
        setTimeout(() => document.querySelector('#achie-popup').classList.remove('display')
        ,
        5200 // IF YOU CAHNGE THE DELAY TIME, YOU MUST CHANGE CSS CODE
        );
        // Save memory
        localStorage.setItem(MEMORY_.localStorage.achievement, JSON.stringify(GAME_.achievement));
    }
    // Set global
    let unlockAchieve = GAME_.unlockAchieve;
    if (GAME_.achievement.length > GAME_.achievementUnlockMin)
        document.body.classList.add('unlocked-achie');
    
    // RESET COLISION WORLD AND SCENE AND OTHER STUFFS (LIKE MY MADNESS BECAUSE THERE ARE MANY BUGS)
    function reset(){
        GAME_.designPalette = Math.floor(Math.random() * GAME_.colorDesign.length);

        // CAMERA
        GAME_.cameraPos.size = (window.innerWidth > 700)? 1 : 2;
        refreshCameraView();
        GAME_.camera.position.set(4, 4, 4);
        GAME_.camera.lookAt(0, 0, 0);

        // OPEN zoomOut
        GAME_.zoomOut.finished = false;

        // SCENE & WORLD
        GAME_.stackBoxArr.forEach(i =>{
            GAME_.scene.remove(i.threejs);

			// clean up
			i.geometry.dispose();
			i.material.dispose();

            //====
            GAME_.world.removeBody(i.cannonjs);
        });
        GAME_.outBoxArr.forEach(i =>{
            GAME_.scene.remove(i.threejs);

			// clean up
			i.geometry.dispose();
			i.material.dispose();

            //====
            GAME_.world.removeBody(i.cannonjs);
        });

        GAME_.stackBoxArr = [], GAME_.outBoxArr = [];

        // POINTS AND COMBO
        GAME_.score = 0;
        GAME_.combo = 0;

        // RESET BG
        changeBackground();

        // FIRST LAYER
        addLayer(0, 0, GAME_.boxSize.x, GAME_.boxSize.z, 'x'); // TOP LEVEL

        // DISABLE PWA IF EXIST
        document.querySelector('#pwa-install').classList.remove('display');

        // REMOVE NEW RECORD SHARE
        recordShare.classList.remove('display');

        // REMOVE NOTI
        document.querySelector('#noti-popup').classList.remove('display');
    }

    // =============================================
    // WORLD DEFINE
    GAME_.world = new CANNON.World();
    GAME_.world.gravity.set(0, -9.8, 0);
    GAME_.world.broadphase = new CANNON.NaiveBroadphase();
    GAME_.world.solver.interations = 40;

    // SHOW BEST RESULT
    printPoints(GAME_.bestResult);

    // CREATE THE SCENE AND DECORATE IT
    GAME_.scene = new THREE.Scene();
    changeBackground(hslDark = true);    

    addLayer(0, 0, GAME_.boxSize.x, GAME_.boxSize.z, 'x'); // TOP LEVEL


    // ILUMINATION
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    GAME_.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 20, 0);
    GAME_.scene.add(directionalLight);

    // CAMERA
    GAME_.camera = new THREE.OrthographicCamera(
        GAME_.cameraPos.width / -GAME_.cameraPos.size, // left
        GAME_.cameraPos.width / GAME_.cameraPos.size, // right
        GAME_.cameraPos.height / GAME_.cameraPos.size, // top
        GAME_.cameraPos.height / -GAME_.cameraPos.size, // bottom
        GAME_.cameraPos.near, // near
        GAME_.cameraPos.far // far
    );
    GAME_.camera.position.set(4, 4, 4);
    GAME_.camera.lookAt(0, 0, 0);

    // RENDER SCENE
    GAME_.renderer = new THREE.WebGLRenderer(
        { 
            antialias: true,
            // preserveDrawingBuffer: true 
        });
    GAME_.renderer.setSize(window.innerWidth, window.innerHeight);
    GAME_.renderer.render(GAME_.scene, GAME_.camera);

    GAME_.renderer.domElement.id = "Stackblock";
    // DISPLAY
    document.body.querySelector('#game').appendChild(GAME_.renderer.domElement);

    // GET CONFETTI RANGE
    if ('deviceMemory' in navigator) {
        if (navigator.deviceMemory <= 32) {
            GAME_.confetti.range = [
                Math.log2(navigator.deviceMemory) * 10,
                Math.log2(navigator.deviceMemory) * 10 + 20,
            ].map(Math.round);
            // Calculate the range of <RAM> to set confetti particles
        } else {
            GAME_.confetti.range = [50, 70]; // MAX
        }
    }

    /*===============================
    =  GAME CORE
    ================================*/
    fncStart = ()=>{

        // ACTIVE GAME STATUS
        if(!GAME_.status){

            // FIRST TIME PLAYING THE GAME?
            if(!GAME_.active){
                // ANIMATION FRAME 60fps
                // renderer.setAnimationLoop(animation);   -------> Doesn't have FPS control. Call 1/fps --> Higher FPSs higher velocity

                // IS THE forceLag ENABLED?
                GAME_.fpsCtrl.fps = (GAME_.fpsCtrl.forceLag) ? GAME_.fpsCtrl.fps/2 : GAME_.fpsCtrl.fps;
                // FPS
                GAME_.fpsCtrl.fpsInterval = 1000 / GAME_.fpsCtrl.fps; // IN ms
                GAME_.fpsCtrl.then = timeNow();
                animation();

                GAME_.active = true; // ACTIVE GAME

                // CHANGE BEST_SCORE TO SCORE
                scoreTab.querySelector('.score').innerHTML = "SCORE";

            }else{
                reset(); // WHEN IT ISN'T THE FIRST TIME, ONLY HAVE TO RESET THE WORLD
            }

            // PLAY TRANSITION START
            GAME_.soundTrack.other.start.currentTime = 0;  // Move audio start to beginning
            GAME_.soundTrack.other.start.play();


            // STOP MENU BG MUSIC
            GAME_.soundTrack.menu.current.currentTime = 0;  // Move audio start to beginning
            GAME_.soundTrack.menu.current.pause();

            // START GAME MUSIC
            GAME_.soundTrack.game.current[0].play();

            printPoints(GAME_.score); // = 0

            // ADD ACTION LAYER
            addLayer(0, 0, GAME_.boxSize.x, GAME_.boxSize.z, 'z');
            // DISABLE RSULT AND DISPLAY POINTS
            resultTabDom.classList.toggle('disable');
            pointDom.classList.toggle('active');
    
            // REMOVE GAME-END
            document.body.classList.remove('game-end');

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
            const lastLayer = GAME_.stackBoxArr[GAME_.stackBoxArr.length -1];
            const previousLayer = GAME_.stackBoxArr[GAME_.stackBoxArr.length -2];

            // LAST LAYER DIRECTION
            let lastDirection = lastLayer.direction;

            // CALCULATE OUTBOX 
            let delta = lastLayer.threejs.position[lastDirection] - previousLayer.threejs.position[lastDirection] // !NOTE: THE BOTH BOX MUST BE CALCULATED WITH THE SAME DIRECTION
            let alpha = Math.abs(delta); // GET POSITIVE NUM

            // CALCULATE OUTBOX WIDTH DEPTH
            let outbox = (lastDirection === "x")? lastLayer.width : lastLayer.depth;
            let inbox = outbox - alpha;
            if(inbox > 0){
                const boxRelation = inbox / outbox; // 0 to 1
                // CHECK IF THE BOX IS CLOSE TO THE CENTER
                if(alpha < 0.2){
                    // ADD COMBO
                    if([9, 19, 29, 39, 49].includes(GAME_.combo)){// ADD 10 EXTRA POINTS IN EVERY x10 COMBOS
                        // playConfetti(30, 50); // YEAAAAAAAAAAAAAAAH
                        // DON'T ADD COFFETIES BECAUSE THE ANIMATION CAUSE LAG

                        // IN ADDITION CAN BE ADDED +10 ANIMATION
                        comboExtraPoint.classList.add('active');
                        setTimeout(()=>{
                            comboExtraPoint.classList.remove('active'); // HAS GOT CSS TRANSITION DELAY
                        }, 1100);

                        GAME_.score += 10;
                    }

                    GAME_.combo += 1;

                    switch (GAME_.combo) {
                        case 10:
                            unlockAchieve('combo', 'Combo Master');
                            break;
                        case 20:
                            unlockAchieve('combo2', 'Combo Super Master');
                            break;
                        case 30:
                            unlockAchieve('combo3', 'Combo Super Master God');
                            break;
                    }

                    // SHOW TEXT
                    comboStrike.innerHTML = `x${GAME_.combo}`;
                    comboStrike.classList.add('open'); // VISIBLE

                    setTimeout(()=>{
                        comboStrike.classList.remove('open'); // HAS GOT CSS TRANSITION DELAY
                    }, 700);

                }else if(GAME_.combo){
                    // REMOVE THE COMBO
                    GAME_.combo = 0; // SAD :(
                }


                // CUT TOP LAYER
                newWidth = (lastDirection === "x")? inbox : lastLayer.width;
                newDepth = (lastDirection === "z")? inbox : lastLayer.depth;

                lastLayer.width = newWidth;
                lastLayer.depth = newDepth;

                lastLayer.threejs.scale[lastDirection] = boxRelation; // SCALE TO BOX RELATION

                // MOVE TO POSITIVE IF THE BOX IS MOVING IN POSITIVE AND NEGATIVE IF IT'S MOVING IN NEGATIVE RESPECT THE LAST ONE 
                lastLayer.threejs.position[lastDirection] -= delta / 2; 
                // UPDATE PHISICS AND CREATE THE NEW SHAPE
                lastLayer.cannonjs.position[lastDirection] -= delta / 2; 
                const shape = new CANNON.Box(
                    new CANNON.Vec3(newWidth/2, (GAME_.boxSize.y)/2, newDepth/2) // CENTER
                );

                lastLayer.cannonjs.shapes = [];
                lastLayer.cannonjs.addShape(shape);

                //CHECK THAT THE OUTBOX IS NOT TOO SMALL
                if(alpha >= 0.01){
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
                }
                // NEW LAYER ==================
                let x = (lastDirection === "x")? lastLayer.threejs.position.x : -(GAME_.boxSize.range-1); // AVOID COLAPSE WITH LIMIT COLISION IN -10
                let z = (lastDirection === "z")? lastLayer.threejs.position.z : -(GAME_.boxSize.range-1); // AVOID COLAPSE WITH LIMIT COLISION IN -10

                let direction = (lastDirection === "x")? "z" : "x";

                // ADD NEW ONE
                addLayer(x, z, newWidth, newDepth, direction);
                // ADD ONE POINT
                GAME_.score++;

                printPoints(GAME_.score);

            }else{
                // FIRST TIME PLAYING o_O
                unlockAchieve('noob', 'First time playing');

                // FINISH THE GAME
                GAME_.end = true; // GAME.isEnd();
                // FALL ANIMATION (CANNONJS)
                GAME_.world.remove(lastLayer.cannonjs); // FIRST REMOVE THE STATIC BODY

                const shape = new CANNON.Box(
                    new CANNON.Vec3(lastLayer.width/2, GAME_.boxSize.y/2, lastLayer.depth/2) // CENTER
                );
                let mass = 5; // WHEN THE OBJECT HAS GOT 0 AS VALUE THE OBJECT WILL NOT BE AFFECTED BY THE GRAVITY
                const body = new CANNON.Body({ mass, shape });
                body.position.set(lastLayer.threejs.position.x, lastLayer.threejs.position.y, lastLayer.threejs.position.z);
                GAME_.world.addBody(body); // ADD THE DYNAMIC BODY

                lastLayer.cannonjs = body;

                // STOP RENDERING LAYERS, BUT THE PHISICS STILL WORKING
                // ACTIVE RSULT AND DISPLAY POINTS
                resultTabDom.classList.toggle('disable');
                pointDom.classList.toggle('active');

                document.body.classList.add('game-end')
                
                GAME_.status = false;

                // STOP GAME BG
                GAME_.soundTrack.game.current[0].pause();
                GAME_.soundTrack.next(
                    GAME_.soundTrack.game
                );

                // CHECK BEST SCORE
                if(GAME_.score > GAME_.bestResult){
                    // START NEW RECORD SOUND EFFECT
                    //!TODO This is a rick roll music, don't enable it
                    // GAME_.soundTrack.other.newRecord.currentTime = 0;
                    // GAME_.soundTrack.other.newRecord.play();

                    playConfetti(GAME_.confetti.range[0], GAME_.confetti.range[1]); // PARTY YEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH!!!!!!!!!!!!

                    // UPDATE LOCALSTORAGE
                    if (!GAME_.botMode) {
                        GAME_.bestResult = GAME_.score;
                        window.localStorage.setItem(MEMORY_.localStorage.bestResult, GAME_.score);
                    }

                    // SHOW NEWRECORD
                    scoreTab.classList.add('new');

                    // ACTIVE RECORD MODE
                    GAME_.newRecord = true;

                    if (GAME_.screenshot.service) {
                        // CALLBACK
                        GAME_.screenshot.callback = img => {
                            recordShare.replaceChild(img, recordShare.querySelector('img'));
                            // SHOW ANIMATION: SHAKY SHAKY SHAKIRA
                            recordShare.classList.add('display');
                        }
                        GAME_.screenshot.enable = true;
                    }
                } 
                //!TODO ADD TWO TYPES OF BG AFTER END
                // else {
                    // START END SOUND EFFECT
                    GAME_.soundTrack.other.end.currentTime = 0;
                    GAME_.soundTrack.other.end.play();
                // }

                // START MENU BG
                GAME_.soundTrack.menu.current.play();
                
                // ACTIVE ZOOMOUT
                if (GAME_.zoomOut.service)
                    GAME_.zoomOut.enable = true;

                let dismissed = localStorage.getItem(MEMORY_.localStorage.installNo) ?? false; // Better than localStorage.getItem("installDismissed") || false
                // CHECK PWA INSTALLATION (1.0.4 version)
                if (enableDownload && (dismissed == "false" || !dismissed)){
                    document.querySelector('#pwa-install').classList.add('display');
                    if(GAME_.gamesPlayed > 0){
                        document.querySelector('#pwa-dismiss-btn').classList.add('display');
                    }
                }
                GAME_.gamesPlayed++;
            }
        }

        // CHANGE BG
        changeBackground(hslDark = GAME_.end);
    }

    function draw() {
        if(!GAME_.end){
            // MOVE TOP LAYER
            const layer = GAME_.stackBoxArr[GAME_.stackBoxArr.length -1];
            const speed = (layer.positive) ? 0.15 : -0.15;

            // CHECK LIMIT
            if(layer.threejs.position[layer.direction] >= (GAME_.boxSize.range-5)){ // LIMIT 5
                layer.positive = false;
            }
            if(layer.threejs.position[layer.direction] <= -(GAME_.boxSize.range-5)){ // LIMIT -5
                layer.positive = true;
            }
            layer.threejs.position[layer.direction] += speed;
            layer.cannonjs.position[layer.direction] += speed;

            // MOVE CAMERA INTO THE TOP
            // 4 IS THE CURRENT Y
            if(GAME_.camera.position.y < GAME_.boxSize.y * (GAME_.stackBoxArr.length - 2) + 4){
                GAME_.camera.position.y += speed;
            }

        }else{
            // FINISH LAST BOX ANIMATION
            GAME_.stackBoxArr[GAME_.stackBoxArr.length-1].threejs.position.copy(GAME_.stackBoxArr[GAME_.stackBoxArr.length-1].cannonjs.position); // EXTRACT ALL DATA TO THREEJS
            GAME_.stackBoxArr[GAME_.stackBoxArr.length-1].threejs.quaternion.copy(GAME_.stackBoxArr[GAME_.stackBoxArr.length-1].cannonjs.quaternion); // EXTRACT ALL DATA TO THREEJS

            // CHECK IF ZOOM OUT IS ENABLED
            if (GAME_.zoomOut.enable) {
                GAME_.cameraPos.size -= 0.02;
                refreshCameraView();

                GAME_.zoomOut.frames ++;

                if (GAME_.zoomOut.frames >= GAME_.zoomOut.framesMax) {
                    GAME_.zoomOut.enable = false;
                    GAME_.zoomOut.frames = 0;
                    GAME_.zoomOut.finished = true;
                }
            }
        }
        
        updatePhisics();
        GAME_.renderer.render(GAME_.scene, GAME_.camera);

        // CHECK IF CLIENT REQUESTED TO TAKE A SCREENSHOT
        // This section of code must be executed after renderer.render(scene, camera) to avoid buffer cleaning
        // Once the canvas(webgl2) buffer has been cleaned, it can not take screenshot anymore.
        if (GAME_.screenshot.enable) {
            // TAKE THE SCREENSHOT AFTER 5 FRAMES FOR MORE PRECISE IMAGE STATUS
            if(GAME_.screenshot.frames >= GAME_.screenshot.framesMax) {
                // TAKE THE SCREENSHOT AFTER ZOOMOUT, NOT BEFORE OR IN PROCESS
                if(GAME_.zoomOut.finished) {
                    // CREATE A EXTRA CANVAS
                    DrawCanvasCopy(GAME_.renderer.domElement,
                        ctx => {
                            // BG
                            ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                            // TEXT
                            ctx.fillStyle = "#ffffff";
                            ctx.font = '32px monospace';

                            var textString = "NEW RECORD",
                                textWidth = ctx.measureText(textString).width;


                            ctx.fillText(textString , (ctx.canvas.width/2) - (textWidth / 2), ctx.canvas.height / 2 - 100);
                            
                            // RECORD
                            ctx.font = 'bold 64px monospace';

                            textString = GAME_.score;
                            textWidth = ctx.measureText(textString).width;

                            ctx.fillText(textString , (ctx.canvas.width/2) - (textWidth / 2), ctx.canvas.height/ 2 + 50);

                            if (GAME_.botMode) {
                                ctx.save();
                                ctx.translate(ctx.canvas.width/2, ctx.canvas.height/2 + 50);
                                ctx.rotate(-Math.PI/8);
                                // Text
                                var fontsize = 64;
                                ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
                                ctx.font = `bold ${fontsize}px monospace`;
                                var lineHeight = fontsize * 1.286, padding = 10;
                                textString = "FAKE"
                                textWidth = ctx.measureText(textString).width;
                                ctx.fillText(textString, -(textWidth / 2), 0);
                                // Rect
                                ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                                ctx.lineWidth = 5;
                                ctx.strokeRect(-(textWidth/2 + padding), -(lineHeight/2 + padding), textWidth + padding*2, lineHeight/2 + padding*1.5);
                                ctx.restore();
                            }                            
                        },
                        blob => {
                            const img = document.createElement("img");
                            const url = URL.createObjectURL(blob);

                            img.onload = () => {
                                // no longer need to read the blob so it is revoked
                                URL.revokeObjectURL(url);
                            };

                            img.src = url;

                            // SAVE BLOB
                            GAME_.screenshot.blob = blob;

                            GAME_.screenshot.callback(img);
                        });

                    // DISABLE OPTION, IF THE PROCESS HAS SUCCESS OF FAILED SHOULD DISABLE.
                    // OTHERWISE WITH THE DELAY OF THE CALLBACK THE FUNCTION WILL BE CALLED MULTIPLE TIMES
                    GAME_.screenshot.enable = false;
                    GAME_.screenshot.frames = 0;
                }
            } else {
                GAME_.screenshot.frames++;
            }
        }
    }

    function animation(){
        requestAnimationFrame(animation);

        GAME_.fpsCtrl.now = timeNow();
        GAME_.fpsCtrl.elapsed = GAME_.fpsCtrl.now - GAME_.fpsCtrl.then;

        // if enough time has elapsed, draw the next frame
        if (GAME_.fpsCtrl.elapsed > GAME_.fpsCtrl.fpsInterval) {
            // Measure fps
            GAME_.fpsCtrl.mFps = Math.round(1000 / GAME_.fpsCtrl.elapsed) - (GAME_.fpsCtrl.forceLag ? 30 : 0);
            // Check lag
            if (GAME_.fpsCtrl.mFps < GAME_.fpsCtrl.fps / 2) {
                if (GAME_.fpsCtrl.lagWarning.frames >= GAME_.fpsCtrl.lagWarning.framesMax) {
                    // Lag warning
                    if (GAME_.fpsCtrl.lagWarning.lastWarning + 30000 < GAME_.fpsCtrl.now) {
                        GAME_.fpsCtrl.lagWarning.lastWarning = GAME_.fpsCtrl.now;
                        GAME_.fpsCtrl.lagWarning.enable = true;
                    }
                
                    if (GAME_.fpsCtrl.lagWarning.enable) {
                        GAME_.fpsCtrl.lagWarning.enable = false;
                        alertLog("May be laggy. Try to close other apps");

                        // Reset frames
                        GAME_.fpsCtrl.lagWarning.frames = 0;
                    }
                } else {
                    GAME_.fpsCtrl.lagWarning.frames++;
                }
            } else {
                // Reset frames
                GAME_.fpsCtrl.lagWarning.frames = 0;
            }

            // Get ready for next frame by setting then = now
            GAME_.fpsCtrl.then = GAME_.fpsCtrl.now - (GAME_.fpsCtrl.elapsed % GAME_.fpsCtrl.fpsInterval);
            // SAFE TO DRAW
            draw();
        }
    }

    // Change orientation
    // matchLadscape();     -----> Don't really need it now

    let supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
    let eventType = supportsTouch ? 'touchstart' : 'mousedown';
    eventLayer.addEventListener(eventType, fncStart); // ADD FNC

    let keyFree = true;
    // PC Version
    // Run fncStart function when the user press space key
    window.addEventListener('keydown', function(e){

        // Space key
        if(e.keyCode === 32 || e.keyCode === 40 || e.key === " "){
            e.preventDefault();
            if(keyFree){
                keyFree = false;
                fncStart();
            }
        }
    });

    // Liberate the key to be pressed again
    window.addEventListener('keyup', function(e){
        if(e.keyCode === 32 || e.keyCode === 40 || e.key === " "){
            keyFree = true;
        }
    });

    // Window resize (For mobile devices when scroll or hide toolbar)
    window.addEventListener('resize', (e) => resizeCanvas());

    // Window Orientation Change
    window.addEventListener('orientationchange', (e) => {
        // Change orientation
        // matchLadscape();   ----> Works better without this function
        // Resize canvas
        resizeCanvas();
    });

    // Unlock achie section
    document.querySelector('#unlock-achie').addEventListener('click', () => document.body.classList.add('lobby'));
    document.querySelector('#lock-achie').addEventListener('click', () => document.body.classList.remove('lobby'));

    // SHARE RECORD
    recordShare.addEventListener(eventType, async () => {
        if(!(await Blob2Share(GAME_.screenshot.blob, (GAME_.platform == 'ios' ? true : false)))){
            // Blob2Download(GAME_.screenshot.blob);  ---> We don't want surprise downloads
            alertLog("Unable to share. Take screenshot 📸");
        }

    });

    // USER LEAVE
    document.addEventListener("visibilitychange", e => {
        if (GAME_.end) {
            if (document.hidden) {
                GAME_.soundTrack.menu.current.pause();
            } else {
                GAME_.soundTrack.menu.current.play();
            }
        }
    }, false);

    alertLog("This is an <span style='background: rgb(255, 100, 0);'><b>&nbsp;experimental version&nbsp;</b></span>, don't consider this a final version");
});