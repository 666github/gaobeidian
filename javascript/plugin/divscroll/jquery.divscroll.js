(function($){
var options={
	width:10,
	zIndex:999,
	radius:0,
	bgColor:"rgba(0,0,0,0.2)",
	opacity:0.2,
	hoverOpacity:0.3,
	gap:10,
	rightGap:5
};
$.fn.divScroll=function(_options){
	var arg=Array.prototype.slice.call(arguments,1);
	var result=null;
	if(typeof(_options)==="object"){_options=$.extend({},options,_options);}
	if(typeof(_options)==="string" && typeof(fun[_options])=="function"){
		result=fun[_options].apply(this,arg);
	}else{
		result=fun.init.call(this,_options);
	}
	return result?result:this;
};
window.DivScroll=function (_element,_option){
	var content=this;
	var node=$(_element);
	var nodebody=node.children().eq(0);
	var downData={};
	var option=$.extend({},options,_option);
	
	var scrollFrame=$("<div>").addClass("DivScrollFrame").css({
		position:"absolute",
		width:option.width,
		top:0,
		bottom:0,
		right:0,
		zIndex:option.zIndex,
		overflow:"hidden"
	});
	var scrollBox=$("<div>").addClass("DivScrollBox").css({
		position:"absolute",
		width:"100%",
		borderRadius:option.radius,
		background:option.bgColor
	});
	
	this.update=function(){
		var bodyHeight=getBodyHeight();
		var height=getHeight();
		if(height<=0 || bodyHeight<=0 || bodyHeight<=height){
			scrollBox.css({top:0,display:"none"});
			nodebody.css("margin-top",0);
			return;
		}else{
			scrollBox.css("display","block");
		}
		var top=parseInt(nodebody.css("margin-top"));
		if(top>0){
			nodebody.css("margin-top",0);
			top=0;
		}else if(height>bodyHeight+top){
			top=height-bodyHeight;
			nodebody.css("margin-top",top);
		}
		var bfb=height/bodyHeight;
		scrollBox.height(bfb*height);//占比
		scrollBox.css("top",Math.abs(top/bodyHeight)*height);
	};
	
	function getBodyHeight(){
		return nodebody.height();
	}
	function getHeight(){
		return node.height();
	}
	
	function initView(){
		node.css("overflow","hidden");
		scrollFrame.append(scrollBox.get(0));
		node.append(scrollFrame.get(0));
		node.bind("mouseover",content.update);
	}
	function initEvent(){
		scrollBox.bind("mousedown",mouseDown);
		bindMouseWheel.call(node,onMouseWheel);
	}
	function mouseDown(_event){
		canSelected(true);
		downData.pageY=_event.pageY;
		downData.top=parseInt(scrollBox.css("top"));
		downData.downPageY=_event.pageY-scrollBox.offset().top;
		$("body").unbind("mousemove",mouseMove).bind("mousemove",mouseMove);
		$("body").unbind("mouseup",mouseUp).bind("mouseup",mouseUp);
	}
	function mouseMove(event){
		var bodyHeight=getBodyHeight();
		var height=getHeight();
		var scrollHeight=scrollBox.height();
		var diff=event.pageY-downData.pageY;//移动距离
		var top=downData.top;
		var endY=top+diff;
		if(endY<0){
			endY=0;
		}else if(endY>height-scrollHeight){
			endY=1;
		}else{
			endY=endY/(height-scrollHeight);
		}
		nodebody.css("margin-top",endY*(height-bodyHeight)+"px");
		content.update();
	}
	function mouseUp(){
		$("body").unbind("mousemove",mouseMove);
		$("body").unbind("mouseup",mouseUp);
		canSelected(false);
	}
	function bindMouseWheel(_fun){
		var element=$(this).get(0);
		if(element.addEventListener){
			element.addEventListener("mousewheel",_fun,false);
			element.addEventListener("DomMouseScroll",_fun,false);
			element.addEventListener("MozMousePixelScroll",_fun,false);
		}else{
			element.attachEvent("onmousewheel",_fun);
		}
	}
	function unBindMouseWheel(_fun){
		var element=$(this).get(0);
		if(element.removeEventListener){
			element.removeEventListener("mousewheel",_fun);
			element.removeEventListener("DomMouseScroll",_fun);
			element.removeEventListener("MozMousePixelScroll",_fun);
		}else{
			element.detachEvent("onmousewheel",_fun);
		}
	}
	function canSelected(_act){
		if(_act){
			$("body").unbind("selectstart",onSelected).bind("selectstart",onSelected);
		}else{
			$("body").unbind("selectstart",onSelected);
		}
	}
	function onSelected(){
		return false;
	}
	function onMouseWheel(event){
		var orgEvent	= event || window.event,
			delta		= event.delta = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3,
			target		=event.currentTarget||event.srcElement;
		//console.log("onMouseWheel");
		var bodyHeight=getBodyHeight();
		var height=getHeight();
		var top=parseInt(nodebody.css("margin-top"));
		var gap=option.gap;
		if(delta>0){
			top=top+gap>0?0:top+gap;
		}else if( (bodyHeight+ top - gap)<height  ){
			top=height-bodyHeight;
		}else{
			top = top - gap;
		}
		nodebody.css("margin-top",top>0?0:top);
		content.update();
		event.preventDefault();
		//event.stopPropagation();
	}
	initView();
	initEvent();
};
var fun={
	init:function(_option){
		return this.each(function(index,element){
			if(!$(element).data("DivScroll")){
				$(element).data("DivScroll",new DivScroll(element,_option));
			}
		});
	},
	update:function(){
		return this.each(function(index,element){
			if($(element).data("DivScroll")){
				$(element).data("DivScroll").update();
			}
		});
	}
};
})(jQuery);