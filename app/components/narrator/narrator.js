function Narrator( params ){
	
	var scope = this;
	
	var STAGE_W, STAGE_WH, STAGE_H, STAGE_HH;

	//
	var $container;
	if( params.container ){
		$container = params.container;
	}else{
		$container = $("<div class='narrator'></div>").appendTo($("body"));
	}
	scope.$container = $container;

	scope.setCanvasSize = function( w, h ){
		STAGE_W = w;
		STAGE_H = h;
		canvas.width = w;
		canvas.height = h;
		renderer.resize( w, h );
	}

	//
	var canvas = document.createElement("canvas");
	$container.append(canvas);

	var Animator = PIXI.animate.Animator;
	
	var scene = new PIXI.animate.Scene(1, 1, {
	  view: canvas,
	  backgroundColor: 0x37488E,
	  antialias: true
	});


	var stage = scene.stage;
	var renderer = scene.renderer;

	if( params.canvas_width ) scope.setCanvasSize( params.canvas_width, params.canvas_height );




/*
████████╗██╗ ██████╗██╗  ██╗███████╗██████╗ 
╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝██╔══██╗
   ██║   ██║██║     █████╔╝ █████╗  ██████╔╝
   ██║   ██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗
   ██║   ██║╚██████╗██║  ██╗███████╗██║  ██║
   ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
*/
	// TICKER
	scene.ticker.add(function(){
		updateLipsync();
		// console.log("update");
	});






/*
███████╗ ██████╗ ██╗   ██╗███╗   ██╗██████╗ 
██╔════╝██╔═══██╗██║   ██║████╗  ██║██╔══██╗
███████╗██║   ██║██║   ██║██╔██╗ ██║██║  ██║
╚════██║██║   ██║██║   ██║██║╚██╗██║██║  ██║
███████║╚██████╔╝╚██████╔╝██║ ╚████║██████╔╝
╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═════╝ 
*/
	// SOUND
	
	var sound, sound_instance;
	var sounds = {};
	var lipsync_fps;
	scope.sound_volume = 1;

	scope.loadSound = function( sound_url, _lipsync_fps, onComplete, lipsync_frame_offset ){
		
		console.log( "#narrator: loadSound", sound_url, sounds[sound_url] );

		lipsync_frame_offset = lipsync_frame_offset === undefined ? 0 : lipsync_frame_offset;

		if( sounds[sound_url] ){
			console.log( "#narrator: sound is loaded already" );
			sound = sounds[ sound_url ];
			if( onComplete ) onComplete();
			return;
		}

		lipsync_fps = _lipsync_fps;

		var _sound_is_loaded = false;
		var _lipsync_data_is_loaded = false;

		sound = sounds[sound_url] = PIXI.sound.Sound.from({
			url: sound_url,
			preload: true,
	    loaded: function(err, sound) {
	        console.log('Sound loaded');
	        _sound_is_loaded = true;
	        _onComplete();
	    }
		});

		if( _lipsync_fps ){
			
			var url = sound_url.substr(0, sound_url.lastIndexOf(".") ) + ".dat";
			console.log("lipsync:", url );
			
			var lipsync_data = $.get( url, function(data){
				
				data = data.split("\n");
				data.shift();
				if( !data[ data.length -1 ] ) data.pop();

				var _data = [];
				for( var i=0; i<data.length; i++ ){
					var o = data[i].split(" ");
					o[0] = parseInt(o[0]) + lipsync_frame_offset;
					o[1] = o[1].toLowerCase().substr(0,o[1].length-1);
					_data.push(o);
				}

				console.log("lipsync:", data, _data );

				sound.lipsync_data = _data;
				_lipsync_data_is_loaded = true;
				_onComplete();

			}, 'text' );

		}

		function _onComplete(){
			if( _lipsync_fps && !_lipsync_data_is_loaded ) return;
			if( !_sound_is_loaded ) return;
			if( onComplete ) onComplete();
		}

	}

	function playSound(){
		
		if( !sound ) return;
		console.log("#narrator: playSound", sound );

		sound_instance = sound.play();
		sound_instance.volume = scope.sound_volume;

		/*
		sound_instance.on('progress', function(progress) {
      // console.log('Amount played: ', Math.round(progress * 100) + '%');
    });
    */
    
    sound_instance.on('end', function() {
      // console.log('Sound finished playing');
      need_finalize_speech_animation = true;
      // finalizeAnimation();
    });
	}

	scope.setSoundVolume = function( volume ){
		scope.sound_volume = volume;
		if( !sound_instance ) return;
		sound_instance.volume = volume;
	}

	scope.stopSound = function(){
		if( !sound_instance ) return;
		sound_instance.stop();
		sound_instance.off('progress');
    sound_instance.off('end');
    sound_instance = undefined;
	}



/*
 █████╗ ███╗   ██╗██╗███╗   ███╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗
██╔══██╗████╗  ██║██║████╗ ████║██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
███████║██╔██╗ ██║██║██╔████╔██║███████║   ██║   ██║██║   ██║██╔██╗ ██║
██╔══██║██║╚██╗██║██║██║╚██╔╝██║██╔══██║   ██║   ██║██║   ██║██║╚██╗██║
██║  ██║██║ ╚████║██║██║ ╚═╝ ██║██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
*/
	// ANIMATION
	var current_animation, current_animation_name;
	Object.defineProperty(this, "current_animation", { get: function () { return current_animation; } });
	Object.defineProperty(this, "current_animation_name", { get: function () { return current_animation_name; } });

	var need_finalize_speech_animation;
	var talk_loops;
	var outro_label, animationComplete;
	var animation_scenes = {};
	var animations = {};

	scope.loadAnimation = function( animation_scene, animation_file, assets_url, onComplete ){
		
		if( animation_scenes[ animation_scene ] ){
			if( onComplete ) onComplete();
			return;
		}

		$.getScript( animation_file, function( data, textStatus, jqxhr ) {
		  console.log("lib",lib);

		  scene.load(
				lib[ animation_scene ],
				function(scene_animation){
					// init_animation( scene_animation );
					// current_animation = animation_scenes[ animation_name ] = scene_animation;
					// current_animation_name = animation_name;
					// stage.addChild( current_animation );
					Animator.stop( scene_animation );
					stage.removeChild( scene_animation );
					console.log("#narrator: scene loaded");
					if( onComplete ) onComplete();
				},
				assets_url
			);

		  // console.log( data ); // Data returned
		  // console.log( textStatus ); // Success
		  // console.log( jqxhr.status ); // 200
		  // console.log( "Load was performed." );
		});

	}

	scope.showAnimation = function( animation_name ){

		// Animation clip exists and is not the same
		if( current_animation_name && current_animation_name != animation_name ){
			console.log("#narrator: different clip exists: ", current_animation_name );
			removeCurrentAnimation();
		}

		if( !current_animation_name ){
			console.log("#narrator: clip doesn't exists" );
			current_animation_name = animation_name;
			
			if( animations[animation_name] ){
				current_animation = animations[animation_name];
				console.log("#narrator: get from library" );
			}else{
				animations[animation_name] = current_animation = new lib[ animation_name ];
				console.log("#narrator: create new one" );
			}

			stage.addChild( current_animation );

		}

		console.log("#narrator: ", current_animation );
	}


	scope.playSpeech = function( animation_name, intro_label, _outro_label, _talk_loops, onComplete ){
		
		console.log("#narrator: play animation: ", animation_name, intro_label, _talk_loops );

		need_finalize_speech_animation = false;
		outro_label = _outro_label;
		animationComplete = onComplete;
		talk_loops = _talk_loops;

		scope.stopSound();
		resetLipsync();

		scope.showAnimation( animation_name );

		if( intro_label ){
			Animator.fromTo( current_animation, intro_label, intro_label+"_end", 0, function(){
				scope.playLoop();
				playSound();
				setMouth( current_animation );
			});
		}else{
			scope.playLoop();
			playSound();
		}

		setMouth( current_animation );
		console.log( "current_animation: ", current_animation );
	}

	scope.playLoop = function( _talk_loops, stop_sound ){
		
		if( !current_animation_name ) return;

		if( need_finalize_speech_animation ) { // speech is complete need to quit animation
			finalizeAnimation();
			return;
		}

		if( _talk_loops ) talk_loops = _talk_loops;
		if( stop_sound ) scope.stopSound();

		var anim = talk_loops[ ~~(Math.random() * talk_loops.length ) ];
		// console.log("#narrator: playLoop", anim );
		Animator.fromTo( current_animation, anim, anim+"_end", 0, scope.playLoop );
	}


	scope.play = function( animation_name, label, onComplete, stop_sound ){
		
		need_finalize_speech_animation = false;
		if( animation_name ) scope.showAnimation( animation_name );
		if( !current_animation_name ) return;

		if( stop_sound ) scope.stopSound();
		Animator.fromTo( current_animation, label, label+"_end", 0, onComplete );	
	}


	scope.stop = function( outro_label, onComplete ){

		console.log("#narrator: stop", outro_label, current_animation_name );

		need_finalize_speech_animation = false;

		if( !current_animation_name ) return;

		scope.stopSound();

		if( outro_label ){
			if( outro_label === true ){
				_stopComplete();
			}else{
				Animator.fromTo( current_animation, outro_label, outro_label+"_end", 0, _stopComplete );
			}
		}else{
			if( onComplete ) onComplete();
		}

		function _stopComplete(){
			removeCurrentAnimation();
			if( onComplete ) onComplete();
		}

	}

	function removeCurrentAnimation(){
		
		if( !current_animation_name ) return;

		Animator.stop( current_animation );
		stage.removeChild( current_animation );
		current_animation = undefined;
		current_animation_name = undefined;

	}

	function finalizeAnimation(){
		console.log("#narrator: finalizeAnimation");
		scope.stop( outro_label, animationComplete );
	}




/*
██╗     ██╗██████╗ ███████╗██╗   ██╗███╗   ██╗ ██████╗
██║     ██║██╔══██╗██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝
██║     ██║██████╔╝███████╗ ╚████╔╝ ██╔██╗ ██║██║     
██║     ██║██╔═══╝ ╚════██║  ╚██╔╝  ██║╚██╗██║██║     
███████╗██║██║     ███████║   ██║   ██║ ╚████║╚██████╗
╚══════╝╚═╝╚═╝     ╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝
*/
	// LIPSYNC
	var current_frame;
	var current_lipsync_phase;
	var current_lipsync_frame;
	var current_lipsync_index;

	function resetLipsync(){
		current_frame = 0;
		current_lipsync_index = 0;
		current_lipsync_frame = sound.lipsync_data[ current_lipsync_index ];
		current_lipsync_phase = "rest";
	}

	function updateLipsync(){

		if( !sound_instance || !sound.lipsync_data ) return;
		var frame = ~~( sound_instance.progress * sound_instance._duration * lipsync_fps );
		if( frame == current_frame ) return;
		
		current_frame = frame;

		// console.log( current_frame + ">=" + current_lipsync_frame[0] );

		
		if( current_lipsync_frame && current_frame >= current_lipsync_frame[0] ){
			current_lipsync_phase = current_lipsync_frame[1];
			current_lipsync_index++;
			current_lipsync_frame = sound.lipsync_data[ current_lipsync_index ];
			// console.log(">"+current_lipsync_phase+"<" + current_lipsync_phase.length +"]"+ ( current_lipsync_phase[0] == "e") );
			// console.log(">"+current_lipsync_phase+"<" );
			setMouth( current_animation );
		}
		
		// current_lipsync_phase = Math.random() > .5 ? "e" : "ai";
		// current_lipsync_phase = "e";
		// console.log("++++++++++++++++++++++++++++++++++++");
		// console.log("++++++++++++++++++++++++++++++++++++");
		// console.log( frame );

		// var sound_position
	}

	function setMouth( ee ){
		if( ee.children.length ){
			var mouth;
			ee.children.forEach(function( e, i ){
				mouth = e["mouth"];
				if( mouth ) {
					// console.log("mouth! ["+current_lipsync_phase+"]" );
					mouth.gotoAndStop( current_lipsync_phase );
				} else setMouth( e );
			});
		}
	}




	//
	return this;

}

