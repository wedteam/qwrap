var StringH = {
	mulReplace: function(s, arr) {
		for (var i = 0; i < arr.length; i++) {
			s = s.replace(arr[i][0], arr[i][1]);
		}
		return s;
	},
	encode4Js: function(s) {
		return StringH.mulReplace(s, [
			[/\\/g, "\\u005C"],
			[/"/g, "\\u0022"],
			[/'/g, "\\u0027"],
			[/\//g, "\\u002F"],
			[/\r/g, "\\u000A"],
			[/\n/g, "\\u000D"],
			[/\t/g, "\\u0009"]
		]);
	}
};
var encode4Js=StringH.encode4Js;
var ObjectH = {
	isPlainObject: function(obj) {
		return !!obj && obj.constructor === Object;
	},
	stringify: function(obj) {
		if (obj == null) {return null; }
		if (obj.toJSON) {
			obj = obj.toJSON();
		}
		var type = typeof obj;
		switch (type) {
		case 'string':
			return '"' + encode4Js(obj) + '"';
		case 'number':
		case 'boolean':
			return obj.toString();
		case 'object':
			if (obj instanceof Date) {return 'new Date(' + obj.getTime() + ')'; }
			if (obj instanceof Array) {
				var ar = [];
				for (var i = 0; i < obj.length; i++) {ar[i] = ObjectH.stringify(obj[i]); }
				return '[' + ar.join(',') + ']';
			}
			if (ObjectH.isPlainObject(obj)) {
				ar = [];
				for (i in obj) {
					ar.push('"' + encode4Js(i) + '":' + ObjectH.stringify(obj[i]));
				}
				return '{' + ar.join(',') + '}';
			}
		}
		return null; //无法序列化的，返回null;
	}
};


var ComboJsFilesTool=(function(){
	var ComboJsFilesTool={};
	function g(id) {
		return document.getElementById(id);
	};

	function read(drvPath)
	{
		var fso,f;
		fso = new ActiveXObject("Scripting.FileSystemObject");
		f = fso.OpenTextFile(drvPath);
		return (f.readAll())
	};
	ComboJsFilesTool.combo=function(){
		var s=[],
			files=g('files').value.split(/[\r\n]+/),
			basePath=g('basePath').value;
		for(var i=0;i<files.length;i++){
			var sFile=files[i];
			s.push('\/\/'+sFile+'\n');
			sFile=sFile.match(/\'[\w\/.]+\.js/ig);
			if(sFile) sFile=(sFile+'').substr(1);
			//alert(sFile);
			var content=read(basePath+'/'+sFile)+'';
			s.push(content + ((/\;\s*$/.test(content))?'\n\n':';\n\n') );
		}
		g('comboresult').value=s.join('\n');
	};

	ComboJsFilesTool.solo=function(codeTextareaId){
		var baseNamespace='QW',
			usedTools={}, //QW的子空间
			jsFiles=g(codeTextareaId||'comboresult').value
				.replace(/\/\*[\w\W]*?\*\//g,'')//去注释;
				.replace(/([\r\n]*\s*)+([\r\n]+)/g,'$2')//去多余的空行
				.split(/(?=\/\/\s*document.write\('<script )/g);
		function analyseRequire(code,usedTools){//分析硬性代码，找出依赖
			code='\n'+code+'\n';
			usedTools=usedTools||{};
			var toolLines=code.match(new RegExp('\\W'+baseNamespace+'\\.\\w+','g'));
			for(var i=0;toolLines && i<toolLines.length;i++){ //所用到的子空间
				var toolName=toolLines[i].match(/\w+$/i)[0];
				if(!usedTools[toolName]){
					usedTools[toolName] = {};
				}
			}
			for(var toolName in usedTools){ //所用到的子空间
				var aliasReg= new RegExp('(\\w+)\\s*=\\s*'+baseNamespace+'.'+toolName+'\\s*[,;]','g');
				if (aliasReg.test(code)) {//别名
					var alias=RegExp.$1,
						methodLines=code.match(new RegExp('\\W'+alias+'\\.\\w+','g'));
					for(var i=0;methodLines && i<methodLines.length;i++){ //所用到的子空间
						var methodName=methodLines[i].match(/\w+$/i)[0];
						usedTools[toolName][methodName]={};
					}
				}
				if(alias != toolName){
					methodLines=code.match(new RegExp('\\W'+toolName+'\\.\\w+','g'));
					for(var i=0;methodLines && i<methodLines.length;i++){ //所用到的子空间
						var methodName=methodLines[i].match(/\w+$/i)[0];
						usedTools[toolName][methodName]={};
					}
				}
			}
			return usedTools;
		};
		function analyseSingleFile(fileText){
			var isUsed=false,
				baseReg=new RegExp('window\\.'+baseNamespace+'\\s*=\\s*[\\w\\(\\{]','g');
			if(baseReg.test(fileText)){//core_base.js分析
				for(var methodName in usedTools){
					var methodReg=new RegExp('([\\r\\n]\\t+)'
						+'('+baseNamespace+'\\.'+methodName+'\\s*=|'+methodName+'\\s*:)'
						+'[^=](([\\w\\W]*?(\\1[^\\s].*))|(.*[,;]\\s*(?=[\\r\\n])))','g');
					fileText.replace(methodReg,function (a){
						var methodLines=a.match(new RegExp('\\W'+baseNamespace+'\\.\\w+','g'));
						for(var i=0;methodLines && i<methodLines.length;i++){ //所用到的子空间
							var methodName=methodLines[i].match(/\w+$/i)[0];
							if(!usedTools[methodName]) usedTools[methodName]={};
						}
						return a;
					});
				}
				//去除没用到的方法或属性
				var toolReg=new RegExp('([\\r\\n]\\t)'
						+'var '+baseNamespace+'\\s*=\\s*{[\\r\\n]'
						+'[\\w\\W]*?(\\1[^\\s].*)','g');
				fileText=fileText.replace(toolReg,function(a,b){
					var methodReg=new RegExp('([\\r\\n]\\t\\t)'
						+'(\\w+)\\s*:'
						+'[^=](([\\w\\W]*?(\\1[^\\s].*))|(.*[,;]\\s*(?=[\\r\\n])))','g');
					a=a.replace(methodReg,function(aa,bb,cc){//去掉无用的方法
						if(cc in usedTools) return aa;
						else return '';
					});
					a=a.replace(/,\s*([\r\n].*)$/g,'$1');//去多余“,”
					return a;
				});
				analyseRequire(fileText, usedTools);
				return fileText;
			}
			for(var toolName in usedTools){
				//alert('\\W'+baseNamespace+'\\.'+toolName+'\\s*=\\s*[\\w\\(\\{]');
				var usedReg=new RegExp('\\W'+baseNamespace+'\\.'+toolName+'\\s*=\\s*[\\w\\(\\{]','g');
				if(usedReg.test(fileText)) {
					if(',Browser,CustEvent,Selector,NodeW,ModuleH,use,provide,'.indexOf(','+toolName+',') >-1) {//某些文件是不可solo到方法级别的
						analyseRequire(fileText, usedTools);
						//alert('依赖这个不可细折的模块'+fileText.split('\n')[0]);
						return fileText;
					}
					isUsed=true;
					var util=usedTools[toolName];
					for(var methodName in util){
						var methodReg=new RegExp('([\\r\\n]\\t+)'
							+'('+toolName+'\\.'+methodName+'\\s*=|'+methodName+'\\s*:)'
							+'[^=]((.*[,;]\\s*(?=[\\r\\n]))|([\\w\\W]*?(\\1[^\\s].*)))','g');
						fileText.replace(methodReg,function (a){
							var methodLines=a.match(new RegExp('\\W'+toolName+'\\.\\w+','g'));
							for(var i=0;methodLines && i<methodLines.length;i++){ //所用到的子空间
								var methodName=methodLines[i].match(/\w+$/i)[0];
								if(!usedTools[toolName][methodName]) usedTools[toolName][methodName]={};
							}
							return a;
						});
					}
					//StringH={...}或mix(StringH,{...})风格
					var toolReg=new RegExp('([\\r\\n]\\t)'
							+'\\w.*'+toolName+'.*\\{[\\r\\n]'
							+'[\\w\\W]*?(\\1[^\\s].*)','g');
					fileText=fileText.replace(toolReg,function(a,b){
						var methodReg=new RegExp('([\\r\\n]\\t\\t)'
							+'(\\w+)\\s*:'
							+'[^=]((.*[,;]\\s*(?=[\\r\\n]))|([\\w\\W]*?(\\1[^\\s].*)))','g');
						a=a.replace(methodReg,function(aa,bb,cc){//去掉无用的方法
							if(cc in util) return aa;
							else return '';
						});
						a=a.replace(/,\s*([\r\n].*)$/g,'$1');//去多余“,”
						return a;
					});
					//StringH.aaa=...或StringH.aaa.more=...风格
					var methodReg=new RegExp('([\\r\\n]\\t)'
						+toolName+'\\.(\\w+)(\\W.*)?\\s*='
						+'[^=](.*\{([\\w\\W]*?(\\1[^\\s].*))|(.*[,;]\\s*(?=[\\r\\n])))','g');
					fileText=fileText.replace(methodReg,function(aa,bb,cc){
						if(cc in util) return aa;
						else return '';
					});
					//去除无用的闭包变量
					var needClearClosures=true;
					clearClosureVars: while(needClearClosures){
						needClearClosures=false;
						//function aaa(){...}风格
						var closureVarReg=/([\r\n]\t)function (\w+)\W[\w\W]*?\1\S.*/g,
							closureVarLines=fileText.match(closureVarReg);
						for(var i=0; closureVarLines && i<closureVarLines.length;i++){
							closureVarReg.lastIndex=0;
							closureVarReg.test(closureVarLines[i]);
							var closureVarName=RegExp.$2,
								tempFileText=fileText.replace(closureVarLines[i],'');
							if(closureVarName == toolName) continue; 
							if(!(new RegExp('\\W'+closureVarName+'\\W','g')).test(tempFileText)){//如果清除没影响，则清除
								fileText=tempFileText;
								needClearClosures=true;
								continue clearClosureVars;
							}
						}
						//var a=function(){...}风格
						var closureVarReg=/([\r\n]\t)var (\w+)\s*=\s*function\W[\w\W]*?\1\S.*/g,
							closureVarLines=fileText.match(closureVarReg);
						for(var i=0; closureVarLines && i<closureVarLines.length;i++){
							closureVarReg.lastIndex=0;
							closureVarReg.test(closureVarLines[i]);
							var closureVarName=RegExp.$2,
								tempFileText=fileText.replace(closureVarLines[i],'');
							if(closureVarName == toolName) continue; 
							if(!(new RegExp('\\W'+closureVarName+'\\W','g')).test(tempFileText)){//如果清除没影响，则清除
								fileText=tempFileText;
								needClearClosures=true;
								continue clearClosureVars;
							}
						}
						//var a=xxx风格
						var closureVarReg=/([\r\n]\tvar )(\w+)\s*=.*[,;]/g,
							closureVarLines=fileText.match(closureVarReg);
						for(var i=0; closureVarLines && i<closureVarLines.length;i++){
							closureVarReg.lastIndex=0;
							closureVarReg.test(closureVarLines[i]);
							var closureVarPre=RegExp.$1,
								closureVarName=RegExp.$2,
								tempFileText=fileText.replace(closureVarLines[i],'');
							if(closureVarName == toolName) continue; 
							if(!(new RegExp('\\W'+closureVarName+'\\W','g')).test(tempFileText)){//如果清除没影响，则清除
								var splitText=fileText.split(closureVarLines[i]);
								splitText[1]=splitText[1].replace(/^([\r\n]+\t)\t(?=\w+\s*=)/,'$1var ');
								fileText=splitText.join('');
								needClearClosures=true;
								continue clearClosureVars;
							}
						}
						var closureVarReg=/(,[\r\n]+\t\t)(\w+)\s*=[^\r\n]*(?=[,;][ \t]*)/g,
							closureVarSelfReg=/^(,[\r\n]+\t\t)(\w+)\s*=[^\r\n]*/g,
							closureVarLines=fileText.match(closureVarReg);
						for(var i=0; closureVarLines && i<closureVarLines.length;i++){
							closureVarSelfReg.lastIndex=0;
							closureVarSelfReg.test(closureVarLines[i]);
							var closureVarPre=RegExp.$1,
								closureVarName=RegExp.$2,
								tempFileText=fileText.replace(closureVarLines[i],'');
							if(closureVarName == toolName) continue; 
							if(!(new RegExp('\\W'+closureVarName+'\\W','g')).test(tempFileText)){//如果清除没影响，则清除
								fileText = tempFileText;
								needClearClosures=true;
								continue clearClosureVars;
							}
						}

					}
					
					fileText=fileText.replace(/([\r\n]*\s*)+([\r\n]+)/g,'$2');//去多余的空行
					analyseRequire(fileText,usedTools);//
					//alert('整理被用到的模块，剔除无用代码：\n'+fileText);
				}
			}
			if(isUsed) {
				//alert('用到'+fileText.split('\n')[0]);
				return fileText;
			}
			else{
				//alert('没用到'+fileText.split('\n')[0]);
				return '';
			}
		}

		analyseRequire(g('hardCode').value, usedTools);
		//alert('分析硬性代码，解析出依赖为：\n'+ObjectH.stringify(usedTools));
		for(var i=jsFiles.length-1; i>-1; i--){
			var tempFileText=jsFiles[i],
				tempFileText2;
			while(true){
				tempFileText2=analyseSingleFile(jsFiles[i]);
				if(!tempFileText2 || tempFileText2==tempFileText){
					break;
				}
				else{
					tempFileText=tempFileText2;
				}
			}
			jsFiles[i]=tempFileText2;
		}
		//alert('所有的直接或间接依赖：\n'+ObjectH.stringify(usedTools));
		return [usedTools, jsFiles.join('')];
		
	};
	return ComboJsFilesTool;
})();
