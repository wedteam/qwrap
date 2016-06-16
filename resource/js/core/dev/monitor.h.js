(function(){

/**
 * 用来提供监控 Helper 执行和调用过程的 Helper
 * watch过程 应在 retouch 之前
 */
var CustEvent = QW.CustEvent;

var _callID = 0, _watchMap = {}, _watchReport = {};

function _watch(fn, helper_name, helper_method){
	return function(){
		if(arguments.callee._calling || !_watchMap[helper_name]){
			return fn.apply(this, arguments);
		}

		var evtData = {id:_callID++, callee:fn, startTime:new Date().getTime(), helper:helper_name, method:helper_method};

		arguments.callee._calling = true; //避免递归

		MonitorH.fire('before', evtData);
		evtData.ret  = fn.apply(this, arguments);
		evtData.endTime = new Date().getTime();
		evtData.timeCost = evtData.endTime - evtData.startTime;
		MonitorH.fire('after', evtData);
		
		arguments.callee._calling = false;

		//统计报表
		var report = _watchReport[[helper_name, helper_method].join(".")];
		report.totalCalled ++;
		report.maxCost = Math.max(evtData.timeCost, report.maxCost);
		report.minCost = Math.min(evtData.timeCost, report.minCost);
		report.totalCost += evtData.timeCost;
		report.everageCost = report.totalCost / report.totalCalled;
			
		return evtData.ret;
	}
}

var MonitorH = {
	addWatch : function(helper, helper_name){
		var ret = {};
		_watchMap[helper_name] = true;
		for (var i in helper) {
			var fn = helper[i];
			if(fn instanceof Function){
				var report_key = [helper_name, i].join(".");
				_watchReport[report_key] = _watchReport[report_key] || {totalCalled:0, totalCost:0, maxCost:0, minCost:Infinity, everageCost:0};
				ret[i] = _watch(fn, helper_name, i);
			}else{
				ret[i] = fn;
			}
		}
		return ret;
	},
	clearWatch : function(helper_name){
		_watchMap[helper_name] = false;
	},
	getReport : function(){
		return _watchReport;
	}
}

CustEvent.createEvents(MonitorH);

QW.MonitorH = MonitorH;

})();