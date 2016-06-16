(function() {
	var ModuleH = QW.ModuleH;
	var useTimes = 0;

	describe('ModuleH', {
		'ModuleH Members': function() {
			value_of(ModuleH).log();
		},
		'provide': function() {
			ModuleH.provide("testtest1", 'value1');
			value_of(QW.testtest1).should_be("value1");
			ModuleH.provide({
				testtest2: 'value2'
			});
			value_of(QW.testtest2).should_be("value2");
		},
		'addConfig': function() {
			value_of(ModuleH).should_have_method('addConfig');
			ModuleH.addConfig("ArrayH2", {
				loadedChecker:function(){
					return !!(QW.ArrayH && QW.ArrayH.sortBy);
				},
				url: '//core/dev/array.h.js',
				requires: 'ArrayH'
			});
		},
		'use': function() {
			value_of(ModuleH).should_have_method('use');
			ModuleH.use("ArrayH2", function() {
				if (useTimes) {
					alert('已运行过');
					return;
				}
				describe('ArrayH2', {
					'use is ok': function() {
						if (useTimes) {
							alert('已运行过.');
							return;
						}
						useTimes = 1;
						value_of(QW.ArrayH).should_have_method('sortBy');
						value_of(QW.ArrayH.sortBy(['abc','cd'],'length')[0]).should_be("cd");
					}
				});
			});
		}

	});

}());