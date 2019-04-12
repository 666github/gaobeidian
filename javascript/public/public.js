function log(){
	if(window.console && window.console.log){
		var agu=Array.prototype.slice.call(arguments);
		window.console.log.call(window.console,agu);
	}else{}
}
//全站公共函数对象
function GlobalFun(){
	var content=this;
	//合并多个对象到第一对象中并返回
	this.extend=function(){
		var arg=Array.prototype.slice.call(arguments);
		for(var i=1;i<arg.length;i++ ){
			for(var name in arg[i]){
				arg[0][name]=arg[i][name];
			}
		}
		return arg.length>0?arg[0]:{};
	};
	//返回上一级路径   如果不能返回就跳转到_locationUrl,是否替换路径（默认true），后退几级
	this.goback=function(_locationUrl,_replace,_index){
		if(window.history.length>0){
			window.history.go((isNaN(_index)?-1:parseInt(_index)));
			document.close();
			return true;
		}else if(_locationUrl!==undefined){
			if(_replace===undefined || _replace){
				document.location.replace(_locationUrl);
			}else{
				document.location=_locationUrl;
			}
			return true;
		}
		return false;
	};
	//检测URL路径后缀名是不是 _suffix数组中的一个
	this.checkSuffix=function(_filePath,_suffix){
		var filePath=String(_filePath).toLowerCase();
		if(!(_suffix instanceof Array)){
			return false;
		}
		for(var i=0;i<_suffix.length;i++){
			if(filePath.substr(-1 * String(_suffix[i]).length)===String(_suffix[i]).toLowerCase()){
				return true;
			}
		}
		return false;
	};
}
//公共调用函数
var globalFun=new GlobalFun();
//ajax公共接口处理对象
function AjaxHandle(_json){
	var loginUrl="/pages/selectModule/index.html?act=1&backurl="+encodeURIComponent(document.location);
	var json=_json?_json:null;
	//是否存在错误
	this.success=function(){
		if(json && json.status==="success"){
			return true;
		}
		return false;
	};
	//设置json
	this.setJson=function(_json){
		if(_json!==json){json=null;}
		if (_json && _json.status){
			json=_json;
		}
		return (!!json);
	};
	//过滤是否需要跳转
	this.filterLocation=function(_beforeCallback){
		if(json.status==="location"){
			if(typeof(_beforeCallback)==="function"){
				if(_beforeCallback()===false){
					return false;
				}
			}
			var json_location=(String(json.location?json.location:"/"));
			document.location.replace(json_location);
			document.close();
			return false;
		}
		return true;
	};
	//过滤是否需要登录
	this.filterLogin=function(_beforeCallback){
		if(json.status==="login"){
			if(typeof(_beforeCallback)==="function"){
				if(_beforeCallback()===false){
					return false;
				}
			}
			document.location.replace(loginUrl);
			document.close();
			return false;
		}
		return true;
	};
	//过滤是否存在错误
	this.filterError=function(_beforeCallback,_afterCallback){
		if(json.status==="error"){
			if(typeof(_beforeCallback)==="function"){
				if(_beforeCallback((json.message?json.message:"载入时发生错误。"))===false){
					return false;
				}
			}
			if(typeof(alertBox)==="function"){
				alertBox(json.message,["确定"],[function(){
					if(typeof(_afterCallback)==="function"){
						_afterCallback();
					}
				}]);
			}else{
				alert(json.message);
				if(typeof(_afterCallback)==="function"){
					_afterCallback();
				}
			}
			return false;
		}
		return true;
	};
	//获取相应的错误信息
	this.getErrorMessage=function(_error,_config){
		var errorText=[
			{status:404,message:"未找到要访问的网页。"},
			{status:500,message:"服务器发生错误，请联系管理员或稍后再试。"}
		];
		for(var i=0;i<errorText.length;i++){
			if(errorText[i].status===_error.status){
				return errorText[i].message;
			}
		}
		if(_error.status==200){
			return "无法解析服务器返回的数据，请联系管理员或稍后再试。";
		}
		return "发生未知错误，请联系管理员或稍后再试。";
	};
	//去登录
	this.toLogin=function(){
		document.location.replace(loginUrl);
	};
	//检测是否已经登录，否则去登录
	this.hasLogin=function(_toLgoin){
		var dataInfo=(websiteInfo?(websiteInfo.data):{});
		if(!dataInfo.userInfo || !dataInfo.userInfo.loginStatus){
			log("需要登录之后才可以继续浏览");
			if(_toLgoin===undefined || _toLgoin){this.toLogin();}
			return false;
		}
		return true;
	};
}
//载入loading动画
function LoadingBox(_config){
	var content=this;
	var defaultConfig={
		target:"body",
		show:true,
		delayTime:0
	};
	var config={},timeId=0;
	var html='<div class="loadingbox_bg"><div class="loadingbox_icon"></div></div>';
	var node=$('<div>').append(html).addClass("loadingbox").hide();
	this.node=node;
	this.target=function(_target){
		var target=$(_target);
		if(target.length>0){
			target=target.eq(0);
			if(node.get(0).parentNode===target.get(0)){return;}
			if(node.get(0).parentNode){
				node.get(0).parentNode.removeChild(node.get(0));
			}
			if(!target.is("body")){
				if(target.css("position")!=="absolute" && target.css("position")!=="fixed"){
					target.css("position","relative");
				}
				node.addClass("to_target");
			}else{
				node.removeClass("to_target");
			}
			target.get(0).appendChild(node.get(0));
		}
		return this;
	};
	this.show=function(_target){
		if(!node.get(0).parentNode){
			this.target(_target?_target:"body");
		}
		node.stop(true,true).fadeIn();
		return this;
	};
	this.hide=function(){
		node.stop(true,true).fadeOut();
		return this;
	};
	//删除元素
	this.remove=function(){
		if(node.get(0).parentNode){
			node.get(0).parentNode.removeChild(node.get(0));
		}
		return this;
	};
	//设置参数
	this.setOption=function(_config){
		$.extend(config,defaultConfig,(_config?_config:{}));
		this.target(config.target);
		this[config.show?"show":"hide"]();
		this.delayHide(config.delayTime);
		return this;
	};
	//销毁自身
	this.dispose=function(){
		this.remove();
		this.node=content=null;
	};
	//延时隐藏
	this.delayHide=function(_time){
		if(_time){
			clearTimeout(timeId);
			timeId=setTimeout(function(){
				content.hide();
			},_time);
		}
		return this;
	};
	this.setOption(_config);
}
function alertBox(_message,_btCaption,_btCallback,_config){
	//提示内容,按钮标题数组，回调函数数组，扩展对象
	var config={
		padding:"40px 30px 20px 30px",
		boxPadding:"",
		buttonMargin:10,
		buttonWidth:100,
		width:400,
		showHtml:false,
		className:[],
		btCallback:(_btCallback?_btCallback:[]),
		textAlign:"center"
	},
	alertHtml=$("<div>").addClass("alertbox").css("opacity",0),
	alertbox_frame_html='<div class="alertbox_bg"></div>'+
			'<div class="alertbox_frame">'+
			'<table width="100%" border="0" cellspacing="0" cellpadding="0">'+
				'<tbody><tr><td align="center" valign="middle" class="alertbox_message">'+
				'</td></tr></tbody>'+
			'</table>'+
			'<div class="alertbox_group">'+
			'</div>'+
		'</div>';
	config=globalFun.extend(config,(_config?_config:{}));//合并对象
	alertHtml.append(alertbox_frame_html);//插入代码
	var alertbox_message=alertHtml.find(".alertbox_message").css({padding:config.padding,textAlign:config.textAlign}),
			group=alertHtml.find(".alertbox_group"),
			alertbox_frame=alertHtml.find(".alertbox_frame");
	if(config.boxPadding){
		alertbox_frame.css("padding",config.boxPadding);//设置大边距
	}
	if(config.showHtml!==true){
		alertbox_message.text(_message);
	}else{
		alertbox_message.html(_message);
	}
	for(var i=0;i<_btCaption.length;i++){
		var className,fn,bt;
		className=(config.className.length>=(i+1))?config.className[i]:"";
		if(config.btCallback.length>=(i+1)){
			fn=(function(_fn){
				return function(e){
					_fn.call(alertHtml.get(0),e);
					alertHtml.remove();
					};
				})(config.btCallback[i]);
		}else{
			fn=function(){alertHtml.remove();}
		}
		bt=$("<button>").addClass("button").addClass(className).width(config.buttonWidth).css("margin-right",(_btCaption.length-1>i)?config.buttonMargin:"").bind("click",fn).text(_btCaption[i]);
		group[0].appendChild(bt[0]);//插入按钮
	}
	alertbox_frame.width(config.width).css("marginLeft",(alertbox_frame.width()/-2));
	alertHtml.appendTo("body");
	alertbox_frame.animate({marginTop:(alertbox_frame.height()/-2)},200);
	alertHtml.animate({opacity:1},200);
	return alertHtml.get(0);
}
function loadingBox(_target,_autoHideTime){
	//显示loading效果，参数为添加到的对象
	var target=(!_target?"body":_target),
	$obj=$(target),
	html=$('<div>').addClass("loadingbox").css({opacity:0});
	if($obj.length<=0){return null;}
	if(!$obj.is("body")){
		html.addClass("to_target");
		if($obj.css("position")!="absolute" && $obj.css("position")!="fixed"){$obj.css("position","relative");}
	}
	html.append('<div class="loadingbox_bg"><div class="loadingbox_icon"></div></div>');
	$obj.get(0).appendChild(html.get(0));
	html.stop(true).animate({opacity:1},200);
	if(_autoHideTime>0){
		setTimeout(function(){html.remove();},_autoHideTime);
	}
	return html.get(0);
}
function alertBoxIFrame(_src,_width,_height){
	var iframeBox=$('<div class="alert_box_layer"><div class="alert_box_layer_bg"></div></div>');
	iframeBox.eq(0).append('<iframe src="'+_src+'" width="'+_width+'" height="'+_height+'" marginheight="0" marginwidth="0" scrolling="no" style="width:'+_width+'px; height:'+_height+'px"></iframe>');
	iframeBox.find("iframe").css("margin-top",((_height/-2)-10)+"px");
	return iframeBox.get(0);
}
function alertBoxFrame(_target,_show,_config){
	//显示自定义弹窗
	function extend(_obj1,_obj2){
		var obj={},name;
		for(name in _obj1){obj[name]=_obj1[name];}
		for(name in _obj2){obj[name]=_obj2[name];}
		return obj;
	}
	var config={showLoading:null,autoHideTime:0};
	config=extend(config,_config);
	if(!$(_target).hasClass("alertboxframe")){return null;}
	if($(_target).find(".alertboxframe_bg").length<=0){$(_target).prepend('<div class="alertboxframe_bg"></div>');}
	var content=$(_target).children(":gt(0)").eq(0).css("position","absolute"),
		loadingbox=content.find(".loadingbox");
	if(content.length<=0){return;}
	if(config.showLoading===true){
		if(loadingbox.length===0){loadingbox=loadingBox(content.get(0),config.autoHideTime);}
	}else if(config.showLoading===false){
		loadingbox.remove();
	}
	if(_show===false){
		$(_target).fadeOut(300);
		//$("body").css("overflow","auto");
		clearInterval($(_target).data("alertBoxFrameTimeID"));
		return $(_target).get(0);
	}
	//$("body").css("overflow","hidden");

	function onResize(){
		if($(_target).is(":hidden")){return;}
		var width=content.width(),height=content.height(),paddingTop=parseInt(content.css("padding-top")),paddingBottom=parseInt(content.css("padding-bottom"));
		var padding=(isNaN(paddingTop)?0:paddingTop)+(isNaN(paddingBottom)?0:paddingBottom);
		content.css({position:"absolute",left:"50%",top:"50%",marginLeft:(width)/-2,marginTop:((height)/-2)-padding/2});
	}
	clearInterval($(_target).data("alertBoxFrameTimeID"));
	$(_target).stop(true,true).css("display","block").fadeIn(300);
	onResize();

	$(_target).data("alertBoxFrameTimeID",setInterval(onResize,1000));
	return $(_target).get(0);
}
//弹出信息框
function AlertBoxMessage(_config){
	var content=this;
	var config={
		width:500,
		title:"提示信息",//设置标题
		message:"",//设置提示信息
		messageAlign:"left",//文本对齐方式
		showClose:false,//是否显示关闭按钮
		btnCaption:[],
		className:[],
		callback:[]
	};
	var alertTemplete='<div class="alertbox_bg"></div>\
					   <div class="alertFrame">\
					        <div class="alertHead">\
								<div class="alertTitle"></div>\
								<div class="closeAlertBox"></div>\
							</div>\
							<div class="alertContent"></div>\
							<div class="alertFooter"></div>\
					   </div>';
	this.node=$("<div>").append(alertTemplete).addClass("alertbox");
	//合并多个对象到第一对象中并返回
	this.extend=function(){
		var arg=Array.prototype.slice.call(arguments);
		for(var i=1;i<arg.length;i++ ){
			for(var name in arg[i]){
				arg[0][name]=arg[i][name];
			}
		}
		return arg.length>0?arg[0]:{};
	};
	config=this.extend(config,(_config?_config:{}));//合并对象

	//设置宽度
	this.setWidth=function(_value){
		this.node.find(".alertFrame").css({
			"width":_value,
			"margin-left":-(_value/2)
		});
	};
	//设置高度
	this.height=function(){
		return this.node.find(".alertFrame").height();
	};
	this.marginTop=function(){
		var height=content.height();
		this.node.find(".alertFrame").css("marginTop",-height/2);
	};
	//设置标题
	this.setTitle=function(_value){
		this.node.find(".alertTitle").text(_value);
	};
	//是否显示关闭按钮
	this.showClose=function(_value){
		if(_value){
			this.node.find(".closeAlertBox").show();
		}else{
			this.node.find(".closeAlertBox").hide();
		}
	};
	//设置提示信息
	this.setMessage=function(_value){
		this.node.find(".alertContent").text(_value);
	};
	//设置文本对齐方式
	this.setMessageAlign=function(_value){
		this.node.find(".alertContent").css("text-align",_value?_value:"left");
	};
	//设置按钮
	this.setBtn=function(_btnList,_classList,_callbackList){
		for(var i=0;i<_btnList.length;i++){
			var className,callback,btn;
			className=(_classList.length>=(i+1))?_classList[i]:"";
			if(_callbackList.length>=i+1){
				callback=(function(_fn){
					return function(e){
						_fn.call(content,e);
						content.remove();
					};
				})(_callbackList[i]);
			}else{
				callback=function(){content.remove();};
			}
			btn=$("<button>").addClass("button").addClass(className).css("marginRight",(i<_btnList.length-1)?10:"").bind("click",callback).text(_btnList[i]);
			this.node.find(".alertFooter").append(btn.get(0));
		}
	};
	//appendTo
	this.appendTo=function(_jq){
		$(_jq).append(this.node.get(0));
		this.marginTop();
	};
	//初始化设置
	this.setConfig=function(){
		this.setWidth(config.width);
		this.setTitle(config.title);
		this.showClose(config.showClose);
		this.setMessage(config.message);
		this.setMessageAlign(config.messageAlign);
		this.setBtn(config.btnCaption,config.className,config.callback);
	};
	this.setConfig();
	//销毁弹窗事件
	this.remove=function(){
		this.node.remove();
	};
	//关闭事件
	this.node.find(".closeAlertBox").bind("click",function(){
		content.remove();
	});
	this.appendTo("body");
}
//弹出自定义内容框
function AlertBoxFrame(_config){
	var content=this;
	var config={
		width:500,
		title:"请输入内容",//设置标题
		type:1,//1：input 2：textarea
		message:"",//内容信息
		placeholder:"",//文本提示信息
		showClose:false,//是否显示关闭按钮
		btnCaption:[],
		className:[],
		callback:[]
	};
	var alertTemplete='<div class="alertbox_bg"></div>\
					   <div class="alertFrame">\
					        <div class="alertHead">\
								<div class="alertTitle"></div>\
								<div class="closeAlertBox"></div>\
							</div>\
							<div class="alertContent">\
								<div class="contentMessage"></div>\
								<div class="contentTip"></div>\
							</div>\
							<div class="alertFooter"></div>\
					   </div>';
	this.node=$("<div>").append(alertTemplete).addClass("alertbox");
	this.node.append();
	//合并多个对象到第一对象中并返回
	this.extend=function(){
		var arg=Array.prototype.slice.call(arguments);
		for(var i=1;i<arg.length;i++ ){
			for(var name in arg[i]){
				arg[0][name]=arg[i][name];
			}
		}
		return arg.length>0?arg[0]:{};
	};
	config=this.extend(config,(_config?_config:{}));//合并对象

	//设置宽度
	this.setWidth=function(_value){
		this.node.find(".alertFrame").css({
			"width":_value,
			"margin-left":-(_value/2)
		});
	};
	//设置高度
	this.height=function(){
		return this.node.find(".alertFrame").height();
	};
	this.marginTop=function(){
		var height=content.height();
		this.node.find(".alertFrame").css("marginTop",-height/2);
	};
	//设置标题
	this.setTitle=function(_value){
		this.node.find(".alertTitle").text(_value);
	};
	//是否显示关闭按钮
	this.showClose=function(_value){
		if(_value){
			this.node.find(".closeAlertBox").show();
		}else{
			this.node.find(".closeAlertBox").hide();
		}
	};
	//设置按钮
	this.setBtn=function(_btnList,_classList,_callbackList){
		for(var i=0;i<_btnList.length;i++){
			var className,callback,btn;
			className=(_classList.length>=(i+1))?_classList[i]:"";
			if(_callbackList.length>=i+1){
				callback=(function(_fn){
					return function(e){
						var result=_fn.call(content,e);
						if(result){
							content.hide();
						}else{
							content.node.find(".contentTip").text("请输入内容");
						}
					};
				})(_callbackList[i]);
			}else{
				callback=function(){content.hide();};
			}
			btn=$("<button>").addClass("button").addClass(className).css("marginRight",(i<_btnList.length-1)?10:"").bind("click",callback).text(_btnList[i]);
			this.node.find(".alertFooter").append(btn.get(0));
		}
	};
	//设置文本框类型、文本信息
	this.setType=function(_type,_msg){
		if(_type==2){
			this.node.find(".contentMessage").append('<textarea class="contentMsg"></textarea>');
		}else{
			this.node.find(".contentMessage").append('<input class="contentMsg" />');
		}
		this.node.find(".content_msg").val(_msg?_msg:"");
	};
	//设置文本提示信息
	this.setPlaceholder=function(_value){
		if(!!_value){
			this.node.find(".contentMsg").attr("placeholder",_value);
		}
	}
	//获取文本信息
	this.getMessage=function(){
		return this.node.find(".contentMsg").val();
	}
	//显示弹窗
	this.show=function(){
		this.node.show();
	};
	//隐藏弹窗
	this.hide=function(){
		this.node.hide();
	};
	//appendTo
	this.appendTo=function(_jq){
		$(_jq).append(this.node.get(0));
		this.marginTop();
	};
	//初始化设置
	this.setConfig=function(){
		this.setWidth(config.width);
		this.setTitle(config.title);
		this.setType(config.type,config.message);
		this.setPlaceholder(config.placeholder);
		this.showClose(config.showClose);
		this.setBtn(config.btnCaption,config.className,config.callback);
	};
	this.setConfig();
	this.hide();
	//绑定输入框监听事件
	this.node.find(".contentMsg").bind("blur change",function(){
		content.node.find(".contentTip").text("");
	});
	//关闭事件
	this.node.find(".closeAlertBox").bind("click",function(){
		content.hide();
	});

}
//获取url中的参数对象
function Request(_url) {
	var url = _url?String(_url):String(document.location); //获取url中"?"符后的字串
	var theRequest = {};
	if (url.indexOf("?") != -1) {
		var str = url.substr(url.indexOf("?")+1);
		if(str.indexOf("#")!= -1){str=str.substr(0,str.indexOf("#"));}
		strs = str.split("&");
		for(var i = 0; i < strs.length; i ++) {
			var indexOfadd=strs[i].indexOf("=");
			var key=strs[i].substr(0,indexOfadd);
			if (indexOfadd>0 && key){
				var value=strs[i].substr(indexOfadd+1);
				if(key in theRequest){
					if(theRequest[key] instanceof Array){
						theRequest[key].push(value);
					}else{
						theRequest[key]=[theRequest[key]];
						theRequest[key].push(value);
					}
				}else{
					theRequest[key]=value;
				}
			}
		}
	 }
	this.getData=function(){
		return theRequest;
	};
}
function ObjectToString(_obj){
	var obj=_obj;
	this.setObject=function(_obj){
		obj=_obj;
		return this;
	};
	this.toString=function(){
		var str="";
		for(var name in obj){
			if(typeof(obj[name])!=="object" && typeof(obj[name])!=="function" && typeof(obj[name])!=="undefined" && obj[name]!==null){
				str+=name+"="+encodeURIComponent(obj[name])+"&";
			}
		}
		return str.substr(0,str.length-1);
	};
}
//文本对象扩展
String.prototype.toNumber=function(_defaultData,_fixed){//删除左边空白
	var num=this;
	if(isNaN(Number(num)) || isNaN(parseInt(num))){return _defaultData?_defaultData:0;}
	if(Number(num)==parseInt(num)){
		return parseInt(num);
	}else{
		return Number( Number(num).toFixed(isNaN(parseInt(_fixed))?2:parseInt(_fixed)) );
	}
};
String.prototype.toInt=function(_defaultData){//删除左边空白
	var num=this;
	if(isNaN(parseInt(num))){return _defaultData?_defaultData:0;}
	return parseInt(num);
};
String.prototype.trimL=function(){//删除左边空白
	return this.repplace(/^\s+/,"");
};
String.prototype.trimR=function(){//删除右空白
	return this.replace(/\s+$/,"");
};
String.prototype.trim=function(){//删除左右空白
	return this.replace(/^\s+/,"").replace(/\s+$/,"");
};
String.prototype.toText=function(){
	if(!this.length) {return "";}
	var s = this.replace(/&/g,"&");
	s = s.replace(/</g,"<");
	s = s.replace(/>/g,">");
	s = s.replace(/ /g," ");
	s = s.replace(/´/g,"\'");
	s = s.replace(/"/g,"\"");
	s = s.replace(/<br>/g,'\n');
	s = s.replace(/<\/br>/g,'\n');
	return s;
};
String.prototype.toHtml=function(){
	if(!this.length) {return "";}
	var s = this.replace(/&/g,"&");
	s = s.replace(/</g,"&lt;");
	s = s.replace(/>/g,">");
	s = s.replace(/ /g," ");
	s = s.replace(/\'/g,"´");
	s = s.replace(/\"/g,'"');
	s = s.replace(/\n/g,'<br>');
	return s;
};
String.prototype.charLength=function(){//获取中文长度，中文占用两个字符
	var value=this,len = 0; //字符长度，汉字占有2个字节，英文占有1个字节
	for (var i = 0; i < value.length; i++) {
		if (value.substr(i,1).match(/[^\x00-\xff]/ig)){len += 2;}else {len += 1;}
	}
	return len;
};
String.prototype.subchar=function(_length,_suffix){
	//截取文本，中文占用两个字符
	var value=this,len = 0; //字符长度，汉字占有2个字节，英文占有1个字节
	var suffix=(_suffix?_suffix:"");
	for (var i = 0; i < value.length; i++) {
		if (value.substr(i,1).match(/[^\x00-\xff]/ig)){len += 2;}else {len += 1;}
		if(len>=_length){
			return value.substr(0,i+1-(len>_length?1:0))+suffix;
		}
	}
	return value;
};
//日期扩展
Date.prototype.format =function(format){
	var o = {
		"M+" : this.getMonth()+1, //month
		"d+" : this.getDate(),    //day
		"h+" : this.getHours(),   //hour
		"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
		"q+" : Math.floor((this.getMonth()+3)/3),  //quarter
		"S" : this.getMilliseconds() //millisecond
	};
	if(/(y+)/.test(format)){format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4- RegExp.$1.length));}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
};
//数组对象的扩展
Array.prototype.indexOf=function(_value){
	for(var i=0;i<this.length;i++){
		if(this[i]==_value){return i;}
	}
	return -1;
};
