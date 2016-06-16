/*
 * @fileoverview Encapsulates common operations of Ajax
 * @author　JK ,绝大部分代码来自BBLib/util/BBAjax(1.0版),其作者为：Miller。致谢
 * @version 0.1
 * @create-date : 2009-02-20
 * @last-modified : 2009-02-20
 */


(function() {
	var mix = QW.ObjectH.mix,
		encodeURIJson = QW.ObjectH.encodeURIJson,
		encodeURIForm = QW.NodeH.encodeURIForm,
		CustEvent = QW.CustEvent;

	/**
	* @class Ajax Ajax类的构造函数
	* @param {json} options 构造参数
		*----------------------------------------------------------------------------------------
		*| options属性		|		说明					|	默认值							|
		*----------------------------------------------------------------------------------------
		*| url: 			|	请求的路径					|	空字符串						|
		*| method: 			|	请求的方法					|	get								|
		*| async: 			|	是否异步请求				|	true							|
		*| user:			|	用户名						|	空字符串						|
		*| pwd:				|	密码						|	空字符串						|
		*| requestHeaders:	|	请求头属性					|	{}								|
		*| data:			|	发送的数据					|	空字符串						|
		*| useLock:			|	是否使用锁机制				|	0								|
		*| timeout:			|	设置请求超时的时间（ms）	|	30000							|
		*| onsucceed:		|	请求成功监控 (成功指：200-300以及304)							|
		*| onerror:			|	请求失败监控													|
		*| oncancel:		|	请求取消监控													|
		*| ontimeout:		|	超时													|
		*| oncomplete:		|	请求结束监控 (success与error都算complete)						|
		*----------------------------------------------------------------------------------------
	* @return {Ajax} 
	*/

	function Ajax(options) {
		this.options = options;
		this._initialize();
	}

	mix(Ajax, {
		/*
		 * 请求状态
		 */
		STATE_INIT: 0,
		STATE_REQUEST: 1,
		STATE_SUCCESS: 2,
		STATE_ERROR: 3,
		STATE_TIMEOUT: 4,
		STATE_CANCEL: 5,
		/** 
		 * defaultHeaders: 默认的requestHeader信息
		 */
		defaultHeaders: {
			'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8', //最常用配置
			'X-Requested-With':'XMLHttpRequest'
		},
		/** 
		 * EVENTS: Ajax的CustEvents：'succeed','error','cancel','timeout','complete'
		 */
		EVENTS: ['succeed', 'error', 'cancel', 'timeout','complete'],
		/* 
		 * getXHR(): 得到一个XMLHttpRequest对象
		 * @returns {XMLHttpRequest} : 返回一个XMLHttpRequest对象。
		 */
		getXHR: (function() {
			//JK： 以下代码，参考自jquery1.8.2
			var ajaxLocation;
			try {
				ajaxLocation = location.href;
			} catch( e ) {
				// Use the href attribute of an A element
				// since IE will modify it given document.location
				ajaxLocation = document.createElement( "a" );
				ajaxLocation.href = "";
				ajaxLocation = ajaxLocation.href;
			}
			var isLocal = (/^(about|app|app\-storage|.+\-extension|file|res|widget):/i).test(ajaxLocation);
			function createStandardXHR() {
				try {
					return new window.XMLHttpRequest();
				} catch( e ) {}
			}

			function createActiveXHR() {
				try {
					return new window.ActiveXObject( "Microsoft.XMLHTTP" );
				} catch( e ) {}
			}

			return window.ActiveXObject ?
				/* Microsoft failed to properly
				 * implement the XMLHttpRequest in IE7 (can't request local files),
				 * so we use the ActiveXObject when it is available
				 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
				 * we need a fallback.
				 */
				function() {
					return !isLocal && createStandardXHR() || createActiveXHR();
				} :
				// For all other browsers, use the standard XMLHttpRequest object
				createStandardXHR;
		}()),
		/**
		 * 静态request方法
		 * @method request
		 * @static
		 * @param {String|Form} url 请求的地址。（也可以是Json，当为Json时，则只有此参数有效，会当作Ajax的构造参数）。
		 * @param {String|Json|Form} data (Optional)发送的数据
		 * @param {Function} callback 请求完成后的回调
		 * @param {String} method (Optional) 请求方式，get或post
		 * @returns {Ajax}
		 * @example 
			QW.Ajax.request('http://demo.com',{key: 'value'},function(responseText){alert(responseText);});
		 */
		request: function(url, data, callback, method) {
			if (url.constructor == Object) {
				var a = new Ajax(url);
			} else {
				if (typeof data == 'function') {
					method = callback;
					callback = data;
					if (url && url.tagName == 'FORM') {
						method = method || url.method;
						data = url;
						url = url.action;
					} else {
						data = '';
					}
				}
				a = new Ajax({
					url: url,
					method: method,
					data: data,
					onsucceed: function() {
						callback.call(this, this.requester.responseText);
					}
				});
			}
			a.send();
			return a;
		},
		/**
		 * 静态get方法
		 * @method get
		 * @static
		 * @param {String|Form} url 请求的地址
		 * @param {String|Json|Form} data (Optional)发送的数据
		 * @param {Function} callback 请求完成后的回调
		 * @returns {Ajax}
		 * @example
		 QW.Ajax.get('http://demo.com',{key: 'value'},function(responseText){alert(responseText);});
		 */
		get: function(url, data, callback) {
			var args = [].slice.call(arguments, 0);
			args.push('get');
			return Ajax.request.apply(null, args);
		},
		/**
		 * 静态post方法
		 * @method post
		 * @static
		 * @param {String|Form} url 请求的地址
		 * @param {String|Json|Form} data (Optional)发送的数据
		 * @param {Function} callback 请求完成后的回调
		 * @returns {Ajax}
		 * @example
		 QW.Ajax.post('http://demo.com',{key: 'value'},function(responseText){alert(responseText);});
		 */
		post: function(url, data, callback) {
			var args = [].slice.call(arguments, 0);
			args.push('post');
			return Ajax.request.apply(null, args);
		}
	});

	mix(Ajax.prototype, {
		//参数
		url: '',
		method: 'get',
		async: true,
		user: '',
		pwd: '',
		requestHeaders: null, //是一个json对象
		data: '',
		/*
		 * 是否给请求加锁，如果加锁则必须在之前的请求完成后才能进行下一次请求。
		 * 默认不加锁。
		 */
		useLock: 0,
		timeout: 30000, //超时时间

		//私有变量｜readOnly变量
		isLocked: 0, //处于锁定状态
		state: Ajax.STATE_INIT, //还未开始请求
		/** 
		 * send( url, method, data ): 发送请求
		 * @param {string} url 请求的url
		 * @param {string} method 传送方法，get/post
		 * @param {string|jason|FormElement} data 可以是字符串，也可以是Json对象，也可以是FormElement
		 * @returns {void} 
		 */
		send: function(url, method, data) {
			var me = this;
			if (me.isLocked) throw new Error('Locked.');
			else if (me.isProcessing()) {
				me.cancel();
			}
			var requester = me.requester;
			if (!requester) {
				requester = me.requester = Ajax.getXHR();
				if (!requester) {
					throw new Error('Fail to get HTTPRequester.');
				}
			}
			url = url || me.url;
			url = url.split('#')[0];
			method = (method || me.method || '').toLowerCase();
			if (method != 'post') method = 'get';
			data = data || me.data;

			if (typeof data == 'object') {
				if (data.tagName == 'FORM') data = encodeURIForm(data); //data是Form HTMLElement
				else data = encodeURIJson(data); //data是Json数据
			}

			//如果是get方式请求，则传入的数据必须是'key1=value1&key2=value2'格式的。
			if (data && method != 'post') url += (url.indexOf('?') != -1 ? '&' : '?') + data;
			if (me.user) requester.open(method, url, me.async, me.user, me.pwd);
			else requester.open(method, url, me.async);
			//设置请求头
			for (var i in me.requestHeaders) {
				requester.setRequestHeader(i, me.requestHeaders[i]);
			}
			//重置
			me.isLocked = 0;
			me.state = Ajax.STATE_INIT;
			//send事件
			if (me.async) {
				me._sendTime = new Date();
				if (me.useLock) me.isLocked = 1;
				this.requester.onreadystatechange = function() {
					var state = me.requester.readyState;
					if (state == 4) {
						me._execComplete();
					}
				};
				me._checkTimeout();
			}
			if (method == 'post') {
				if (!data) data = ' ';
				requester.send(data);
			} else {
				requester.send(null);
			}
			if (!me.async) {
				me._execComplete();
				return me.requester.responseText;
			}

		},
		/** 
		 * isSuccess(): 判断现在的状态是否是“已请求成功”
		 * @returns {boolean} : 返回XMLHttpRequest是否成功请求。
		 */
		isSuccess: function() {
			var status = this.requester.status;
			return !status || (status >= 200 && status < 300) || status == 304;
		},
		/** 
		 * isProcessing(): 判断现在的状态是否是“正在请求中”
		 * @returns {boolean} : 返回XMLHttpRequest是否正在请求。
		 */
		isProcessing: function() {
			var state = this.requester ? this.requester.readyState : 0;
			return state > 0 && state < 4;
		},
		/** 
		 * get(url,data): 用get方式发送请求
		 * @param {string} url: 请求的url
		 * @param {string|jason|FormElement} data: 可以是字符串，也可以是Json对象，也可以是FormElement
		 * @returns {void} : 。
		 * @see : send 。
		 */
		get: function(url, data) {
			this.send(url, 'get', data);
		},
		/** 
		 * get(url,data): 用post方式发送请求
		 * @param {string} url: 请求的url
		 * @param {string|jason|FormElement} data: 可以是字符串，也可以是Json对象，也可以是FormElement
		 * @returns {void} : 。
		 * @see : send 。
		 */
		post: function(url, data) {
			this.send(url, 'post', data);
		},
		/** 
		 * cancel(): 取消请求
		 * @returns {boolean}: 是否有取消动作发生（因为有时请求已经发出，或请求已经成功）
		 */
		cancel: function() {
			var me = this;
			if (me.requester && me.isProcessing()) {
				me.state = Ajax.STATE_CANCEL;
				me.requester.abort();
				me._execComplete();
				me.fire('cancel');
				return true;
			}
			return false;
		},
		/** 
		 * _initialize(): 对一个Ajax进行初始化
		 * @returns {void}: 
		 */
		_initialize: function() {
			var me = this;
			CustEvent.createEvents(me, Ajax.EVENTS);
			mix(me, me.options, 1);
			me.requestHeaders = mix(me.requestHeaders || {}, Ajax.defaultHeaders);

		},
		/** 
		 * _checkTimeout(): 监控是否请求超时
		 * @returns {void}: 
		 */
		_checkTimeout: function() {
			var me = this;
			if (me.async) {
				clearTimeout(me._timer);
				this._timer = setTimeout(function() {
					// Check to see if the request is still happening
					if (me.requester && me.isProcessing()) {
						// Cancel the request
						me.state = Ajax.STATE_TIMEOUT;
						me.requester.abort(); //Firefox执行该方法后会触发onreadystatechange事件，并且state=4;所以会触发oncomplete事件。而IE、Safari不会
						me._execComplete('timeout');
					}
				}, me.timeout);
			}
		},
		/** 
		 * _execComplete(): 执行请求完成的操作
		 * @returns {void}: 
		 */
		_execComplete: function(reason) {
			var me = this;
			var requester = me.requester;
			requester.onreadystatechange = new Function; //防止IE6下的内存泄漏
			me.isLocked = 0; //解锁
			clearTimeout(this._timer);
			var responseText = null;
			try{
				responseText = me.requester.responseText;
			}
			catch(ex){
			}

			if(reason == 'timeout'){
				me.fire('timeout');
			}
			if (me.state == Ajax.STATE_CANCEL || me.state == Ajax.STATE_TIMEOUT) {
				//do nothing. 如果是被取消掉的则不执行回调
			} else if (me.isSuccess()) {
				me.state = Ajax.STATE_SUCCESS;
				me.fire('succeed', {responseText:responseText});
			} else {
				me.state = Ajax.STATE_ERROR;
				me.fire('error', {responseText:responseText});
			}
			me.fire('complete', {responseText:responseText});
		}
	});

	QW.provide('Ajax', Ajax);
}());