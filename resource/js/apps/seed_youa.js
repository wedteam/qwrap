(function() {
	var els = document.getElementsByTagName('script'),
		srcPath = '';
	for (var i = 0; i < els.length; i++) {
		var src = els[i].src.split(/apps[_\-\\\/]/g);
		if (src[1]) {
			srcPath = src[0];
			break;
		}
	}

	//通过以下update-tag，来解决core与dom不是同时提测的问题
	//update-tag: core/* -
	//update-tag: dom/* tag001


	document.write('<script type="text/javascript" src="' + srcPath + 'core/core_base.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'core/module.h.js"><\/script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'apps/youa_modules_config.js"><\/script>');

}());