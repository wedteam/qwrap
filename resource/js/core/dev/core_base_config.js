(function(){
	var QW = {
		/**
		 * 从script标签中的data-config属性读取json配置到js代码中 (Added by akira 2011-12-12)
		 *    在动态web开发过程中config有着很重要的作用，
		 *    因为如果组件里面有些js配置项跟着server端的配置不同而改变，
		 *    之前只能将这部分代码单独抽出来放在模板里面写，但这么做又破坏了组件的完整性，
		 *    而script标签的引入通常是放在模板中的，
		 *    因此config机制，实际上提供了从模板中向js中引入动态数据的接口，
		 *    使得组件能够保持优雅和完整。
		 *
		 *     var config_data = QW.config(); //get all
		 *     var val = QW.config(key); //gettter
		 *     QW.config(key, value); //setter
		 *
		 * @param { string } key (Optional)
		 * @param { string } value (Optional)
		 */
		config: (function(){
			var config = {};
			return function(key, value){
				var scripts = document.getElementsByTagName('script');
				for(var i = 0,len = scripts.length; i < len; i++){
					var scriptEl = scripts[i];
					var s = scriptEl['data-config'] || scriptEl.getAttribute('data-config');
					if(s){
						if(s.indexOf('{') == 0)
							s = s.slice(1, -1);
						var _config = new Function("return ({" + s + "});")();
						for(var key in _config){
							config[key] = _config[key];
						}
						if('data-config' in scriptEl){
							scriptEl['data-config'] = '';
						}else{
							scriptEl.setAttribute('data-config','');
						}
					}
				}
				if(key && value){
					config[key] = value;
					return true;
				}else if(key){
					return config[key];	
				}else{
					return config;
				}
			}
		})()
	};

	window.QW.config = QW.config;
})();