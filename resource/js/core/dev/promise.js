(function(){

var mix = QW.ObjectH.mix,
ArrayH = QW.ArrayH;

function Promise(){
	this._resolves = [];
	this._readyState = Promise.PENDING;
	this._data = null;
}

mix(Promise.prototype, {
	then: function(onFulfilled, onRejected){
		var deferred = new Defer(),
			self = this;

		function fulfill(data){
			var ret, readyState = self._readyState;

			if(readyState === Promise.FULFILLED){
				ret = onFulfilled ? onFulfilled(data) : data;
			}else if(readyState === Promise.REJECTED){
				ret = onRejected ? onRejected(data) : data;
			}

			if(Promise.isPromise(ret)){
				//如果是Promise，往下传递
				ret.then(function(data){
					deferred.resolve(data);
				}, function(data){
					deferred.reject(data);
				});
			}else{
				//不是Promise，处理返回值
				if(readyState !== Promise.REJECTED || onRejected){
					//没有异常或者已经处理了异常，返回值当作正常值处理
					deferred.resolve(ret);
				}else{
					//丢给后续的Promise处理
					deferred.reject(ret);
				}
			}
			return ret;
		}

		if(this._readyState === Promise.PENDING){
			this._resolves.push(fulfill);
		}else{
			setTimeout(function(){
				fulfill(self._data);
			});
		}

		return deferred.promise;
	},
	otherwise: function(onRejected){
		return this.then(undefined, onRejected);
	}
});

mix(Promise, {
	PENDING   : 0,
	FULFILLED : 1,
	REJECTED  : 2,
	isPromise: function(obj){
		return obj != null && typeof obj['then'] === 'function';
	}
});

function _resolve(promise, data, state){
	var state = state || Promise.FULFILLED;

	if(promise._readyState !== Promise.PENDING){
		return;
	}
	
	promise._readyState = state;
	promise._data = data;

	ArrayH.forEach(promise._resolves, function(handler){
		setTimeout(function(){
			handler(data);
		});
	});
}

function Defer(){
	this.promise = new Promise();
}

mix(Defer.prototype,{
	resolve: function(data){
		return _resolve(this.promise, data, Promise.FULFILLED);
	},
	reject: function(reason){
		return _resolve(this.promise, reason, Promise.REJECTED);
	}
});

QW.P = {
	defer: function(){
		return new Defer();
	},
	isPromise: function(promiseOrValue){
		return Promise.isPromise(promiseOrValue);
	},
	all: function(promises){
		var deferred = QW.P.defer();

		var n = 0, result = [];
		ArrayH.forEach(promises, function(promise){
			promise.then(function(ret){
				result.push(ret);
				n++;

				if(n >= promises.length){
					deferred.resolve(result);
				}
			});
		});

		return deferred.promise;
	},
	any: function(promises){
		var deferred = QW.P.defer();

		ArrayH.forEach(promises, function(promise){
			promise.then(function(ret){
				deferred.resolve(ret);
			});
		});

		return deferred.promise;
	}
};

QW.defer = QW.P.defer; 

})();