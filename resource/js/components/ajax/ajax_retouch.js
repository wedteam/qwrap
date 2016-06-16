/*
 *	Copyright (c) QWrap
 *	version: $version$ $release$ released
 *	author: JK
 *  description: ajax推荐retouch....
*/

(function() {
	var Ajax = QW.Ajax,
		NodeW = QW.NodeW;

	Ajax.Delay = 1000;
	/*
	 * 项目中处理json格式response的推荐方法
	 * @method opResults 
	 * 例如，以下这句会处通一些通用的错误：Ajax.post(oForm,function(e){var status=this.opResults();})
	 */
	Ajax.prototype.opResults = function(url) {
		var ajax = this;
		if (ajax.isSuccess()) {
			var responseText = ajax.requester.responseText;
			try {
				var status = new Function('return (' + responseText + ');')();
			} catch (ex) {
				alert("系统错误，请稍后再试。");
				return {
					isop: true,
					err: "inter"
				};
			}
		} else {
			alert("系统错误，请稍后再试。");
			return {
				isop: true,
				err: "inter"
			};
		}

		status.isop = true; //记录是否已经作过处理
		switch (status.err) {
			/*
			case 'xxx':
				alert(0); //添加自己的处理逻辑
			*/
			default:
				status.isop = false;
		}
		return status;
	};

	/*
	 * Youa项目中处理javascript格式response的推荐方法
	 * @method execJs 
	 * 例如，以下这句会执行返回结果：Ajax.post(oForm,function(e){var status=this.execJs();})
	 */
	Ajax.prototype.execJs = function() {
		QW.StringH.execJs(this.requester.responseText);
	};

	/*
	 * 扩展NodeW
	 * @method ajaxForm 
	 * @example W('#formId').ajaxForm();
	 */
	var FormH = {
		ajaxForm: function(oForm, opts) {
			var o = {
				data: oForm,
				url: oForm.action,
				method: oForm.method
			};
			if (typeof opts == 'function') {
				o.onsucceed = function() {
						opts.call(this, this.requester.responseText);
				};
			} else {
				o.onsucceed = Ajax.opResults;
				QW.ObjectH.mix(o, opts || {}, true);
			}
			new Ajax(o).send();
		}
	};

	NodeW.pluginHelper(FormH, 'operator');
}());