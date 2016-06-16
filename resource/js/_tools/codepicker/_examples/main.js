(function() {
	Dom.ready(function() {
		W('#getmodule').click(function() {
			var vals = W('#container input[checked]').getValueAll();
			if(W('#chkCodeRetouch').get('checked')) {
				vals.push('QW.HelperH.methodize()');
				vals.push('QW.ObjectH.mix()');
			}
			W('#hardCode').val(vals.join(';\n'));
		});

		W('#getcode').click(function() {
			var result = ComboJsFilesTool.solo(),
				code = result[1],
				used = result[0];
			if(W('#chkCodeRetouch').get('checked')) {
				var code_retouch = W('#coreretouch').val(),
					hard_code = W('#hardCode').val();
				var used_tools = Object.keys(used);
				"ObjectH,ArrayH,HashsetH,ClassH,FunctionH,DateH,StringH".split(',').forEach(function(m) {
					if(!used_tools.contains(m)) {
						code_retouch = code_retouch.replace(new RegExp('.*' + m + '.*', 'g'), '');
					}
				});
				code += code_retouch;
			}
			W('#result').val(code).show();
		});

		W('#result').on('focus', function(){this.select();});

		var tpl = W('#tpl').html(),
			html = [],
			modules = "ArrayH,StringH,DateH,ObjectH,FunctionH,ClassH,HashsetH,DomU,NodeH,EventH,EventTargetH,JSON".split(',');
		html.push(W('#default').html());
		modules.forEach(function(name) {
			var inner = [], _tmp = eval('QW.' + name);
			for(var fn in _tmp) {
				var f = _tmp[fn];
				if(fn[0] != '_' && Object.isFunction(f)) {
					inner.push('<li><label><input type="checkbox" value="QW.'+name+'.'+fn+'()">'+fn+'</label></li>');
				}
			}
			html.push(tpl.format(name, inner.join('')));
		});
		W('#container').html(html.join(''))
			.delegate('.chkall', 'click', function(e) {
					e.preventDefault();
					W(this).parentNode('fieldset').query('input').set('checked', true);
				})
			.delegate('.chknone', 'click', function(e) {
					e.preventDefault();
					var container = W(this).parentNode('fieldset');
					W(this).parentNode('fieldset').query('input').set('checked', false);
				})
			.delegate('.chkreverse', 'click', function(e) {
					e.preventDefault();
					W(this).parentNode('fieldset').query('input').forEach(function(el) {
						W(el).set('checked', !el.checked);
					});
				})
			.delegate('.toggle', 'click', function(e) {
					e.preventDefault();
					var container = W(this).parentNode('fieldset');
					container.hasClass('hid') ? container.removeClass('hid') : container.addClass('hid');
				});
	})
})();