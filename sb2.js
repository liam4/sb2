(function ( root, factory ) {
	// Make the module available to a load of different module systems, including...
 	// AMD,
	if ( typeof define === 'function' && define.amd )
		define( [], factory )

	// Node and CommonJS, through `module.exports',
	else if ( typeof exports === 'object' )
		module.exports = factory.call()

	// and where JavaScript is supposed to be, the browser!
	else
		root.sb2 = factory.call()
})(this, function () {
	var sb2 = {}

	// A Project is simply a collection of Sprites and a Stage.
	sb2.Project = function Project() {
		// Create an empty Project with no Sprites and no Stage.
		this.stage = null
		this.sprites = []
	}

	// Actors are things that belong in a Project.
	// Their only property is a parent Project.
	sb2.Actor = function Actor( parent ) {
		// Actors are, like Scriptables, abstract, so you can't create them.
		if ( this.constructor === sb2.Actor )
			throw new Error( 'Cannot instantiate Actor: Abstract' )

		if ( ! ( parent instanceof sb2.Project ) )
				throw new Error( 'Parent must be of type Project' )

		this.project = parent
	}

	// Scriptables are things with Scripts.
	// Everything with Scripts also have, by extension, costumes and sounds.
	sb2.Scriptable = function Scriptable( parent ) {
		// Scriptables are abstract so you can't create them.
		if ( this.constructor === sb2.Scriptable )
			throw new Error( 'Cannot instantiate Scriptable: Abstract' )

		sb2.Actor.apply( this, arguments )
		this.variables = []
		this.lists = []
		this.costumes = []
		this.sounds = []
		this.scripts = []
		this.costumeIndex = 0
	}

	// Stages are Scriptables that contain some additional information about the Project
	// that is its parent.
	sb2.Stage = function Stage( parent ) {
		sb2.Scriptable.apply( this, arguments )
		this.tempo = 60
		this.transparency = 0
		this.project.stage = this
	}

	// Sprites are Scriptables with properties relating to motion such as direction,
	// X position and Y position.
	sb2.Sprite = function Sprite( parent, name ) {
		sb2.Scriptable.apply( this, [ parent ] )
		this.name = name
		this.x = 0
		this.y = 0
		this.scale = 100
		this.direction = 90
		this.visible = true
		this.index = this.project.sprites.length
		this.project.sprites.push( this )
	}

	// A Costume is simply an image file with a name.
	sb2.Costume = function Costume( file, name ) {
		this.name = name
		this.file = file
	}

	// A Sound is merely a sound file with a name.
	sb2.Sound = function Sound( file, name ) {
		this.name = name
		this.file = file
	}

	// Blocks are specs with a list of arguments.
	// Some blocks can also take Scripts as arguments.
	sb2.Block = function Block( spec, arguments ) {
		if ( sb2.Block.specs.map(function ( spec ) { return spec[2] }).indexOf( spec ) != -1 ) {
			this.spec = spec
			if ( Array.isArray( arguments ) )
				this.arguments = arguments
			else
				this.arguments = [ arguments ]
		} else
			throw new Error( 'Please provide valid block spec' )
	}

	// Serialize a Block into JSON to be directly included in the Project.
	sb2.Block.serialize = function serializeBlock( block ) {
		// Block tuples are [spec, arguments...] without a nested array for arguments.
		// We need to flatten the array first.
		return JSON.stringify( [].concat.apply( [], [ block.spec, block.arguments ] ) )
	}

	// Scripts are lists of Blocks with coordinates on the scripting area.
	// Scripts don't need to start with hat blocks - some scripts don't have them.
	sb2.Script = function Script( x, y, blocks ) {
		this.x = x
		this.y = y
		this.blocks = blocks
	}

	// Serialize a Script into JSON to be directly included in the Project.
	sb2.Script.serialize = function serializeScript( script ) {
		return JSON.stringify(
			[ script.x,
				script.y,
					script.blocks ]
		)
	}

	// Comments are bits of text attached to the scripting area.
	// TODO: Attach comments to Blocks
	sb2.Comment = function Comment( x, y, w, h, message ) {
		this.x = x
		this.y = y
		this.width = w
		this.height = h
		this.content = message
	}

	sb2.Comment.serialize = function serializeComment( comment ) {
		return JSON.stringify(
			[ comment.x, comment.y,
				comment.width, comment.height,
				true, -1, comment.message ]
		)
	}

	// A Variable is a name associated with a value.
	// It belongs to a Scriptable.
	sb2.Variable = function Variable( name, value, parent ) {
		this.name = name
		this.value = value
		this.parent = parent
		this.parent.variables.push(this)
	}


	sb2.Block.specs = [
		['move %n steps', ' ', 'forward:'],
		['turn @turnRight %n degrees', ' ', 'turnRight:'],
		['turn @turnLeft %n degrees', ' ', 'turnLeft:'],
		['point in direction %d.direction', ' ', 'heading:'],
		['point towards %m.spriteOrMouse', ' ', 'pointTowards:'],
		['go to x:%n y:%n', ' ', 'gotoX:y:'],
		['go to %m.location', ' ', 'gotoSpriteOrMouse:'],
		['glide %n secs to x:%n y:%n', ' ', 'glideSecs:toX:y:elapsed:from:'],
		['change x by %n', ' ', 'changeXposBy:'],
		['set x to %n', ' ', 'xpos:'],
		['change y by %n', ' ', 'changeYposBy:'],
		['set y to %n', ' ', 'ypos:'],
		['if on edge, bounce', ' ', 'bounceOffEdge'],
		['set rotation style %m.rotationStyle', ' ', 'setRotationStyle'],
		['x position', 'r', 'xpos'],
		['y position', 'r', 'ypos'],
		['direction', 'r', 'heading'],
		['say %s for %n secs', ' ', 'say:duration:elapsed:from:'],
		['say %s', ' ', 'say:'],
		['think %s for %n secs', ' ', 'think:duration:elapsed:from:'],
		['think %s', ' ', 'think:'],
		['show', ' ', 'show'],
		['hide', ' ', 'hide'],
		['switch costume to %m.costume', ' ', 'lookLike:'],
		['next costume', ' ', 'nextCostume'],
		['switch backdrop to %m.backdrop', ' ', 'startScene'],
		['change %m.effect effect by %n', ' ', 'changeGraphicEffect:by:'],
		['set %m.effect effect to %n', ' ', 'setGraphicEffect:to:'],
		['clear graphic effects', ' ', 'filterReset'],
		['change size by %n', ' ', 'changeSizeBy:'],
		['set size to %n%', ' ', 'setSizeTo:'],
		['go to front', ' ', 'comeToFront'],
		['go back %n layers', ' ', 'goBackByLayers:'],
		['costume #', 'r', 'costumeIndex'],
		['backdrop name', 'r', 'sceneName'],
		['size', 'r', 'scale'],
		['switch backdrop to %m.backdrop', ' ', 'startScene'],
		['switch backdrop to %m.backdrop and wait', ' ', 'startSceneAndWait'],
		['next backdrop', ' ', 'nextScene'],
		['change %m.effect effect by %n', ' ', 'changeGraphicEffect:by:'],
		['set %m.effect effect to %n', ' ', 'setGraphicEffect:to:'],
		['clear graphic effects', ' ', 'filterReset'],
		['backdrop name', 'r', 'sceneName'],
		['backdrop #', 'r', 'backgroundIndex'],
		['play sound %m.sound', ' ', 'playSound:'],
		['play sound %m.sound until done', ' ', 'doPlaySoundAndWait'],
		['stop all sounds', ' ', 'stopAllSounds'],
		['play drum %d.drum for %n beats', ' ', 'playDrum'],
		['rest for %n beats', ' ', 'rest:elapsed:from:'],
		['play note %d.note for %n beats', ' ', 'noteOn:duration:elapsed:from:'],
		['set instrument to %d.instrument', ' ', 'instrument:'],
		['change volume by %n', ' ', 'changeVolumeBy:'],
		['set volume to %n%', ' ', 'setVolumeTo:'],
		['volume', 'r', 'volume'],
		['change tempo by %n', ' ', 'changeTempoBy:'],
		['set tempo to %n bpm', ' ', 'setTempoTo:'],
		['tempo', 'r', 'tempo'],
		['clear', ' ', 'clearPenTrails'],
		['stamp', ' ', 'stampCostume'],
		['pen down', ' ', 'putPenDown'],
		['pen up', ' ', 'putPenUp'],
		['set pen color to %c', ' ', 'penColor:'],
		['change pen color by %n', ' ', 'changePenHueBy:'],
		['set pen color to %n', ' ', 'setPenHueTo:'],
		['change pen shade by %n', ' ', 'changePenShadeBy:'],
		['set pen shade to %n', ' ', 'setPenShadeTo:'],
		['change pen size by %n', ' ', 'changePenSizeBy:'],
		['set pen size to %n', ' ', 'penSize:'],
		['clear', ' ', 'clearPenTrails'],
		['when @greenFlag clicked', 'h', 'whenGreenFlag'],
		['when %m.key key pressed', 'h', 'whenKeyPressed'],
		['when this sprite clicked', 'h', 'whenClicked'],
		['when backdrop switches to %m.backdrop', 'h', 'whenSceneStarts'],
		['when %m.triggerSensor > %n', 'h', 'whenSensorGreaterThan'],
		['when I receive %m.broadcast', 'h', 'whenIReceive'],
		['broadcast %m.broadcast', ' ', 'broadcast:'],
		['broadcast %m.broadcast and wait', ' ', 'doBroadcastAndWait'],
		['wait %n secs', ' ', 'wait:elapsed:from:'],
		['repeat %n', 'c', 'doRepeat'],
		['forever', 'cf', 'doForever'],
		['if %b then', 'c', 'doIf'],
		['if %b then', 'e', 'doIfElse'],
		['wait until %b', ' ', 'doWaitUntil'],
		['repeat until %b', 'c', 'doUntil'],
		['stop %m.stop', 'f', 'stopScripts'],
		['when I start as a clone', 'h', 'whenCloned'],
		['create clone of %m.spriteOnly', ' ', 'createCloneOf'],
		['delete this clone', 'f', 'deleteClone'],
		['wait %n secs', ' ', 'wait:elapsed:from:'],
		['repeat %n', 'c', 'doRepeat'],
		['forever', 'cf', 'doForever'],
		['if %b then', 'c', 'doIf'],
		['if %b then', 'e', 'doIfElse'],
		['wait until %b', ' ', 'doWaitUntil'],
		['repeat until %b', 'c', 'doUntil'],
		['stop %m.stop', 'f', 'stopScripts'],
		['create clone of %m.spriteOnly', ' ', 'createCloneOf'],
		['touching %m.touching?', 'b', 'touching:'],
		['touching color %c?', 'b', 'touchingColor:'],
		['color %c is touching %c?', 'b', 'color:sees:'],
		['distance to %m.spriteOrMouse', 'r', 'distanceTo:'],
		['ask %s and wait', ' ', 'doAsk'],
		['answer', 'r', 'answer'],
		['key %m.key pressed?', 'b', 'keyPressed:'],
		['mouse down?', 'b', 'mousePressed'],
		['mouse x', 'r', 'mouseX'],
		['mouse y', 'r', 'mouseY'],
		['loudness', 'r', 'soundLevel'],
		['video %m.videoMotionType on %m.stageOrThis', 'r', 'senseVideoMotion'],
		['turn video %m.videoState', ' ', 'setVideoState'],
		['set video transparency to %n%', ' ', 'setVideoTransparency'],
		['timer', 'r', 'timer'],
		['reset timer', ' ', 'timerReset'],
		['%m.attribute of %m.spriteOrStage', 'r', 'getAttribute:of:'],
		['current %m.timeAndDate', 'r', 'timeAndDate'],
		['days since 2000', 'r', 'timestamp'],
		['username', 'r', 'getUserName'],
		['ask %s and wait', ' ', 'doAsk'],
		['answer', 'r', 'answer'],
		['key %m.key pressed?', 'b', 'keyPressed:'],
		['mouse down?', 'b', 'mousePressed'],
		['mouse x', 'r', 'mouseX'],
		['mouse y', 'r', 'mouseY'],
		['loudness', 'r', 'soundLevel'],
		['video %m.videoMotionType on %m.stageOrThis', 'r', 'senseVideoMotion'],
		['turn video %m.videoState', ' ', 'setVideoState'],
		['set video transparency to %n%', ' ', 'setVideoTransparency'],
		['timer', 'r', 'timer'],
		['reset timer', ' ', 'timerReset'],
		['%m.attribute of %m.spriteOrStage', 'r', 'getAttribute:of:'],
		['current %m.timeAndDate', 'r', 'timeAndDate'],
		['days since 2000', 'r', 'timestamp'],
		['username', 'r', 'getUserName'],
		['%n + %n', 'r', '+'],
		['%n - %n', 'r', '-'],
		['%n * %n', 'r', '*'],
		['%n / %n', 'r', '/'],
		['pick random %n to %n', 'r', 'randomFrom:to:'],
		['%s < %s', 'b', '<'],
		['%s = %s', 'b', '='],
		['%s > %s', 'b', '>'],
		['%b and %b', 'b', '&'],
		['%b or %b', 'b', '|'],
		['not %b', 'b', 'not'],
		['join %s %s', 'r', 'concatenate:with:'],
		['letter %n of %s', 'r', 'letter:of:'],
		['length of %s', 'r', 'stringLength:'],
		['%n mod %n', 'r', '%'],
		['round %n', 'r', 'rounded'],
		['%m.mathOp of %n', 'r', 'computeFunction:of:'],
		['set %m.var to %s', ' ', 'SET_VAR'],
		['change %m.var by %n', ' ', 'CHANGE_VAR'],
		['show variable %m.var', ' ', 'showVariable:'],
		['hide variable %m.var', ' ', 'hideVariable:'],
		['add %s to %m.list', ' ', 'append:toList:'],
		['delete %d.listDeleteItem of %m.list', ' ', 'deleteLine:ofList:'],
		['insert %s at %d.listItem of %m.list', ' ', 'insert:at:ofList:'],
		['replace item %d.listItem of %m.list with %s', ' ', 'setLine:ofList:to:'],
		['item %d.listItem of %m.list', 'r', 'getLine:ofList:'],
		['length of %m.list', 'r', 'lineCountOfList:'],
		['%m.list contains %s?', 'b', 'list:contains:'],
		['show list %m.list', ' ', 'showList:'],
		['hide list %m.list', ' ', 'hideList:'],
		['play drum %n for %n beats', ' ', 'drum:duration:elapsed:from:'],
		['set instrument to %n', ' ', 'midiInstrument:'],
		['loud?', 'b', 'isLoud'],
		['abs %n', 'r', 'abs'],
		['sqrt %n', 'r', 'sqrt'],
		['stop script', 'f', 'doReturn'],
		['stop all', 'f', 'stopAll'],
		['switch to background %m.costume', ' ', 'showBackground:'],
		['next background', ' ', 'nextBackground'],
		['forever if %b', 'cf', 'doForeverIf'],
		['noop', 'r', 'COUNT'],
		['counter', 'r', 'COUNT'],
		['clear counter', ' ', 'CLR_COUNT'],
		['incr counter', ' ', 'INCR_COUNT'],
		['for each %m.varName in %s', 'c', 'doForLoop'],
		['while %b', 'c', 'doWhile'],
		['all at once', 'c', 'warpSpeed'],
		['scroll right %n', ' ', 'scrollRight'],
		['scroll up %n', ' ', 'scrollUp'],
		['align scene %m.scrollAlign', ' ', 'scrollAlign'],
		['x scroll', 'r', 'xScroll'],
		['y scroll', 'r', 'yScroll'],
		['hide all sprites', ' ', 'hideAll'],
		['user id', 'r', 'getUserId']
	]


	// Provide the return the object to the module.
	return sb2
})
