(function() {
	var AsyncH = QW.AsyncH,
		ObjectH = QW.ObjectH;
	//JK begin-----
	describe('Async', {
		'queue': function(){
			var i = 0;

			var q1 = function(){value_of(i).should_be(1)},
				q2 = function(){value_of(i).should_be(2)},
				q3 = function(){value_of(i).should_be(3)};

			AsyncH.wait(null, 'q', q1);
			AsyncH.wait(null, 'q', q2);
			AsyncH.wait(null, 'q', q3);
			
			i++;
			AsyncH.signal(null, 'q');
			
			i++;
			AsyncH.signal(null, 'q');
			
			i++;
			AsyncH.signal(null, 'q');	
		},
		'async queue': function(){
			var i = 0;
			var q1 = function(){
				setTimeout(function(){i++; AsyncH.signal(null); console && console.log(i)}, 2000);
			};
			//2s后在控制台依次输出1、2、3，每次输出间隔2s
			AsyncH.wait(null, q1);
			AsyncH.wait(null, q1);
			AsyncH.wait(null, q1);
		},
		'cancel task': function(){
			var task = function(signal){
				throw new Error; //如果成功阻止了，在控制台应该看不到这个异常
			};

			AsyncH.wait(null, 'task', task);
			setTimeout(function(){
				AsyncH.signal(null, 'task');
			}, 2000);

			AsyncH.clearSignals(null, 'task');
		},
		'global async': function(){
			var i = 0;
			var q1 = function(){
				setTimeout(function(){i++; Async.signal(); console && console.log(i)}, 2000);
			};
			//2s后在控制台依次输出1、2、3，每次输出间隔2s
			Async.wait(q1);
			Async.wait(q1);
			Async.wait(q1);			
		}
	});
}());