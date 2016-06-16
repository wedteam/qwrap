/*
 * XPC - 跨域解决方案
 * author : ququ，主要代码来源于欢欢（huanghuan@360.cn）同学的xdomain。致谢!
 * update : 2013.04.16
 * 
 * v0.2 (2013.04.16) 增对IE6、7下快速发送消息做了延时，防止丢消息 
 * v0.1 (2012.06.19) 第一个版本，利用window.name(IE6、7)和postMessage跨域传输数据
*/

(function() {
	var mix = QW.ObjectH.mix,
		on = QW.EventTargetH.on,
		stringify = QW.ObjectH.stringify,
		parse = QW.StringH.evalExp,
		forEach = QW.ArrayH.forEach,
		CustEvent = QW.CustEvent;

	var usePM = (typeof window.postMessage !== 'undefined');

	function XPC(options) {
		var defaultOpts = {
			isParent : parent == window,
			iframeName : 'XPC_IFRAME'
		};
		this.options = mix(options || {}, defaultOpts, false);
		this._initialize();
	};

	mix(XPC.prototype, {
		_initialize : function() {
			var me = this;
			CustEvent.createEvents(this);

			function callback(msg) {
				var data = {};
				try {
					data = parse(msg);
				} catch(e) {}

				me.fire('message', data);
			};

			if(usePM){
				on(window, 'message', function(e) {
					callback(e.data);
				});
			}else{
				var lastName = window.name;
				setInterval(function(){
					if(window.name != lastName && window.name != ''){
						lastName = window.name;
						var msgList = [];
						try {
							msgList = parse(lastName);
						} catch(e) {}

						forEach(msgList, function(msg) {
							callback(msg);
						});
					}
				},20);
			}
		},

		_postMessage : function(data) {
			this.win.postMessage(data, '*');
		},

		_postMessageForIE : function(data) {
			if(!this.msgList) {
				this.msgList = [];
			}

			this.msgList.push(data);

			if(!this.timer) {
				var instance = this;
				instance.timer = setInterval(function() {
					clearInterval(instance.timer);
					instance.win.name = stringify(instance.msgList);
					instance.msgList = [];
					instance.timer = null;
				}, 50);
			}
		},

		send : function(data) {
			var opts = this.options;

			this.win = opts.win || (opts.isParent ? window.frames[opts.iframeName] : parent);

			if(!this.win) throw new Error('XPC', "can not find window!");

			var newData = {
				data : data,
				ts : (+(new Date)).toString(36)
			};

			newData = stringify(newData);

			if(usePM){
				this._postMessage(newData);
			} else {
				this._postMessageForIE(newData);
			}
		}
	}, true);

	QW.provide('XPC', XPC);
})();