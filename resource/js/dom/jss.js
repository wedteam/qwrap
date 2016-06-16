/*
	Copyright (c) Baidu Youa Wed QWrap
	author: JK
*/
(function() {
	var mix = QW.ObjectH.mix,
		evalExp = QW.JSON.parse;
	/** 
	 * @class Jss Jss-Data相关
	 * @singleton
	 * @namespace QW
	 */
	var Jss = {};

	mix(Jss, {
		/** 
		 * @property	rules Jss的当前所有rule，相当于css的内容
		 */
		rules: {},
		/** 
		 * 添加jss rule
		 * @method	addRule
		 * @param	{string}	sSelector	selector字符串，目前只支持#id、@name、.className、tagName
		 * @param	{json}	ruleData json对象，键为arrtibuteName，值为attributeValue，其中attributeValue可以是任何对象
		 * @return	{void}	
		 */
		addRule: function(sSelector, ruleData) {
			var data = Jss.rules[sSelector] || (Jss.rules[sSelector] = {});
			mix(data, ruleData, true);
		},

		/** 
		 * 添加一系列jss rule
		 * @method	addRules
		 * @param	{json}	rules json对象，键为selector，值为ruleData（Json对象）
		 * @return	{json}	
		 */
		addRules: function(rules) {
			for (var i in rules) {
				Jss.addRule(i, rules[i]);
			}
		},

		/** 
		 * 移除jss rule
		 * @method	removeRule
		 * @param	{string}	sSelector	selector字符串，目前只支持#id、@name、.className、tagName
		 * @return	{boolean}	是否发生移除操作
		 */
		removeRule: function(sSelector) {
			var data = Jss.rules[sSelector];
			if (data) {
				delete Jss.rules[sSelector];
				return true;
			}
			return false;
		},
		/** 
		 * 获取jss rule
		 * @method	getRuleData
		 * @param	{string}	sSelector	selector字符串，目前只支持#id、@name、.className、tagName
		 * @return	{json}	获取rule的数据内容
		 */
		getRuleData: function(sSelector) {
			return Jss.rules[sSelector];
		},

		/** 
		 * 设置rule中某属性
		 * @method	setRuleAttribute
		 * @param	{string}	sSelector	selector字符串，目前只支持#id、@name、.className、tagName
		 * @param	{string}	arrtibuteName (Optional) attributeName
		 * @param	{any}	value attributeValue
		 * @return	{json}	是否发回移除操作
		 */
		setRuleAttribute: function(sSelector, arrtibuteName, value) {
			var data = {};
			data[arrtibuteName] = value;
			Jss.addRule(sSelector, data);
		},

		/** 
		 * 移除rule中某属性
		 * @method	removeRuleAttribute
		 * @param	{string}	sSelector	selector字符串，目前只支持#id、@name、.className、tagName
		 * @param	{string}	arrtibuteName (Optional) attributeName
		 * @return	{json}	是否发回移除操作
		 */
		removeRuleAttribute: function(sSelector, arrtibuteName) {
			var data = Jss.rules[sSelector];
			if (data && (attributeName in data)) {
				delete data[attributeName];
				return true;
			}
			return false;
		},

		/** 
		 * 按selector获取jss 属性
		 * @method	getRuleAttribute
		 * @param	{string}	sSelector	selector字符串，目前只支持#id、@name、.className、tagName
		 * @param	{string}	arrtibuteName	属性名
		 * @return	{json}	获取rule的内容
		 */
		getRuleAttribute: function(sSelector, arrtibuteName) {
			var data = Jss.rules[sSelector] || {};
			return data[arrtibuteName];
		}
	});
	/** 
	 * @class JssTargetH JssTargetH相关
	 * @singleton
	 * @namespace QW
	 */

	/*
	* 获取元素的inline的jssData
	* @method	getOwnJssData
	* @param	{element}	el	元素
	* @return	{json}	获取到的JssData
	*/

	function getOwnJssData(el, needInit) {
		var data = el.__jssData;
		if (!data) {
			var s = el.getAttribute('data-jss');
			if (s) {
				if (!/^\s*{/.test(s)) {
					s = '{' + s + '}';
				}
				data = el.__jssData = evalExp(s);
			}
			else if (needInit) {
				data = el.__jssData = {};
			}
		}
		return data;
	}

	var JssTargetH = {

		/** 
		 * 获取元素的inline的jss
		 * @method	getOwnJss
		 * @param	{element}	el	元素
		 * @return	{any}	获取到的jss attribute
		 */
		getOwnJss: function(el, attributeName) {
			var data = getOwnJssData(el);
			if (data && (attributeName in data)) {
				return data[attributeName];
			}
			return undefined;
		},

		/** 
		 * 获取元素的jss属性，优先度为：inlineJssAttribute > #id > @name > .className > tagName
		 * @method	getJss
		 * @param	{element}	el	元素
		 * @return	{any}	获取到的jss attribute
		 */
		getJss: function(el, attributeName) { //为提高性能，本方法代码有点长。
			var data = getOwnJssData(el);
			if (data && (attributeName in data)) {
				return data[attributeName];
			}
			var getRuleData = Jss.getRuleData,
				id = el.id;
			if (id && (data = getRuleData('#' + id)) && (attributeName in data)) {
				return data[attributeName];
			}
			var name = el.name;
			if (name && (data = getRuleData('@' + name)) && (attributeName in data)) {
				return data[attributeName];
			}
			var className = el.className;
			if (className) {
				var classNames = className.split(' ');
				for (var i = 0; i < classNames.length; i++) {
					if ((data = getRuleData('.' + classNames[i])) && (attributeName in data)) {
						return data[attributeName];
					}
				}
			}
			var tagName = el.tagName;
			if (tagName && (data = getRuleData(tagName)) && (attributeName in data)) {
				return data[attributeName];
			}
			return undefined;
		},
		/** 
		 * 设置元素的jss属性
		 * @method	setJss
		 * @param	{element}	el	元素
		 * @param	{string}	attributeName	attributeName
		 * @param	{any}	attributeValue	attributeValue
		 * @return	{void}	
		 */
		setJss: function(el, attributeName, attributeValue) {
			var data = getOwnJssData(el, true);
			data[attributeName] = attributeValue;
		},

		/** 
		 * 移除元素的inline的jss
		 * @method	removeJss
		 * @param	{element}	el	元素
		 * @param	{string}	attributeName	attributeName
		 * @return	{boolean}	是否进行remove操作
		 */
		removeJss: function(el, attributeName) {
			var data = getOwnJssData(el);
			if (data && (attributeName in data)) {
				delete data[attributeName];
				return true;
			}
			return false;
		}
	};

	QW.Jss = Jss;
	QW.JssTargetH = JssTargetH;
}());