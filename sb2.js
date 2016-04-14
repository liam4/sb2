/*
 * sb2 by adespotist
 * 
 * https://github.com/adespotist/sb2
 */
(function ( root, factory ) {
	/*
	 * Make the module available to a load of different module systems, including...
	 * AMD,
	 */
	if ( typeof define === 'function' && define.amd )
		define( [], factory )
	
	/*
	 * Node and CommonJS, through `module.exports',
	 */
	else if ( typeof exports === 'object' )
		module.exports = factory.call()
	
	/*
	 * and where JavaScript is supposed to be, the browser!
	 */
	else
		root.sb2 = factory.call()
})(this, function () {
	return {}
})
