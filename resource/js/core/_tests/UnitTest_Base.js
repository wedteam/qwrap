(function() {

	describe('QW', {
		'QW Members': function() {
			value_of("测试QW拥有的属性").log();

			value_of(QW.ObjectH.isPlainObject(QW)).should_be(true);
			value_of(typeof QW.VERSION).should_be('string');
			value_of(typeof QW.RELEASE).should_be('string');

			value_of("测试QW拥有的方法").log();

			value_of(QW).should_have_method('noConflict');

			value_of(QW.PATH).log();

		},
		'namespace': function() {
			var a = QW.namespace('.Students');
			a.jk = 'JK';
			value_of(QW.Students.jk).should_be('JK');

			var b = QW.namespace('QW.Students');
			value_of(QW.Students.jk).should_be('JK');

			var tom = QW.namespace('tom', QW.Students);
			tom.name = "Tom";
			value_of(QW.Students.tom.name).should_be('Tom');

			delete QW.Students;
		},
		loadCss: function() {
			var testDiv = document.createElement('div');
			testDiv.id = 'UnitTest-loadCss';
			document.body.appendChild(testDiv);
			QW.loadCss('UnitTest_loadCss.css');

			setTimeout(function() {
				describe('QW-ASYNC', {
					'loadedCss': function() {
						var style, result;

						if (QW.Browser.ie) {
							result = testDiv.currentStyle['fontSize'];
						} else {
							style = testDiv.ownerDocument.defaultView.getComputedStyle(testDiv,null);
							result = style ? style.getPropertyValue('font-size') : null;
						}
						value_of(result).should_be('30px');
						document.body.removeChild(testDiv);
					}
				});
			}, 200);
		}
	});

}());