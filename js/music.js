var Music = new function(){
	var waves = {
		"saw":new Wad({
			source : 'sawtooth'
		}),
		"sine":new Wad({
			source : 'sine'
		}),
		"triangle":new Wad({
			source : 'triangle'
		}),
		"square":new Wad({
			source : 'square'
		}),
		"super":new Wad({
		    source : 'sine',
		    tuna   : {
		        Overdrive : {
		            outputGain: 0.5,         //0 to 1+
		            drive: 0.7,              //0 to 1
		            curveAmount: 1,          //0 to 1
		            algorithmIndex: 0,       //0 to 5, selects one of our drive algorithms
		            bypass: 0
		        },
		        Chorus : {
		            intensity: 0.3,  //0 to 1
		            rate: 4,         //0.001 to 8
		            stereoPhase: 0,  //0 to 180
		            bypass: 0
		        }
		    }
		})

	}


	

	this.MMLSequence = function(mml){
		var that = this;

		this.play = function(wave,tempo){

			wave = waves[wave]; // Set the wave to the string parameter passed.
			
			var total_wait = 0;
			var beat_length = tempo/60;

			for (var note = 0; note < that.sequence.length; note++){
				
				var note_base = that.sequence[note].note_name;

				var note_modifier = that.sequence[note].note_mod;

				var note_length = that.sequence[note].note_length;

				var note_octave = that.sequence[note].note_octave;

				var note_volume = that.sequence[note].note_volume;
				
				if (note_length == 0){
					note_length = 4;
				}

				

				wave.play({
				    volume  : note_volume,
				    wait    : total_wait, 
				    pitch   : note_base + "" + note_modifier + "" + note_octave,  
				    env     : {hold : beat_length / note_length, attack:0.005, release:0.01},
				    label   : "note"
				})

				total_wait += beat_length / note_length;
			}
		}

		this.parse_note = function(note_string){
			
			if (note_string == ">"){
				that.octave ++;
			}else if (note_string == "<"){
				that.octave --;
			}else if (/O\d/.exec(note_string) != null){
				that.octave = parseInt(/[\d+]/.exec(note_string)[0])
			}else if (/V\d/.exec(note_string) != null){
				that.volume = parseInt(/[\d+]/.exec(note_string)[0]) / 10
			}else{
				that.sequence.push(new Note(next_note[0],that.octave, that.volume /* This should be volume*/));
			}

			

		}


		var mml_string = Text.getStringString(mml).toUpperCase();

		var note_reg = /[A-GOVR][\-#]*\d*|[\<\>]/;

		this.sequence = [];

		this.octave = 4;
		this.volume = 0.6

		while (mml_string.length > 0){
			var next_note = note_reg.exec(mml_string);
			mml_string = mml_string.replace(note_reg,"");
			if (next_note == null){
				break;
			} else{
				this.parse_note(next_note[0])
				
			}
		}

		
	}



	function Note(note_string, cur_octave, cur_volume){

		this.note_name = /[A-GR]/.exec(note_string)[0];

		console.log(this.note_name)

		var note_flat = /-+/.exec(note_string) != null;
		var note_sharp = /#+/.exec(note_string) != null;
		
		var mod_vals = ["b","","#"];
		this.note_mod = mod_vals[(note_sharp - note_flat) + 1];
		
		this.note_octave = cur_octave;

		
		this.note_volume = this.note_name == "R" ? 0.0000001 : cur_volume;
		if (this.note_name == "R"){
			this.note_name = "A";
		}



		this.note_length = /\d+/.exec(note_string);
		if (this.note_length != null){
			this.note_length = parseFloat(this.note_length[0]);
		}else{
			this.note_length = 0;
		}



	}

	this.playSequence = function(mml_string){
		try{
			waves.triangle.stop("note")
		}catch(ex){

		}

		this.seq = new this.MMLSequence(mml_string);
		this.seq.play("triangle",100)
	}

}
