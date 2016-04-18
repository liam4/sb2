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
	// This is where the fun begins.
	var sb2 = {}

	// A Project is simply a collection of Sprites and a Stage.
	sb2.Project = function Project () {
		// Create an empty Project with no Sprites and no Stage.
		this.stage = null
		this.sprites = []
	}

	// Actors are things that belong in a Project.
	// Their only property is a parent Project.
	sb2.Actor = function Actor ( parent ) {
		// Actors are, like Scriptables, abstract, so you can't create them.
		if ( this.constructor === sb2.Actor )
			throw new Error( 'Cannot instantiate Actor: Abstract' )

		this.project = parent
	}

	// Scriptables are things with Scripts.
	// Everything with Scripts also have, by extension, costumes and sounds.
	sb2.Scriptable = function Scriptable ( parent ) {
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
	sb2.Stage = function Stage ( parent ) {
		sb2.Scriptable.apply( this, arguments )
		this.penLayerId = 0
		this.penLayerMD5 = 0
		this.tempo = 60
		this.transparency = 0
		this.project.stage = this
	}

	// Sprites are Scriptables with properties relating to motion such as direction,
	// X position and Y position.
	sb2.Sprite = function Sprite ( parent, name ) {
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

	// Provide the return the object to the module.
	return sb2
})
