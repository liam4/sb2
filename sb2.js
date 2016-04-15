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
	
	// Provide the return the object to the module.
	return sb2
})
