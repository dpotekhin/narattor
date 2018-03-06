$(function() {
	
	var scene_scale = .5;
	
	var $container = $(".narrator");

	var narrator = new Narrator({
		container: $container,
		// canvas_width: 550,
		// canvas_height: 400
	});

	narrator.setCanvasSize( 2048*scene_scale, 1154*scene_scale );// change container size manually

	// Preload Animated Scene
	narrator.loadAnimation(
		"narrator_animation", // name of root animation clip
		"assets/narrator_animation.js", // animation data url
		"assets/", // prefix
		function(){ // load complete url

			console.log("animation loaded");

			// Preload Sound and Lipsync Data
			narrator.loadSound(
				"assets/sound/RASTISHKA_SHAZAM_VO_YS_S1_2017_12_29_COSMORACES_1_JUPITER.mp3", // sound url
				24, // lipsync framerate. 0 - to prevent lipsync data loading
				function(){ // load complete callback
					console.log("sound loaded");
					playAnimation("in", "out");
					$container.show();
				},
				-1 // lipsync frame offset
			);

		}

	);



	// DEBUG BUTTONS


	// STOP
	$("#stop_outro").click(function(){
		narrator.stop("out");
	});

	$("#stop").click(function(){
		narrator.stop(true);
	});



	// PLAY
	$("#play_intro_outro").click(function(){
		playAnimation( "in", "out" );
	});

	$("#play").click(function(){
		playAnimation( false, true );
	});

	$("#play_and_wait").click(function(){
		playAnimation( false, undefined, function(){
			narrator.playLoop(["static1"]);
		});
	});

	$("#play_wait").click(function(){
		narrator.playLoop(["static1"], true );
	});

	$("#play_label").click(function(){
		narrator.play("char", "in", function(){
			console.log("play complete");
			narrator.playLoop(["static1"] );
		}, true );
	});



	//
	function playAnimation( intro, outro, onComplete ){
		
		console.log("play animation !!!");
		
		narrator.playSpeech(
			"char", // clip name to play
			
			intro, // use an intro character animation "in", false - to skip intro

			outro, // use an outro character animation "out", true - to just disapear the character, undefined - to stay the character on the stage

			["talk1","talk2"], // talking loop labels

			function(){ // animation complete callback after sound is finished and character is disapeared ( after an outro if enabled )
				console.log("!!! talk animation complete !!!");
				if( onComplete ) onComplete();
			}
			
		);
		
		narrator.current_animation.position.set( 1386*scene_scale, 558*scene_scale );
		narrator.current_animation.scale.set( scene_scale, scene_scale );
		narrator.setSoundVolume(.5);
	}


})