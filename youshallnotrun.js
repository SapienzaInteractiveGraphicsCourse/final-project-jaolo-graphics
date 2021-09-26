//            //
//  VARIABLES //
//            //

//
// Parameters
//
var scene, camera, renderer;
var cube;
var startingPosition = new THREE.Vector3(-12,-10,-5);
var speed = 0.005;

//
// Player variables
//
var healthPoints,potionLogo,coinLogo;
var potionScale = 1;
var currentPotion_position = new THREE.Vector3();
var coin_position = new THREE.Vector3();
var potions = [];
var score, score_text, score_layout;
var isGrounded = true;
var isVulnerable = true;
var dmg_function;
var isInvulnerable = false;
var isInvisible = false;
var resetInvulnerable_function;

//
// Game master variables
//
var isPlaying = false;
var isGameOver = false;
var trees_spawn,threats_spawn,coins_spawn,stars_spawn;
var difficulty = 1;
var loading_percentage;
var manager;

//
// Colliders variables
//
var cauldron_hitBox,arrow_hitBox,gandalf_hitBox,coins_hitBox;
var hitBoxes_array = []; 
var collider_system;
var colliders_array = [];
var gandalf_collider, cauldron_collider, arrow_collider, threat_collider,coin_collider;
var gandalf_helper, threat_helper,coin_helper;
var helpers_array = [];

//
// Audio variables
//
var threats_audio;
var audio_listener, audio_context, audio_loader;
var home_audio, swamp_audio, gameOver_audio, gandalf_audio, arrow_audio, cauldron_audio, coin_audio, star_audio, invulnerable_audio;

//
// Spawn position variables
//
var trees_onScreen = [];
var coins_onScreen = [];
var threats = [];
var threats_onScreen = [];
var spawn_position = 30, flush_position = -30;
var coin_yAxis = 3, coin_xAxis = 28;
var tree_xAxis = 28;


var isStepChange = true;

//
// Textures variables
//
var texture_loader, gltf_loader;
var tutorial_array = [];    
var page_current;
var isOnTutorial = false;
var backGround_texture, backGround_material, transparent_texture;
var logo_texture;
var tutorial_1;

//
// Models variable
//
var gandalf_model, gandalf_group;
var gandalf_textures = [];
var tree_model, coin_model, star_model, cauldron_model, arrow_model;
var mixers = [];
var isLoaded = false;

//
// Animations variables
//
var animation_flag = 0; 
var idle_speed = 2;
var jump_speed = 5;   // 5 easy 6 medium 7 hard
var land_speed = 5;
var isJumping = false; 
var isLanding = false;
var isReady = false;
var isFading = false;
var isFaded = false;
var legLeft_position;
var legRight_position;

//
// Gandalf hierarchy
//
var torso, gandalf, leg_left, foot_left, leg_right, foot_right, arm_left, forearm_left, hand_left, head, arm_right, forearm_right, hand_right;

//            //
//  FUNCTIONS //
//            //


//        //
// BASIC  //
//        //

gameManager();

/**
 * init
 */
function init() {
  scene = new THREE.Scene();
  
  // rendering
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setClearColor(0xffffff);
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.gammaFactor = 2;
  renderer.gammaOutput = true;
  document.body.appendChild( renderer.domElement );
  window.addEventListener( 'resize', resize, false);

  // lights
  var h_light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  h_light.position.set( 0, 300, 0 );
  var d_light = new THREE.DirectionalLight( 0xffffff );
  d_light.position.set( 75, 300, -75 );
  scene.add( d_light );
  scene.add( h_light );
  
  // camera
  camera = new THREE.PerspectiveCamera( 30 , window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.position.z = 50;

  // manager
  manager = new THREE.LoadingManager();
  manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
     loading_percentage = 1;
  };

  
  // loading
  const progressBar = document.querySelector( '#progress' );
  const loadingOverlay = document.querySelector( '#loading-overlay' );
  manager.onLoad = function ( ) {
     setTimeout(() => {
       isLoaded = true;
       audioManager();

       loadingOverlay.classList.add( 'loading-overlay-hidden' );
       progressBar.style.width = 0;
       loading_percentage = 0;
     }, 1000);
  };

  manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    loading_percentage = Math.round(itemsLoaded / itemsTotal * 100, 2) + '%';
    progressBar.style.width = loading_percentage;
    if ( loading_percentage >= 100 )
      loading_percentage = 1;
  };
  manager.onError = function ( url ) {
	   console.log( 'Error loading ', url );
  };

  // loaders
  texture_loader = new THREE.TextureLoader(manager);
  gltf_loader = new THREE.GLTFLoader(manager);
  audio_loader = new THREE.AudioLoader(manager);

  // audio
  audio_listener = new THREE.AudioListener();
  camera.add( audio_listener );

  // home audio
  home_audio = new THREE.Audio(audio_listener);
  audio_loader.load( '/res/sounds/theshire.mp3', function( buffer ) {
    home_audio.setBuffer( buffer );
    home_audio.setLoop( true );
    home_audio.setVolume( 0.5 );
  });

  // swamp audio
  swamp_audio = new THREE.Audio(audio_listener);
  audio_loader.load( '/res/sounds/swamp-sounds.mp3', function( buffer ) {
    swamp_audio.setBuffer( buffer );
    swamp_audio.setLoop( true );
    swamp_audio.setVolume( 0.3 );
  });

  // game over audio
  gameOver_audio = new THREE.Audio(audio_listener);
  audio_loader.load( '/res/sounds/gameover.mp3', function( buffer ) {
    gameOver_audio.setBuffer( buffer );
    gameOver_audio.setLoop( true );
    gameOver_audio.setVolume( 0.3 );
  });

  // gandalf audio
  gandalf_audio = new THREE.Audio(audio_listener);
  audio_loader.load( '/res/sounds/no.mp3', function( buffer ) {
    gandalf_audio.setBuffer( buffer );
    gandalf_audio.setLoop( false );
    gandalf_audio.setVolume( 0.6 );
  });

  // arrow audio
  arrow_audio = new THREE.Audio(audio_listener);
  audio_loader.load( '/res/sounds/arrow.mp3', function( buffer ) {
    arrow_audio.setBuffer( buffer );
    arrow_audio.setLoop( false );
    arrow_audio.setVolume( 0.5 );
  });

  // cauldron audio
  cauldron_audio = new THREE.Audio(audio_listener);
  audio_loader.load( '/res/sounds/cauldron.mp3', function( buffer ) {
    cauldron_audio.setBuffer( buffer );
    cauldron_audio.setLoop( false );
    cauldron_audio.setVolume( 0.3 );
  });

  // coin audio
  coin_audio = new THREE.Audio(audio_listener);
  audio_loader.load( '/res/sounds/coins.mp3', function( buffer ) {
    coin_audio.setBuffer( buffer );
    coin_audio.setLoop( false );
    coin_audio.setVolume( 0.3 );
  });

  // star audio
  star_audio = new THREE.Audio(audio_listener);
  audio_loader.load( '/res/sounds/coins.mp3', function( buffer ) {
    star_audio.setBuffer( buffer );
    star_audio.setLoop( false );
    star_audio.setVolume( 0.3 );
  });

  // invulnerable audio
  invulnerable_audio = new THREE.Audio(audio_listener);
  audio_loader.load( '/res/sounds/powerup2.mp3', function( buffer ) {
    invulnerable_audio.setBuffer( buffer );
    invulnerable_audio.setLoop( false );
    invulnerable_audio.setVolume( 0.6 );
  });


  // background Texture
  var texture = texture_loader.load("final-project-jaolo-graphics/res/bg/bgtry.jpg")
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = 16;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1,1);
  backGround_material = new THREE.MeshBasicMaterial({map: texture});
  var background_geometry = new THREE.PlaneGeometry(75,33,25);
  backGround_texture = new THREE.Mesh(background_geometry,backGround_material);
  backGround_texture.position.z = -13;
  scene.add(backGround_texture);
  var transparentbg_material = new THREE.MeshBasicMaterial({color: 0x000000});
  transparentbg_material.opacity = 0.7;
  transparentbg_material.transparent = true;
  var transparentbg_geometry = new THREE.PlaneGeometry(75,33,25);
  transparent_texture = new THREE.Mesh(transparentbg_geometry, transparentbg_material);
  transparent_texture.position.z = -12;
  scene.add(transparent_texture);

  // tutorial 
  page_current = 0;
  var page_1 = texture_loader.load("/res/howto/HowToPlay1.png");
  page_1.encoding = THREE.sRGBEncoding;
  page_1.anisotropy = 16;
  var window_material = new THREE.MeshBasicMaterial({map: page_1});
  window_material.transparent = true;
  var window_geometry = new THREE.PlaneGeometry(48,27,25);
  tutorial_1 = new THREE.Mesh(window_geometry,window_material);
  tutorial_1.position.z = -11;
  tutorial_array.push(page_1);

  var page_2 = texture_loader.load("/res/howto/HowToPlay2.png");
  page_2.encoding = THREE.sRGBEncoding;
  page_2.anisotropy = 16;
  tutorial_array.push(page_2);
  var page_3 = texture_loader.load("/res/howto/HowToPlay3.png");
  page_3.encoding = THREE.sRGBEncoding;
  page_3.anisotropy = 16;
  tutorial_array.push(page_3);

  // logo
  var logo = texture_loader.load("/res/textures/logo_gandalf.png");
  logo.encoding = THREE.sRGBEncoding;
  logo.anisotropy = 16;
  var logo_material = new THREE.MeshLambertMaterial({map: logo});
  logo_material.transparent = true;
  var logo_geometry = new THREE.PlaneGeometry(18, 12, 12);
  logo_texture = new THREE.Mesh(logo_geometry,logo_material);
  logo_texture.position.x = 0;
  logo_texture.position.y = 5;
  logo_texture.position.z = -5;
  scene.add(logo_texture);

  // colliders
  collider_system = new THREEx.ColliderSystem();
  var cauldron_box = new THREE.BoxGeometry(4,3,2)
  var cauldron_hitBoxMaterial = new THREE.MeshBasicMaterial({color:0x000000});
  cauldron_hitBox = new THREE.Mesh(cauldron_box,cauldron_hitBoxMaterial);
  cauldron_hitBox.name = "cauldron_box";
  cauldron_hitBox.visible = false;

  var arrow_box = new THREE.BoxGeometry( 3, 3, 3 );
  var arrow_hitBoxMaterial = new THREE.MeshBasicMaterial({color:0xbfbf2e});
  arrow_hitBox = new THREE.Mesh(arrow_box,arrow_hitBoxMaterial);
  arrow_hitBox.name = "arrow_box";
  arrow_hitBox.visible = false;

  var coin_box = new THREE.BoxGeometry(1,2,1);
  var coin_material = new THREE.MeshBasicMaterial({color:0x000000});
  coins_hitBox = new THREE.Mesh(coin_box,coin_material);
  coins_hitBox.name = "coins_hitBox";
  coins_hitBox.visible = false;


  var gandalf_box = new THREE.BoxGeometry(3,8,4); 
  var gandalf_material = new THREE.MeshBasicMaterial({color:0x111111});
  gandalf_hitBox = new THREE.Mesh(gandalf_box, gandalf_material);
  gandalf_hitBox.name = "gandalf_box";
  gandalf_hitBox.visible = false;
  gandalf_collider = new THREEx.Collider.createFromObject3d(gandalf_hitBox);
  gandalf_collider.name = "gandalf_collider";
  colliders_array.push(gandalf_collider);
  gandalf_helper	= new THREEx.ColliderHelper(gandalf_collider);
	gandalf_helper.material.color.set('green');
  helpers_array.push(gandalf_helper);

  var hit_register = gandalf_collider.addEventListener('contactEnter',function(collision){
    if (collision.object3d.name == "cauldron_box") {
      if (isVulnerable && !isInvulnerable) {
        dmg_function = setInterval(function() {
          hitRegister();
          console.log(collision);
        },16.6);
        isVulnerable = false;
        setTimeout(() => {blink(false);},0);
        setTimeout(() => {blink(true);},200);
        setTimeout(() => {blink(false);},400);
        setTimeout(() => {blink(true);},600);
      }
    }

    if(collision.object3d.name == "arrow_box") {
      if (isVulnerable && !isInvisible && !isInvulnerable) {
        dmg_function = setInterval(function() {
          hitRegister();
        },16.6);
        isVulnerable = false;
        setTimeout(() => {blink(false);},0);
        setTimeout(() => {blink(true);},200);
        setTimeout(() => {blink(false);},400);
        setTimeout(() => {blink(true);},600);
    }
    }
    
    if (collision.name == "coin_collider") {
      score++;
    }

    gandalf_helper.material.color.set('red');
  });

  var hit_register = gandalf_collider.addEventListener('contactExit',function(collision){
    console.log('contactExit with', collision.id);
    gandalf_helper.material.color.set('green');
  });

  setDom();
  homeScreen();

}

/**
 * render
 */
 function render() {

  if (isGameOver)
    flushObjects();

  if (isPlaying) {
    backGround_material.map.offset.x += speed * 0.5 + difficulty / 1000;
    star_material.map.offset.y += speed * 4;
    update();
  }

  requestAnimationFrame( render );
  renderer.render( scene, camera );

}

/**
 * game manager
 */
 function gameManager() {

  init();
  loadModels();
  setKeyBoardControls();
  render();
  }

  /**
 * audio manager
 */
function audioManager() {
  if (audio_context && audio_context.state !== 'running') {
    audio_context.resume();
    }
  if (isGameOver) {
    swamp_audio.stop();
    threats_audio.stop();
    gameOver_audio.play();
  }
  else if (isPlaying) {
    if(gameOver_audio.isPlaying)  
      gameOver_audio.stop();
    home_audio.stop();
    swamp_audio.play();
  }
  else  
    home_audio.play();
}

/**
 * removes everything from screen
 */
 function flushObjects(){

  positionFix();
  scene.remove(gandalf_group);

  for (var i = 0; i < threats_onScreen.length ; i++) {
    scene.remove(threats_onScreen[i]);
  }

  for (var j = 0; j < trees_onScreen.length; j++) {
    scene.remove(trees_onScreen[j]);
  }

  for (var w = 0; w < coins_onScreen.length; w++) {
    scene.remove(coins_onScreen[w]);
  }
  for (var x = 0; x < hitBoxes_array.length; x++) {
    scene.remove(hitBoxes_array[x]);
  }

  potions = [];
  threats_onScreen = [];
  trees_onScreen = [];
  coins_onScreen = [];
  hitBoxes_array = [];
  colliders_array.splice(1,colliders_array.length-2);
}

/**
 * window resize
 */
function resize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

/**
 * start game
 */
function startGame() {
  isPlaying = true;
  resetState();
  loadHUD();
  audioManager();

  threats_spawn = setInterval(function() {
    spawnThreats();
  },9000/difficulty);

  trees_spawn = setInterval(function() {
    spawnTrees();
  }, 3000);

  coins_spawn = setInterval(function() {
    spawnCoin();
  }, 2000);

  stars_spawn = setInterval(function() {
    spawnStar();
  },10000 * difficulty);

  scene.remove(transparent_texture);
  scene.remove(logo_texture);
  scene.add(gandalf_group);
}

/**
 * reset gandalf state
 */
function resetState() {
    loadHierarchy();
    jump_speed = 4 + difficulty;
    animation_flag = 0;
    isGrounded = true;
    isVulnerable = true;
    isReady = false;
    isStepChange = true;
    isLanding = isJumping = isFading = false;
    score = 0;
    healthPoints = 5;
    isGameOver = false;
}

/**
 * set keyboard controls : up and w to jump, down and s to fade
 */
 function setKeyBoardControls() {
  document.onkeydown = function(e) {
        switch (e.keyCode) {
          // up, w
          case 87:
          case 38:
            
            if (isGrounded && isPlaying) {
              isJumping = true;
              isGrounded = false;
            }
            break;
          // down, s
          case 83:
          case 40:
            if (isGrounded && isPlaying) {
              
              isFading = true;
              isGrounded = false;
            
            }
            break;
        }
      };
}

/**
 * checks if game over
 */
 function gameOverCheck() {
  if (isPlaying && healthPoints == 0) {
    isGameOver = true;
    isPlaying = false;
    clearInterval(trees_spawn);
    clearInterval(coins_spawn);
    clearInterval(threats_spawn);
    removeHUD();
    flushObjects();
    gameOverScreen();
    audioManager();
  }
}

//              //
// HTML SCREENS //
//              //

/**
 * home 
 */
function homeScreen() {
  isPlaying = false;
  page_current = 0;
  tutorial_1.material.map = tutorial_array[page_current];
  scene.add(logo_texture);
  setDifficulty();

  
  if (isOnTutorial) {
    scene.remove(tutorial_1);
    body.removeChild(close_button);
    if (document.getElementById("prev"))  body.removeChild(document.getElementById("prev"));
    if (document.getElementById("next")) body.removeChild(document.getElementById("next"));

    var playbutton = document.createElement('button');
    playbutton.setAttribute('id', "play_button");
    btns.appendChild(playbutton);
    play_button.className = "button play_button";
    play_button.innerHTML = "Play";

    var tutorialbutton = document.createElement('button');
    tutorialbutton.setAttribute('id', "tutorial_button");
    btns.appendChild(tutorialbutton);
    tutorial_button.className = "button tutorial_button";
    tutorial_button.innerHTML = "Tutorial";
  }

  document.getElementById("play_button").onclick = function(){
    if (isLoaded) {
      btns.removeChild(play_button);
      btns.removeChild(tutorial_button);
      body.removeChild(document.getElementById("difficulty"));

      startGame();

    }
  };

  document.getElementById("tutorial_button").onclick = function() {
      if (isLoaded) {
        isOnTutorial = true;
        tutorialScreen();
      }
  };
}

/**
 * tutorial
 */
function tutorialScreen() {
    scene.remove(logo_texture);
    scene.add(tutorial_1);
    btns.removeChild(play_button);
    btns.removeChild(tutorial_button);
    body.removeChild(document.getElementById("difficulty"));
    var button = document.createElement('button');
    button.setAttribute('id', "close_button");
    body.appendChild(button);
    close_button.className = "button1 close_button";
    close_button.innerHTML = "X";
    nextButton();
    document.getElementById("close_button").onclick = function() {
      homeScreen();
    }
}
/**
 * next button
 */
function nextButton() {
  var button = document.createElement('button');
  button.setAttribute('id', "next");
  body.appendChild(button);
  next.className = "button1 next";
  next.href = "#";
  next.innerHTML = "&#8250;";
  document.getElementById("next").onclick = function() {
    page_current++;
    tutorial_1.material.map = tutorial_array[page_current];
    if (page_current == 2) //3
      body.removeChild(this);
    if (page_current == 1)
      previousButton();
  }
}

/**
 * previous button
 */
function previousButton() {
  var button = document.createElement('button');
  button.setAttribute('id', "prev");
  body.appendChild(button);
  prev.className = "button1 prev";
  prev.href = "#";
  prev.innerHTML = "&#8249;";
  document.getElementById("prev").onclick = function() {
  page_current--;
  tutorial_1.material.map = tutorial_array[page_current];
  if (page_current == 0)
    body.removeChild(this);
  if (page_current == 2 || page_current == 0) // 4
    nextButton();
  }
}

/**
 * difficulty
 */
function setDifficulty() {
  if (isOnTutorial) {
    var div = document.createElement('div');
    div.setAttribute('id', "difficulty");
    div.className = "div difficulty";
    body.appendChild(div);
    var easy_label = document.createElement('label');
    easy_label.className = "control radio";
    easy_label.innerHTML = "Easy";
    div.appendChild(easy_label);
    var easy_radio = document.createElement('input');
    easy_radio.setAttribute('id', "radioEasy");
    easy_radio.type = "radio";
    easy_radio.checked = true;
    easy_label.appendChild(easy_radio);
    var space_1 = document.createElement('div');
    space_1.className = "control__indicator";
    easy_label.appendChild(space_1);
    var medium_label = document.createElement('label');
    medium_label.className = "control radio";
    medium_label.innerHTML = "Medium";
    div.appendChild(medium_label);
    var medium_radio = document.createElement('input');
    medium_radio.setAttribute('id', "radioMedium");
    medium_radio.type = "radio";
    medium_label.appendChild(medium_radio);
    var space_2 = document.createElement('div');
    space_2.className = "control__indicator";
    medium_label.appendChild(space_2);
    var hard_label = document.createElement('label');
    hard_label.className = "control radio";
    hard_label.innerHTML = "Hard";
    div.appendChild(hard_label);
    var hard_radio = document.createElement('input');
    hard_radio.setAttribute('id', "radioHard");
    hard_radio.type = "radio";
    hard_label.appendChild(hard_radio);
    var space_3 = document.createElement('div');
    space_3.className = "control__indicator";
    medium_label.appendChild(space_3);
  }

  var easy = document.getElementById("radioEasy");
  var medium = document.getElementById("radioMedium");
  var hard = document.getElementById("radioHard");

  easy.onclick = function() {
    medium.checked = false;
    hard.checked = false;
    difficulty = 1;
  }
  medium.onclick = function() {
    easy.checked = false;
    hard.checked = false;
    difficulty = 2;
  }
  hard.onclick = function() {
    easy.checked = false;
    medium.checked = false;
    difficulty = 3;
  }

}

/**
 * game over screen
 */
function gameOverScreen() {
  var gameOver_button = document.createElement('div');
  gameOver_button.setAttribute('id', "gameOverLayout");
  gameOver_button.className = "div gameOverLayout";
  gameOver_button.innerHTML = "Game Over";
  body.appendChild(gameOver_button);

  var retry_button = document.createElement('button');
  retry_button.setAttribute('id', "playAgainBtn");
  btns.appendChild(retry_button);
  retry_button.className = "button playAgainBtn";
  retry_button.innerHTML = "Play Again";

  var score_button = document.createElement('div');
  score_button.setAttribute('id', "finalscore_layout");
  score_button.className = "div finalscore_layout";
  score_button.innerHTML = "Score:  "+ score;
  btns.appendChild(score_button);

  var reset_button = document.createElement('button');
  reset_button.setAttribute('id', "resetBtn");
  btns.appendChild(reset_button);
  reset_button.className = "button resetBtn";
  reset_button.innerHTML = "Home";

  document.getElementById("playAgainBtn").onclick = function() {
    body.removeChild(document.getElementById("gameOverLayout"));
    btns.removeChild(document.getElementById("finalscore_layout"));
    btns.removeChild(document.getElementById("resetBtn"));
    btns.removeChild(this);
    startGame();
  }

  document.getElementById("resetBtn").onclick = function() {
    document.location.reload(true);
  }

  scene.add(transparent_texture);
  scene.add(logo_texture);
}

/**
 * Dom
 */
function setDom() {
  var body = document.getElementById("body");
  var btns = document.getElementById("btns");
  var play_button = document.getElementById("play_button");
  var tutorial_button = document.getElementById("tutorial_button");
  var close_button = document.getElementById("close_button");
  var prev = document.getElementById("prev");
  var next = document.getElementById("next");
  score_text = document.getElementById("score");
  score_layout = document.getElementById("score_layout");
  var score_logo = document.getElementById("score_logo");

  if (score_layout)
    body.removeChild(score_layout);

  if (close_button) body.removeChild(close_button);
  if (prev) body.removeChild(prev);
  if (next) body.removeChild(next);
}

/**
 * update score
 */
function updateScore() {
    score_text = document.getElementById("score");
}

/**
 * handles HUD
 */
 function loadHUD() {
  var hp = document.createElement('div');
  hp.setAttribute('id', "health_layout");
  hp.className = "div health_layout";
  body.appendChild(hp);

  for (var i = 1; i <= healthPoints; i++) {
    var logo = document.createElement('img');
    var id = "heart" + i;
    logo.setAttribute('id', id);
    logo.src = "/res/textures/Health-potion.png";
    logo.alt = " ";
    logo.height = "60";
    logo.width = "60";
    logo.className = "heart";
    hp.appendChild(logo);
  }

  var score = document.createElement('div');
  score.setAttribute('id', "score_layout");
  score.className = "div score_layout";
  body.appendChild(score);
  var logo = document.createElement('img');
  logo.setAttribute('id', "score_logo");
  logo.src = "/res/textures/coinx2.png";
  logo.alt = " ";
  logo.height = "100";
  logo.width = "100";
  score.appendChild(logo);
  var id = document.createElement('label');
  id.setAttribute('id', "score");
  id.innerHTML = "0";
  score.appendChild(id);
  updateScore();

}

/**
 * removes HUD
 */
function removeHUD() {
  body.removeChild(document.getElementById("score_layout"));
  body.removeChild(document.getElementById("health_layout"));
}



//        //
// SPAWNS //
//        //

/**
 * spawn threats : cauldron and arrow
 * @returns 
 */
function spawnThreats() {

    var threat_current;
    var threat_box;
    var isOnScreen = false;

    threat_current = threats[THREE.Math.randInt(0, 1)];

    // spawn cauldron
    if (threat_current === threats[0]) {
        threat_current.position.y = startingPosition.y;
        threat_box = cauldron_hitBox.clone();
        threat_box.position.y = startingPosition.y;
        threats_audio = cauldron_audio;
      }

    // spawn arrow
    else if (threat_current === threats[1]) {
        threat_current.position.y = 7;
        threat_box = arrow_hitBox.clone();
        threat_box.position.y = 7;
        threats_audio = arrow_audio;
        }
    else {
      return;
    }

    threat_current.position.x = spawn_position; 
    threat_current.position.z = startingPosition.z + 1.5;
    threat_box.position.x = spawn_position; 
    threat_box.position.z = startingPosition.z + 1.5; 
    threat_collider = new THREEx.Collider.createFromObject3d(threat_box);
    threat_collider.name = "threat_collider";
    colliders_array.push(threat_collider);
    threat_helper	= new THREEx.ColliderHelper(threat_collider);
    threat_helper.material.color.set('green');
    threats_audio.play();
    helpers_array.push(threat_helper);
    colliderRemove(threat_collider,threat_helper);

    for (var i = 0; i < threats_onScreen.length; i++) {
      if (threat_current == threats_onScreen[i])
        isOnScreen = true;
    }
    if (isOnScreen == false)
      threats_onScreen.push(threat_current);

    scene.add(threat_current);
    scene.add(threat_box);
    hitBoxes_array.push(threat_box);
}

/**
 * load models 
 */
 function loadModels() {

  // arrow
  gltf_loader.load("models/Arrow/arrow2.gltf", (gltf) => {
  arrow_model = gltf.scene;
  arrow_model.name = "arrow_model";
  arrow_model.position.z = -3;
  arrow_model.rotation.x = 30;
  arrow_model.rotation.z = 30;

  arrow_model.scale.set(3, 3, 3);
  threats[1] = arrow_model;

});

// coin
gltf_loader.load("models/Coin/coin2.gltf", (gltf) => {
  coin_model = gltf.scene;

  coin_model.name = "coin_model";
  coin_model.scale.set(2, 2, 2);
  coin_model.position.x = spawn_position;
  coin_model.position.y = coin_yAxis;
  coin_model.position.z = startingPosition.z;
});

  // star
  gltf_loader.load("models/Star/star.gltf", (gltf) => {
    star_model = gltf.scene;
    star_model.name = "star_model";
    star_model.scale.set(2,2,2);
    star_model.position.set(spawn_position,5.5,startingPosition.z);
    star_texture = texture_loader.load("models/Star/starTexture.png");
    star_texture.encoding = THREE.sRGBEncoding;
    star_texture.wrapS = THREE.RepeatWrapping;
    star_texture.wrapT = THREE.RepeatWrapping;

    star_model.traverse( (o) => {
      if (o instanceof THREE.Mesh) {
        star_material = o.material;
        o.material.map = star_texture;
        o.material.needsUpdate = true;
      }
    });
  });

  // tree
  gltf_loader.load("models/Tree/tree.gltf", (gltf) => {
      tree_model = gltf.scene;
      tree_model.name = "tree_model";
      tree_model.traverse((o) => {
        if ( o.isMesh ) {
            o.material.metalness = 0;
        }
      });
      tree_model.scale.set(5, 7, 5);
      tree_model.position.x = tree_xAxis;
      tree_model.position.y = startingPosition.y - 0.5;
      tree_model.position.z = startingPosition.z - 8;
      tree_model.rotation.x = 0.3;
  });

  // gandalf
  gltf_loader.load("models/Gandalf/gandalf2.gltf", (gltf) => {
      gandalf_model = gltf.scene;
      console.log(gltf.scene);
      gandalf_model.name = "gandalf";
      gandalf_model.scale.set(5.2, 5.2, 5.2);
      gandalf_model.position.x = startingPosition.x -5 ;
      gandalf_model.position.y = startingPosition.y;
      gandalf_model.position.z = startingPosition.z;
      gandalf_model.rotation.y = 1;        
      gandalf_group = new THREE.Group();
      gandalf_group.add(gandalf_hitBox);
      gandalf_group.add(gandalf_model);
      
      var i = 0;
      gandalf_model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          gandalf_textures[i] = child.material.map;
          i++;
        }
      });
      loadHierarchy();
      console.log(threats)

  });


  // cauldron

  gltf_loader.load("models/Cauldron/cauldron2.gltf", (gltf) => {
  cauldron_model = gltf.scene;
  cauldron_model.name = "cauldron_model";
  
    cauldron_model.scale.set(3, 3, 3);
    cauldron_model.position.x = 4;
    cauldron_model.position.y = startingPosition.y - 0.5;
    cauldron_model.position.z = startingPosition.z;
    cauldron_model.rotation.y = -190;
    threats[0] = cauldron_model;
});

}

/**
* handles spwan of stars
*/
function spawnStar() {
var star_current = star_model.clone();
star_current.name ="star_model";
var box = coins_hitBox.clone();
box.name = "star_model";
box.position.set(star_model.position.x,star_model.position.y,star_model.position.z);
scene.add(box);
var star_collider = new THREEx.Collider.createFromObject3d(box);
colliders_array.push(star_collider);
var star_helper = new THREEx.ColliderHelper(star_collider);
star_helper.material.color.set('green');
helpers_array.push(star_helper);
colliderRemove(star_collider,star_helper);
starCollision(star_collider,star_current);
hitBoxes_array.push(box);
coins_onScreen.push(star_current);
scene.add(star_current);

}

/**
* handles spawn of coins
*/
function spawnCoin() {

  var spawn_ratio = THREE.Math.randInt(1, 2);
  var coin_current;
  var position = 0;

  setTimeout(() => {

    var cardinality = THREE.Math.randInt(1, 3);

    for (var i = 1; i <= cardinality; i++) {
      coin_current = coin_model.clone();
      coin_current.position.x = spawn_position;
      coin_current.name = "coin_model";
      var box = coins_hitBox.clone(); 
      box.position.x = spawn_position;
      coin_current.position.x += position;
      box.position.x += position;
      box.position.y = coin_yAxis;
      box.position.z = startingPosition.z;
      box.name = "coin_model";
      scene.add(box);

      coin_collider = new THREEx.Collider.createFromObject3d(box);
      colliders_array.push(coin_collider);
      coin_helper = new THREEx.ColliderHelper(coin_collider);
      coin_helper.material.color.set('green');
      helpers_array.push(coin_helper);
      colliderRemove(coin_collider,coin_helper);
      coinCollision(coin_collider,coin_current);

      hitBoxes_array.push(box);
      coins_onScreen.push(coin_current);
      scene.add(coin_current);
      position += 2;

    }
  }, spawn_ratio*1000);

}

/**
* handles spawn of trees
*/
function spawnTrees() {

  var tree_spacing = THREE.Math.randInt(0, 4);  // small due to trasl
  var spawn_ratio = THREE.Math.randInt(1, 3);
  var tree_current = tree_model.clone();


  setTimeout(() => {

    tree_current.position.x = spawn_position + 2  + tree_spacing;
    trees_onScreen.push(tree_current);
    scene.add(tree_current);

  }, spawn_ratio*1000);

}

//            //
// COLLISIONS //
//            //

/**
 * invulnerability
 */
function setInvulnerable() {
  isInvulnerable = true;
  gandalf_model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material.map = star_texture;
      child.material.needsUpdate = true;
    }
  });
}

/**
 * return to normal
 */
function resetInvulnerable() {
  i = 0;
  gandalf_model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material.map = gandalf_textures[i];
      i++;
    }
  });
  isInvulnerable = false;
}

/**
 *  handles collision with coin
 * @param {*} collider coin collider
 * @param {*} coin_model coin model
 */
function coinCollision(collider,coin_model) {
  collider.addEventListener('contactEnter',function(collision) {
    if (collision.name == "gandalf_collider") {
      if (coin_audio.isPlaying)
        coin_audio.stop();
      coin_audio.play();
      scene.remove(coin_model);
      updateScore();
      score++;
    }
  });
}

/**
 * handles collision with star
 * @param {*} collider star collider
 * @param {*} star_model star model
 */
function starCollision(collider,star_model) {
  collider.addEventListener('contactEnter',function(collision) {
    if (collision.name == "gandalf_collider") {
      if (isInvulnerable) {
        invulnerable_audio.stop();
        clearTimeout(resetInvulnerable_function);
      }
      star_audio.play();
      invulnerable_audio.play();
      scene.remove(star_model);

      setInvulnerable();
      resetInvulnerable_function = setTimeout(() => {
        resetInvulnerable();
      },5000);
    }
  });
}

/**
 * removes collider given collider and helper
 * @param {*} collider collider
 * @param {*} helper helper
 */
function colliderRemove(collider, helper){
  setTimeout(() => {
    scene.remove(collider);
    scene.remove(helper);
    for (var i = 0; i< colliders_array.length; i++) {
      if (colliders_array[i] === collider) {
        colliders_array.splice(i,1);
        i--;
      }
    }
    for (var i = 0; i < helpers_array.length; i++) {
      if (helpers_array[i] === helper) {
        helpers_array.splice(i,1);
        i--;
      }
    }
  }, 10000);
}

/**
 * handles hit register
 */
 function hitRegister() {
  gandalf_audio.play();
  var hp = document.getElementById("health_layout");
  var id = "heart" + healthPoints;
  var heart_current = document.getElementById(id);

  if (potionScale < 2) {
    var string = "scale(" + potionScale +")";
    heart_current.style.transform = string;
    potionScale += 0.05;
  }

  else {
    healthPoints--;
    isVulnerable = true;
    hp.removeChild(heart_current);
    gameOverCheck();
    potionScale = 1;
    clearInterval(dmg_function);
  }

}

//            //
// ANIMATIONS //
//            //

  /**
   * handles unfade animation
   */
  function unfade() {

    if( gandalf.position.y >= 0) {
      gandalf.position.y -= 0.05;

    }

    if(arm_right.rotation.x <= 0 ) {
      arm_right.rotation.x += 0.2;
    }

    if(gandalf_model.children[0].children[1].material.opacity == 1) {
      setTimeout(() => {
      isFading=false;
      isFaded=false;
      isGrounded = true;
      isInvisible = false;
      animation_flag = 0;
      
  }, 500);
     }
     gandalf_model.children[0].children[1].material.color["r"] = 1;
     gandalf_model.children[0].children[1].material.color["g"] = 1;
     gandalf_model.children[0].children[1].material.color["b"] = 1;
     gandalf_model.children[0].children[1].material.opacity=1;
     gandalf_model.children[0].children[1].material.transparent=false;
     console.log(gandalf_model.children[0].children[1].material.color);
}

  /**
   * handles fade animation
   */
  function fade() {
    
    if( gandalf.position.y <= 0.3 ) {
      gandalf.position.y += 0.01;
      
    leg_left.rotation.x = 3.1;
    leg_right.rotation.x = 3.1;
    }
    
    if(arm_right.rotation.x >= -0.8 ) {
      arm_right.rotation.x -= 0.2;
    }
    
    if(gandalf_model.children[0].children[1].material.opacity == 0.5)  {
      setTimeout(() => {
   isFaded = true;

  }, 1000);
    }
    isInvisible = true;
    isFading = true;
    gandalf_model.children[0].children[1].material.color["r"] = 1;
    gandalf_model.children[0].children[1].material.color["g"] = 143;
    gandalf_model.children[0].children[1].material.color["b"] = 3;
    gandalf_model.children[0].children[1].material.transparent=true;
    gandalf_model.children[0].children[1].material.opacity=0.5;
    console.log(gandalf_model.children[0].children[1].material.color);
     
  }
  
  /**
   * handles updates for objects
   */
  function update() {

  for (var i = 0; i < colliders_array.length ; i++) {
    colliders_array[i].update();
  }
  for (var i = 0; i < helpers_array.length; i++) {
    helpers_array[i].update();
  }

  if(gandalf_model && isPlaying) {
    score_text.innerHTML =  score;
    animate();
  }

  var arg = 1000/difficulty;

  for (var i = 0; i < threats_onScreen.length ; i++) {
    var current_threat = threats_onScreen[i];
    if (current_threat == threats[0]) {
      cauldron_hitBox.position = current_threat.position;
    }
    else if (current_threat == threats[1]) {
      arrow_hitBox.position == current_threat.position;
    }

    if (current_threat.position.x <= flush_position -5 ) { //-28
      scene.remove(current_threat);
      threats_onScreen.splice(i,1);
      i--;
    }
    
    if (current_threat.name = "arrow_model") {
      current_threat.position.x -= (speed * 50) + (speed * 10 * difficulty);
      if ( current_threat.position.y >= - 3.5 ) {
        current_threat.position.y -= Math.log(arg)*0.01 * difficulty;
        arg++;
      }
    }
    else
    current_threat.position.x -= (speed * 50) + (speed * 10 * difficulty);
      
  }
  
  for (var j = 0; j < trees_onScreen.length; j++) {
    var tree_current = trees_onScreen[j];
    if ( tree_current.position.x <= flush_position - 5) {
      scene.remove(tree_current);
      trees_onScreen.splice(j, 1);
      j--;
    }
    tree_current.position.x -= speed * 36 + 0.07 * difficulty;
  }

  for (var w = 0; w < coins_onScreen.length; w++) {
    var coin_current = coins_onScreen[w];
    if ( coin_current.position.x <= flush_position -5) {
      scene.remove(coin_current);
      coins_onScreen.splice(w, 1);
      w--;
    }
    coin_current.position.x -= speed * 36 + 0.07 * difficulty;
  }

  if (isLoaded) {
      mixers.forEach(function(mixer) {
          mixer.update(0.016);
        });
  }

  collider_system.computeAndNotify(colliders_array);

  for (var x = 0; x < hitBoxes_array.length; x++) {
    var box_current = hitBoxes_array[x];
    if(box_current.position.x < flush_position -5){
      scene.remove(box_current);
      hitBoxes_array.splice(x,1);
      x--;
    }

    if (box_current.name === "arrow_box") {
    box_current.position.x -=  (speed * 10 * difficulty);
    box_current.position.x -= speed * 50;
      if (box_current.position.y >= -3.5) {
        box_current.position.y -= Math.log(arg) * 0.01 * difficulty;
      }
    }

    if (box_current.name === "cauldron_box"){
      box_current.position.x -= speed * (10 * difficulty);
      box_current.position.x -= speed * 50;
    }
    if (box_current.name === "coin_model"){
      box_current.position.x -= speed * 36 + 0.07 * difficulty;
    }
    if (box_current.name === "star_model"){
      box_current.position.x -= speed * 36 + 0.07 * difficulty;
    }
  }

  for (var y = 0; y < colliders_array.length; y++) {
    colliders_array[y].update();
  }
}

/**
 * handles idle animation
 */
function idle() {

  
  gandalf_model.children[0].children[1].material.color["r"] = 1;
  gandalf_model.children[0].children[1].material.color["g"] = 1;
  gandalf_model.children[0].children[1].material.color["b"] = 1;
  gandalf_model.children[0].children[1].material.transparent=false;
  gandalf_model.children[0].children[1].material.opacity=1;

  if (leg_right.rotation.x >= 3.8 || leg_right.rotation.x <= 2.6)
      isStepChange = !isStepChange;

  if (isStepChange ) {    
      leg_right.rotation.x += 0.03 *idle_speed ;
      leg_left.rotation.x -= 0.03 *idle_speed ;
      legLeft_position = leg_left.rotation.x;
      legRight_position = leg_right.rotation.x;
      arm_right.rotation.x += 0.015 * idle_speed;
      arm_left.rotation.x -= 0.015 * idle_speed;
      gandalf_group.position.y += 0.002 * idle_speed;
      gandalf_group.position.x += 0.003 * idle_speed;
      gandalf_group.position.z += 0.001 * idle_speed;

  }

  else {   
      leg_right.rotation.x -= 0.03 *idle_speed ;
      leg_left.rotation.x += 0.03 *idle_speed ;
      legLeft_position = leg_left.rotation.x;
      legRight_position = leg_right.rotation.x;
      arm_right.rotation.x -= 0.015 * idle_speed;
      arm_left.rotation.x += 0.015 * idle_speed;
      gandalf_group.position.y -= 0.002 * idle_speed;
      gandalf_group.position.x -= 0.003 * idle_speed;
      gandalf_group.position.z -= 0.001 * idle_speed;

  }
}

/**
 * handles animations transitions
 */
function animate() {

  if (animation_flag == 0) {
    if (isJumping || isFading ) {
      positionFix();
    }else{
      idle();
    }
  }

  if (animation_flag == 1) {
    if (isLanding){
      land();
    } else {
      jump();
    }
  }

  if (animation_flag == 2){
    if(isFaded){
      unfade();
    } else {
    fade();
    }
}
}

/**
 * handles land animation
 */
function land() {

  if (gandalf.position.y > 0) {
    gandalf.position.y -= 0.01 * land_speed;
    gandalf_hitBox.position.y -= 0.005 * land_speed;
  } else {    
    isLanding = false;
    isGrounded = true;
    animation_flag = 0;

    gandalf.position.y = 0;
    gandalf_hitBox.position.y = startingPosition.y + 4;
}

if(arm_right.rotation.x >= 0 ) {
  arm_right.rotation.x -= 0.2;
}
if(arm_left.rotation.x <= 0 ) {
  arm_left.rotation.x += 0.2;
}
if(leg_right.rotation.x >= 3.1 ) {
  leg_right.rotation.x -= 0.2;
}
if(leg_left.rotation.x <= 3.1 ) {
  leg_left.rotation.x += 0.2;
}
}


/**
 * handles jump animation
 */
function jump() {
  if (gandalf.position.y > 1) {
    isLanding = true;
    isJumping = false;
  }
  

  if ( gandalf.position.y <= 1) {

      gandalf.position.y += 0.01 * jump_speed * 1.5;
      gandalf_hitBox.position.y += 0.08 * jump_speed * 1.5;
      
      if(arm_right.rotation.x <= 2) {
      arm_right.rotation.x += 0.2;
      }

      if(arm_left.rotation.x >= -2) {
        arm_left.rotation.x -= 0.2;
        }

      if(leg_right.rotation.x <= 3.8 ) {
        leg_right.rotation.x += 0.2;
        }
      
      if(leg_left.rotation.x >= 2.4) {
        leg_left.rotation.x -= 0.2;
        }
  }
}

/**
 * makes sure that feet are in correct position before jumping
 */
function jumpFix() {
  animation_flag = 1;
  isReady = false;
  
  leg_left.rotation.x = 3.1;
  leg_right.rotation.x = 3.1;
}

/**
 * makes sure to reset the correct position for animations
 * @returns 
 */
function positionFix() {

  if (isReady) {
    if (isJumping) {
      jumpFix();

    } else if (isFading) {
      animation_flag = 2;
    }
    return;
  }

  isReady = true;

  arm_left.rotation.x = 0;
  arm_right.rotation.x = 0;
  leg_left.rotation.x = 3.1;
  leg_right.rotation.x = 3.1;
  
}

/**
 * handles gandalf bone hierarchy
 */
function loadHierarchy() {

  if (gandalf_model)  {
    gandalf = gandalf_model.getObjectByName("root");
    torso = gandalf_model.getObjectByName("torso");
    head = gandalf_model.getObjectByName("head");
    leg_left = gandalf_model.getObjectByName("thigh_left");
    foot_left = gandalf_model.getObjectByName("foot_left");
    leg_right = gandalf_model.getObjectByName("thigh_right");
    foot_right = gandalf_model.getObjectByName("foot_right");
    arm_left = gandalf_model.getObjectByName("arm_left");
    forearm_left = gandalf_model.getObjectByName("forearm_left");
    hand_left = gandalf_model.getObjectByName("hand_left");
    arm_right = gandalf_model.getObjectByName("arm_right");
    forearm_right = gandalf_model.getObjectByName("forearm_right");
    hand_right = gandalf_model.getObjectByName("hand_right");
    leg_right.rotation.x = 3.1;
    leg_left.rotation.x = 3.1;
    gandalf.position.z = 0;
    gandalf.position.x = 0;
    gandalf.position.y = 0;
    gandalf.rotation.x = 0;
    gandalf.rotation.y = 0;
    gandalf.rotation.z = 0;
    gandalf_model.rotation.y = 1;
    gandalf_model.position.set(-17,-10,-5);
    gandalf_group.position.set(0 ,0 ,0);
    gandalf_hitBox.position.set(startingPosition.x - 5, startingPosition.y + 4, startingPosition.z);
    gandalf_hitBox.scale.y = 1;
    gandalf_group.position.set(0,0,0);
  }
}

/**
 * handles blink animation
 * @param {*} visible 
 */
function blink (visible) {
  if (visible == false) {
    gandalf_model.visible = false;
  }
  else {
    gandalf_model.visible = true;
  }
}






