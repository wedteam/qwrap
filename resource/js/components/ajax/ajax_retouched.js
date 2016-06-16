/*
 *	Copyright (c) QWrap.
 *	version: $version$ $release$ released
 *  description: ajax
*/

(function() {
	var els = document.getElementsByTagName('script'),
		srcPath = '';
	for (var i = 0; i < els.length; i++) {
		var src = els[i].src.split(/[\\\/]components[\\\/]/g);
		if (src[1]) {
			srcPath = src[0] + '/';
			break;
		}
	}

	document.write('<script type="text/javascript" src="' + srcPath + 'components/ajax/ajax.js"></script>');
	document.write('<script type="text/javascript" src="' + srcPath + 'components/ajax/ajax_retouch.js"></script>');
}());