(function() {
describe('Promise', {
	'readyState': function(){
		function p1(){
			var deferred = QW.defer();
			value_of(deferred.promise._readyState).should_be(0);
			deferred.resolve('ok');
			value_of(deferred.promise._readyState).should_be(1);
			return deferred.promise;
		}

		p1().then(function(result){
			describe("promise resolved", {
				'resolve': function(){
					value_of(result).should_be('ok');
				}
			});
		});

		function p2(){
			var deferred = QW.defer();
			value_of(deferred.promise._readyState).should_be(0);
			deferred.reject('err');
			value_of(deferred.promise._readyState).should_be(2);			
			return deferred.promise;
		}

		p2().then(function(){
			alert('promise state error');
		}).otherwise(function(reason){
			describe("promise reject", {
				'reject': function(){
					value_of(reason).should_be('err');
				}
			});
		});

		function p3(){
			var deferred = QW.defer();
			deferred.resolve(0);
			return deferred.promise;
		}

		p3().then(function(d){
			describe("promise then "+d, {
				'result': function(){
					value_of(d).should_be(0);
				}
			});
			return d+1;
		}).then(function(d){
			describe("promise then "+d, {
				'result': function(){
					value_of(d).should_be(1);
				}
			});
			return d+1;
		}).then(function(d){
			describe("promise then "+d, {
				'result': function(){
					value_of(d).should_be(2);
				}
			});
			return d+1;
		}).otherwise(function(){
			alert('promise state error!');
		});

		function p4(){
			var deferred = QW.defer();
			deferred.reject('err');
			return deferred.promise;			
		}

		p4().then(function(){
			alert('promise state error!');
		}).otherwise(function(d){
			describe("promise otherwise "+d, {
				'result': function(){
					value_of(d).should_be('err');
				}
			});			
			return 'ok';
		}).then(function(d){
			describe("promise then "+d, {
				'result': function(){
					value_of(d).should_be('ok');
				}
			});	
		}).otherwise(function(){
			alert('promise state error!');
		});

		function timedTrackMaker(dur, reject){
			return function(){
				var deferred = QW.defer();
				var start = new Date();

				setTimeout(function(){
					if(!reject){
						deferred.resolve(new Date() - start);
					}else{
						deferred.reject();
					}

				}, dur);
				return deferred.promise;				
			}
		}

		var asyncTest1 = timedTrackMaker(100);
		var asyncTest2 = timedTrackMaker(200);
		var asyncTest3 = timedTrackMaker(300);

		asyncTest1().then(function(time){
			describe("promise then one", {
				'result': function(){
					value_of(time).log('delay time:');
				}
			});	
		});	

		QW.P.all([asyncTest1(), asyncTest2(), asyncTest3()]).then(function(times){
			console.log(times);
			describe("promise then all", {
				'result': function(){
					value_of(times.toString()).log('delay times:');
				}
			});			
		});

		QW.P.any([asyncTest1(), asyncTest2(), asyncTest3()]).then(function(time){
			describe("promise then any", {
				'result': function(){
					value_of(time).log('delay time:');
				}
			});				
		});

		asyncTest1().then(function(time){
			describe("promise then " + time, {
				'result': function(){
					value_of(time).log('delay time:');
				}
			});	
			return asyncTest2(time);
		}).then(function(time){
			describe("promise then " + time, {
				'result': function(){
					value_of(time).log('delay time:');
				}
			});	
			return asyncTest3(time);
		}).then(function(time){
			describe("promise then " + time, {
				'result': function(){
					value_of(time).log('delay time:');
				}
			});	
		});
	}
});

})();