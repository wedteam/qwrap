(function(){
	var MonitorH = QW.MonitorH;
	
	describe('MonitorH', {
		'init': function() {
			value_of(MonitorH).should_have_method('addWatch');
			
			MonitorH.on('before', function(evt){
				var data = QW.ObjectH.dump(evt, ["id", "startTime", "endTime", "helper", "method", "ret", "type"]);
				value_of(QW.ObjectH.stringify(data)).log()
			});

			MonitorH.on('after', function(evt){
				var data = QW.ObjectH.dump(evt, ["id", "startTime", "endTime", "helper", "method", "ret", "type"]);
				value_of(QW.ObjectH.stringify(data)).log()
			});
		},
		'Watch StringH' : function(){
			QW.StringH = MonitorH.addWatch(QW.StringH, "StringH");
			QW.StringH.trim("abc");
			QW.StringH.capitalize("aBC");
			MonitorH.clearWatch("StringH");
		},
		'Watch ArrayH' : function(){
			QW.ArrayH = MonitorH.addWatch(QW.ArrayH, "ArrayH");
			QW.ArrayH.contains([1,2,3], 1);
			MonitorH.clearWatch("ArrayH");
		},
		'Report' : function(){
			value_of((QW.ObjectH.stringify(MonitorH.getReport()))).log();
		}
	});

})();