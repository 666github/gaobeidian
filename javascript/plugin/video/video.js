/*
	作者:		马腾
	更新时间:		2016-10-18 20:27:25
	版本:		20161018-1
	
	更新日志：
		版本:	20161018-1
				增加方法
				addPoint(时间点,点Class,回调函数);//在进度条上增加点，点Class可以自定义一个10*10的带有图片背景的样式
				delPoint(时间点|Point的Dom或JQ对象,[点Class-非必填]);//删除某个点
				getAllPoint();//获得全部时间点
		
*/
(function(window){
function log(){
	if(console && console.log){
		console.log.apply(console,Array.prototype.splice.call(arguments,0));
	}
}
function Video(_config){
	//参考资料 http://www.jianshu.com/p/404d01b8e713
	String.prototype.toInt=function(_defaultValue){
		return isNaN(this)?(_defaultValue!==undefined?_defaultValue:0):parseInt(this);
	};
	String.prototype.toNumber=function(_defaultValue){
		return isNaN(this)?(_defaultValue!==undefined?_defaultValue:0):Number(this);
	};
	var defaultConfig={
		//modeName:{low:"标清",medium:"流畅",high:"高清",hd:"超清"},
		callback:{
			playEvent:function(_time,_totalTime){
				//开始播放
			},
			pauseEvent:function(_time,_totalTime){
				//暂停播放
			},
			durationChangeEvent:function(_totalTime){
				//得到视频总长度
			},
			timeUpdateEvent:function(_time,_totalTime){
				//视频时间更新
			},
			secondUpdateEvent:function(_time,_totalTime){
				//以秒为单位的进度
			},
			endedEvent:function(_time,_totalTime){
				//结束播放
			},
			errorEvent:function(_errorCode,_errorMessage,_error){
				//遇到错误
			},
			volumeEvent:function(_volume,_maxVolume){
				//音量改变
			},
			dragStopEvent:function(_time,_totalTime){
				//拖拽结束（当参数controlsDisable为true此回调函数有效）
			}
		},
		autoplay:false,//自动播放
		
		subtitlesList:[
			/*{name:"中文",value:""},
			{name:"法文",value:""}*/
		],
		preload:true,		//预加载
		controls:false,		//是否允许控制
		videoList:[			//视频列表
			/*{name:"超清",value:""},
			{name:"高清",value:""},
			{name:"清晰",value:""},
			{name:"流畅",value:""}*/
			//low:medium:high:hd
		],
		autoHideControls:true,//自动隐藏控制条
		controlsDisable:false,
		spend:1,//速度
		startTime:0,
		spendList:[//速度选项列表
			{name:"1.0x",value:1.0},
			{name:"1.5x",value:1.5},
			{name:"2.0x",value:2.0}
		],
		currentSrc:"",
		volume:1
	};
	var content=this,config={},mouseMoveTimeer=0,videoCurrentTime=0;
	var css={};
	var frame=$("<div>").addClass("video").get(0);
	this.node=$(frame);
	var video=(function(){
		var video=document.createElement("video");
		video.setAttribute("class","videoplayer");
		video.addEventListener("abort",videoEvent,false);//在退出时运行的脚本
		video.addEventListener("canplay",videoEvent,false);//当文件就绪可以开始播放时运行的脚本（缓冲已足够开始时）
		video.addEventListener("canplaythrough",videoEvent,false);//当媒介能够无需因缓冲而停止即可播放至结尾时运行的脚本
		video.addEventListener("durationchange",videoEvent,false);//当媒介长度改变时运行的脚本
		video.addEventListener("emptied",videoEvent,false);//当发生故障并且文件突然不可用时运行的脚本（比如连接意外断开时）
		video.addEventListener("ended",videoEvent,false);//当媒介已到达结尾时运行的脚本（可发送类似“感谢观看”之类的消息）
		video.addEventListener("error",videoEvent,false);//当在文件加载期间发生错误时运行的脚本
		video.addEventListener("loadeddata",videoEvent,false);//当媒介数据已加载时运行的脚本
		video.addEventListener("loadedmetadata",videoEvent,false);//当元数据（比如分辨率和时长）被加载时运行的脚本
		video.addEventListener("loadstart",videoEvent,false);//在文件开始加载且未实际加载任何数据前运行的脚本
		video.addEventListener("pause",videoEvent,false);//当媒介被用户或程序暂停时运行的脚本
		video.addEventListener("play",videoEvent,false);//当媒介已就绪可以开始播放时运行的脚本
		video.addEventListener("playing",videoEvent,false);//当媒介已开始播放时运行的脚本
		video.addEventListener("progress",videoEvent,false);//当浏览器正在获取媒介数据时运行的脚本
		video.addEventListener("ratechange",videoEvent,false);//每当回放速率改变时运行的脚本（比如当用户切换到慢动作或快进模式
		video.addEventListener("readystatechange",videoEvent,false);//每当就绪状态改变时运行的脚本（就绪状态监测媒介数据的状态）
		video.addEventListener("seeked",videoEvent,false);//当 seeking 属性设置为 false（指示定位已结束）时运行的脚本
		video.addEventListener("seeking",videoEvent,false);//当 seeking 属性设置为 true（指示定位是活动的）时运行的脚本
		video.addEventListener("stalled",videoEvent,false);//在浏览器不论何种原因未能取回媒介数据时运行的脚本
		video.addEventListener("suspend",videoEvent,false);//在媒介数据完全加载之前不论何种原因终止取回媒介数据时运行的脚本
		video.addEventListener("timeupdate",videoEvent,false);//当播放位置改变时（比如当用户快进到媒介中一个不同的位置时）运行的脚本
		video.addEventListener("volumechange",videoEvent,false);//每当音量改变时（包括将音量设置为静音）时运行的脚本
		video.addEventListener("waiting",videoEvent,false);//当媒介已停止播放但打算继续播放时（比如当媒介暂停已缓冲更多数据）运行脚本
		return video;
	})();
	var control=$("<div>").addClass("control_frame").get(0);
	var progressTools=new ProgressTool();
	progressTools.video=this;
	var playButton=$("<div>").addClass("play_button").get(0);
	
	progressTools.setAble(false);
	var loadingGif=new LoadingGif(true);
	var controlTools=new ControlTools();
	this.video=video;
	this.progressTools=progressTools;
	this.controlTools=controlTools;
	
	control.appendChild(controlTools.element);
	progressTools.appendTo(control);
	frame.appendChild(video);
	frame.appendChild(loadingGif.element);
	frame.appendChild(control);
	frame.appendChild(playButton);
	
	$(playButton).bind("click",function(){
		video.play();
	});
	//合并对象
	function extend(){
		var arg=Array.prototype.slice.call(arguments);
		for(var i=1;i<arg.length;i++ ){
			for(var name in arg[i]){
				arg[0][name]=arg[i][name];
			}
		}
		return arg.length>0?arg[0]:{};
	}
	//预加载
	this.preload=function(_value){
		if(_value!==undefined){
			if(_value){
				video.setAttribute("preload","auto");
			}else{
				video.removeAttribute("preload");
			}
		}
		return !!video.getAttribute("preload");
	};
	//自动播放
	this.autoplay=function(_value){
		if(_value!==undefined){
			if(_value){
				video.setAttribute("autoplay",true);
			}else{
				video.removeAttribute("autoplay");
			}
		}
		return !!video.getAttribute("autoplay");
	};
	//设置音量
	this.volume=function(_value){
		if(_value!==undefined){
			var value=String(_value).toNumber();
			video.setAttribute("volume",value);
			controlTools.setVolume(value*100);
		}
		return String(video.getAttribute("volume")).toNumber(0);
	};
	//设置开始时间
	this.startTime=function(_time){
		if(_time!==undefined){
			var time=String(_time).toNumber();
			video.startTime=time;
		}
		return video.startTime;
	};
	//是否是暂停状态
	this.paused=function(){
		return video.paused;
	};
	//当前视频地址
	this.currentSrc=function(_src){
		if(_src!==undefined){
			video.setAttribute("src",_src?_src:"");
		}
		return video.getAttribute("src");
	};
	//当前播放视频时间
	this.getCurrentTime=function(){
		return video.currentTime;
	};
	this.setCurrentTime=function(_value){
		video.currentTime=isNaN(parseInt(_value))?0:parseInt(_value);
	};
	//当前视频总时间
	this.getTotalTime=function(){
		return video.duration;
	};
	//是否自动隐藏
	this.autoHideControls=function(_value){
		if(_value){
			hideControlEvent();
			this.node.bind("mousemove mouseup",showControlEvent);
		}else{
			showControlEvent(false);
			this.node.unbind("mousemove mouseup",showControlEvent);
		}
	};
	//是否显示默认工具条
	this.controls=function(_value){
		if(_value!==undefined){
			if(_value){
				video.setAttribute("controls",true);
			}else{
				video.removeAttribute("controls");
			}
		}
		return !!video.getAttribute("controls");
	};
	//设置回调函数
	this.callback=function(_value){
		config.callback=_value;
	};
	//设置字幕
	this.subtitlesList=function(_value){
		controlTools.setSubtitlesTip(_value);
	};
	//设置速度
	this.spendList=function(_value){
		controlTools.setSpendTip(_value);
	};
	//设置清晰度
	this.videoList=function(_value){
		
		controlTools.setClarityTip(_value);
	};
	//初始化
	this.setOption=function(_config){
		if(_config){
			config=extend({},defaultConfig,_config);
		}else{
			config=defaultConfig;
		}
		for(var name in config){
			if(typeof(this[name])==="function"){
				if(name==="currentSrc" && !config[name]){
					break;
				}
				this[name].call(this,config[name]);
			}
		}
		if(!this.currentSrc() && config.videoList instanceof Array && config.videoList.length>0){
			this.currentSrc(config.videoList[0].value);
		}
	};
	this.getOption=function(_config){
		return config;
	};
	this.appendTo=function(_parent){
		if(frame.parentNode){
			frame.parentNode.removeChild(frame);
		}
		var parentjQ=$(_parent);
		if(parentjQ.length){
			parentjQ.append(frame);
			progressTools.updateAllPoint();
		}
	};
	this.play=function(){
		video.play();
	};
	this.pause=function(){
		video.pause();
	};
	this.stop=function(){
		video.pause();
	};
	this.dispose=function(){
		this.node.remove();
		content=null;
	};
	
	//是否允许拖动
	this.controlsDisable=function(_value){
		if(_value===undefined){
			config.controlsDisable=!!_value;
			progressTools.setAble(!!_value);
		}
		return  config.controlsDisable;
	};
	//添加点
	this.addPoint=function(_time,_class,_callback){
		return progressTools.appendPoint(_time,_class,_callback);
	};
	//删除点
	this.delPoint=function(_time,_class){
		return progressTools.deletePoint(_time,_class);
	};
	//获取所有点集合
	this.getAllPoint=function(){
		return progressTools.getAllPoint();
	};
	
	function videoEvent(event){
		var networkState=video.networkState;//网络状态=0.此元素未初始化 1.正常但没有使用网络 2.正在下载数据  3.没有找到资源
		var currentTime=String(video.currentTime).toNumber(0);//当前时间
		var duration=String(video.duration).toInt(0);
		//log(event.type);
		if(getVideoError()){//发生错误
			loadingGif.hide();
			controlTools.setTime(getVideoError());
			controlTools.setStatus("pause");
			progressTools.setProgress(0);
			progressTools.setAble(false);
			return false;
		}
		switch(event.type){
			case "abort":
				loadingGif.hide();
			break;case "canplay":
				if(config.startTime){
					content.setCurrentTime(config.startTime);
					config.startTime=0;
				}
				loadingGif.hide();
				controlTools.setStatus(content.paused()?"pause":"play");
				$(playButton).removeClass("play_error");//删除错误提示
				progressTools.setAble(!!config.controlsDisable);
				progressTools.setCallback(function(_evt){
					if(_evt.type==="done"){
						video.currentTime=_evt.progress;
						runCallback("dragStopEvent",Math.ceil(_evt.progress),Math.ceil(duration));
					}
				});
			break;case "canplaythrough":
				
			break;case "durationchange":
				runCallback("durationChangeEvent",Math.ceil(duration));//得到总视频时间总长度
				progressTools.setTotalProgress(duration);
				runCallback("secondUpdateEvent",0,Math.ceil(duration));
				controlTools.setTime((toTime(currentTime,duration)+"/"+toTime(duration,duration)));
				runCallback("timeUpdateEvent",currentTime,(duration));
			break;case "emptied":
				
			break;case "ended":
				controlTools.setStatus("ended");
				runCallback("endedEvent",currentTime,duration);
			break;case "error":
				//处理错误移动到了上面
				controlTools.setStatus("error");
				runCallback("errorEvent",currentTime,duration);
			break;case "loadeddata":
				
			break;case "loadedmetadata":
				
			break;case "loadstart":
				controlTools.setStatus("load");
			break;case "pause":
				controlTools.setStatus("pause");
				runCallback("pauseEvent",currentTime,duration);
			break;case "play":
				controlTools.setStatus("play");
				runCallback("playEvent",currentTime,duration);
			break;case "playing":
				controlTools.setStatus("play");
			break;case "progress":
				//progressTools.setProgress(currentTime);
			break;case "ratechange":
				controlTools.setPlaybackRate(video.playbackRate);
			break;case "readystatechange":
				
			break;case "seeked":
				controlTools.setStatus("seeked");
			break;case "seeking":
				controlTools.setStatus("load");
			break;case "stalled":
				
			break;case "suspend":
				controlTools.setStatus("seeked");
			break;case "timeupdate":
				if(videoCurrentTime!=Math.ceil(currentTime)){
					videoCurrentTime=Math.ceil(currentTime);
					runCallback("secondUpdateEvent",videoCurrentTime,Math.ceil(duration));
					progressTools.checkPlaytoPoint(videoCurrentTime);
				}
				progressTools.setProgress(currentTime);
				controlTools.setTime((toTime(currentTime,duration)+"/"+toTime(duration,duration)));
				runCallback("timeUpdateEvent",currentTime,(duration));
			break;case "volumechange":
				runCallback("volumeEvent",Math.ceil(content.volume()*100),100);
			break;case "waiting":
				controlTools.setStatus("load");
			break;
		}
	}
	
	var getVideoError=function(){
		if(!video.error){return "";}
		var msg="未知错误";
		switch(video.error.code){
			case 1:
				msg= "用户终止";
			break; case 2:
				msg= "网络错误";
			break; case 3:
				msg= "解码错误";
			break; case 4:
				msg= "URL无效";
			break;
		}
		return msg;
	};
	//兼容函数
	var runPrefixMethod=function (element, method) {
		var usablePrefixMethod;
		["webkit", "moz", "ms", "o", ""].forEach(function(prefix) {
			if (usablePrefixMethod) {return usablePrefixMethod;}
			if (prefix === "") {method = method.slice(0,1).toLowerCase() + method.slice(1);}
			var typePrefixMethod = typeof element[prefix + method];
			if (typePrefixMethod + "" !== "undefined") {
				if (typePrefixMethod === "function") {
					usablePrefixMethod = element[prefix + method]();
				} else {
					usablePrefixMethod = element[prefix + method];
				}
			}
		});
		return usablePrefixMethod;
	};
	//注册全屏
	var launchFullScreen = function (element){
		runPrefixMethod(element, "RequestFullScreen");
	};
	//是否全屏
	var isFullScreen=function (){
		return document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.oFullScreen;
	};
	//退出全屏
	var exitFullscreen=function() {
			runPrefixMethod(document, "CancelFullScreen");
	};
	
	function ControlTools(){
		var toolsContent=this;
		this.node=$("<div>").addClass("control_tools_frame");
		this.element=this.node.get(0);
		var playDom=$("<div>").addClass("video_icon video_play").get(0),
			retreatDom=$("<div>").addClass("video_icon video_retreat").get(0),
			volumeDom=$("<div>").addClass("video_icon video_volume").append("<div class='child_icon'></div><div class='video_volume_bar'></div>").get(0),
			forwardDom=$("<div>").addClass("video_icon video_forward").get(0),
			volumeBarDom=$(volumeDom).find(".video_volume_bar").get(0),
			timeDom=$("<div>").addClass("video_icon video_time").text("").get(0),
			subtitlesDom=$("<div>").addClass("video_icon video_subtitles").get(0),
			spendDom=$("<div>").addClass("video_icon video_spend").html("<span>1x</span>").get(0),
			clarityDom=$("<div>").addClass("video_icon video_clarity").html("<span>流畅</span>").get(0),
			screenDom=$("<div>").addClass("video_icon video_screen").get(0),
			volumeProgressBar=new ProgressTool().setCallback(function(_evt){
				if(_evt.type==="moving"){
					video.volume=_evt.progress/100;
				}
			});
		
		volumeBarDom.appendChild(volumeProgressBar.node.get(0));
		$(volumeBarDom).bind("mouseenter",function(){
			$(volumeDom).addClass("video_volume_hover");
			toolsContent.node.addClass("video_progress_moving");
			$(volumeBarDom).addClass("video_volume_bar_hover");
			volumeProgressBar.update();
			$("body").unbind("mousemove",checkOut).bind("mousemove",checkOut);
		});
		var checkOut=function(event){
			var offsetPx=$(volumeDom).offset();
			if(event.pageX<offsetPx.left || event.pageY<offsetPx.top || event.pageX >offsetPx.left+100 || event.pageY>offsetPx.top +35){
				if(!volumeProgressBar.moving){
					$(volumeBarDom).removeClass("video_volume_bar_hover");
					toolsContent.node.removeClass("video_progress_moving");
					$(volumeDom).removeClass("video_volume_hover");
					$("body").unbind("mousemove",checkOut);
				}
			}
		};
		
		var hideTipList=function (event){
			$(event.data.dom).removeClass("select_icon");
			if(event.data.tipList && event.data.tipList.hide){
				event.data.tipList.hide();
			}
			$("body").unbind("click",hideTipList);
		};
		var spendTip,subtitlesTip,clarityTip;
		
		this.setSpendTip=function(_list){
			if(spendTip){spendTip.dispose();}
			if(!(_list instanceof Array) || _list.length<1){return;}
			spendTip=new TipList(_list,function(data){
				video.playbackRate=data.value;
				hideTipList({data:{dom:spendDom,tipList:spendTip}});
			}).setWidth(80);
			$(spendDom).append(spendTip.node.get(0));
		};
		this.setSubtitlesTip=function(_list){
			if(subtitlesTip){subtitlesTip.dispose();}
			if(!(_list instanceof Array) || _list.length<1){return;}
			subtitlesTip=new TipList(_list,function(data){
				hideTipList({data:{dom:subtitlesDom,tipList:subtitlesTip}});
			}).setWidth(80);
			$(subtitlesDom).append(subtitlesTip.node.get(0));
		};
		this.setClarityTip=function(_list){
			if(clarityTip){clarityTip.dispose();}
			if(!(_list instanceof Array) || _list.length<1){return;}
			clarityTip=new TipList(_list,function(data){
				config.startTime=content.getCurrentTime();
				content.currentSrc(data.value);//设置当前视频
				content.play();
				$(clarityDom).find(">span").text(data.name);
				hideTipList({data:{dom:clarityDom,tipList:clarityTip}});
			}).setWidth(80);
			$(clarityDom).append(clarityTip.node.get(0));
		};
		
		var cancelFullScreen=function(event){
			if(event.keyCode===27){
				exitFullscreen();
				$(screenDom).removeClass("video_exitscreen");
			 	$("body").unbind("keyup",cancelFullScreen);
				 progressTools.update();
			}	
		};
		$(spendDom).bind("click",function(event){
			if(!spendTip){return false;}
			$("body").trigger("click");
			spendTip.show();
			$(this).addClass("select_icon");
			$("body").unbind("click",hideTipList).bind("click",{dom:this,tipList:spendTip},hideTipList);
			event.stopPropagation();
		});
		$(clarityDom).bind("click",function(event){
			if(!clarityTip){return false;}
			$("body").trigger("click");
			clarityTip.show();
			$(this).addClass("select_icon");
			$("body").unbind("click",hideTipList).bind("click",{dom:this,tipList:clarityTip},hideTipList);
			event.stopPropagation();
		});
		$(subtitlesDom).bind("click",function(event){
			if(!subtitlesTip){return false;}
			$("body").trigger("click");
			subtitlesTip.show();
			$(this).addClass("select_icon");
			$("body").unbind("click",hideTipList).bind("click",{dom:this,tipList:subtitlesTip},hideTipList);
			event.stopPropagation();
		});
		$(playDom).bind("click",function(event){
			if(video.paused){
				video.play();
			}else{
				video.pause();
			}
		});
		$(screenDom).bind("click",function(event){
			if($(screenDom).css("background-image").indexOf("exitscreen.png")>0){
				cancelFullScreen({keyCode:27});
			}else{
				launchFullScreen(frame);
				$("body").unbind("keyup",cancelFullScreen).bind("keyup",cancelFullScreen);
				progressTools.update();
			}
		});
		$(retreatDom).bind("click",function(){
			video.currentTime=video.currentTime+5;
		});
		$(forwardDom).bind("click",function(){
			video.currentTime=video.currentTime-5;
		});
		this.appendTo=function(_jQ){
			$(_jQ).append(toolsContent.node.get(0));
		};
		
		this.node.append(forwardDom);
		this.node.append(playDom);
		this.node.append(retreatDom);
		this.node.append(volumeDom);
		this.node.append(timeDom);
		this.node.append(screenDom);
		this.node.append(clarityDom);
		this.node.append(spendDom);
		this.node.append(subtitlesDom);
		
		//设置音量进度条
		this.setVolume=function(_value){
			volumeProgressBar.setProgress(_value);
			return this;
		};
		//设置时间
		this.setTime=function(_value){
			$(timeDom).text(_value?_value:"");
			return this;
		};
		//设置倍速
		this.setPlaybackRate=function(_value){
			$(spendDom).find(">span").text((isNaN(_value)?"1.0x":Number(_value).toFixed(1)+"x"));
			return this;
		};
		//设置状态
		this.setStatus=function(_status){
			switch(_status){
				case "play":
					$(playDom).addClass("video_pause");
					playButton.style.display="none";
				break;
				case "pause":
					$(playDom).removeClass("video_pause");
					playButton.style.display="block";
				break;
				case "seeked":
					loadingGif.hide();
				break;
				case "load":
					playButton.style.display="none";
					loadingGif.show();
				break;
				case "ended":
					playButton.style.display="block";
					loadingGif.hide();
				break;
				case "error":
					$(playButton).addClass("play_error");
					playButton.style.display="block";
				break;
			}
			return this;
		};
	}
	//设置工具条延时隐藏事件
	var hideControlEvent=function(){
		mouseMoveTimeer=setTimeout(function(){
			if(!video.paused){control.style.visibility="hidden";}
		},5000);
	};
	//转换时间格式
	var toTime=function (_time,_duration){
		var h=Math.floor(_time/3600),
		f=Math.floor((_time-h*3600)/60),
		m=Math.floor((_time-h*3600-f*60));
		var hh=Math.floor(_duration/3600),
		ff=Math.floor((_duration-hh*3600)/60),
		mm=Math.floor((_duration-hh*3600-ff*60));
		return (((hh>0||h>0)?((h<10?"0":"")+h+":"):"")) + ((f<10?"0":"")+f+":")+ (((m<10?"0":"")+m));
	};
	//显示工具条事件
	var showControlEvent=function(_continue){
		clearTimeout(mouseMoveTimeer);
		if(control.style.visibility==="hidden"){
			control.style.visibility="visible";
		}
		if(_continue!==false){hideControlEvent();}
	};
	//执行回调函数
	var runCallback=function(name){
		var agu=Array.prototype.slice.call(arguments,0);
		if(config && config.callback && typeof(config.callback[name])==="function"){
			agu.splice(0,1);//删除第一个参数
			var fun=config.callback[name];
			fun.apply(content,agu);
		}
	};
	this.setOption(_config);
}
function LoadingGif(_show){
		var gifContent=this,count=0;
		this.element=$("<div>").addClass("loadinggif").get(0);
		var time=0;
		var start=function(){
			clearInterval(time);
			time=setInterval(function(){
				gifContent.element.style.backgroundPosition="-"+((count%8)*40+"px 0");
				count++;
			},100);
		};
		var stop=function(){
			clearInterval(time);
		};
		this.show=function(){
			$(this.element).css("display","block");
			start();
		};
		this.hide=function(){
			$(this.element).css("display","none");
			stop();
		};
		if(_show===false){
			this.hide();
		}else{
			this.show();
		}
	}
function ProgressTool(_callback){
	var content=this;
	var eventX=0,localX=0,callback,able=true;
	var totalProgress=100,progress=0;
	var progressFrame=$("<div>").addClass("progress_frame").get(0);
	var progressBar=$("<div>").addClass("progress_bar").get(0);
	var progressBox=$("<div>").addClass("progress_box").get(0);
	var progressBall=$("<div>").addClass("progress_ball").get(0);
	this.video=null;
	var pointList=[];//添加点的列表
	
	progressFrame.appendChild(progressBar);
	progressFrame.appendChild(progressBox);
	progressFrame.appendChild(progressBall);
	
	//更新视图
	this.update=function(){
		updateProgressBallPosition();
		this.updateAllPoint();
	};
	//更新视图
	this.updateAllPoint=function(){
		for(var i=0;i<pointList.length;i++){
			var point=pointList[i];
			$(point).css("left", getPointPosition($(point).data("pointPosition"))*100+"%");
		}
	};
	//通知播放到的点
	this.checkPlaytoPoint=function(_pregress){
		for(var i=0;i<pointList.length;i++){
			var point=pointList[i];
			var pointPregress=point.data("pointPosition");//点
			if(pointPregress==_pregress){
				if(typeof point.data("callbackFunction") ==="function"){
					point.data("callbackFunction").call(content.video,"playto",point.get(0),point.data("pointPosition"));
				}
			}
		}
	};
	function updateProgressBallPosition(){
		var width=$(progressFrame).width();
		var bfb=progress/totalProgress;
		var borderWidth=parseInt($(progressBall).css("border-width"));
			borderWidth=(isNaN(borderWidth)?0:parseInt(borderWidth))*2;
		var ballWidth=$(progressBall).width()+borderWidth;
		$(progressBar).css("width",bfb*100+"%");
		var left=((bfb-(ballWidth/2/width))<0?0:(bfb-(ballWidth/2/width)));
		//log(ballWidth,width,ballWidth/width);
		if(left>=1 || left>(1-ballWidth/width)){
			left=1-(ballWidth/width);
		}
		$(progressBall).css("left", left*100  +"%");
		return left;
	}
	function getPointPosition(_position){
		var width=$(progressFrame).width();
		var bfb=_position/totalProgress;
		var ballWidth=10;
		var left=((bfb-(ballWidth/2/width))<0?0:(bfb-(ballWidth/2/width)));
		//log(ballWidth,width,ballWidth/width);
		if(left>=1 || left>(1-ballWidth/width)){
			left=1-(ballWidth/width);
		}
		return left;
	}
	
	this.node=$(progressFrame);
	this.element=progressFrame;
	//自定义空间
	this.progressBox=progressBox;
	this.progressBall=progressBall;
	this.progressBar=progressBar;
	this.progressFrame=progressFrame;
	
	//点的回调事件
	function pointClickCallback(e){
		if(typeof $(this).data("callbackFunction") ==="function"){
			if($(this).data("callbackFunction").call(content.video,"click",this,$(this).data("pointPosition"))===false){
				e.stopPropagation();
				return false;
			}
		}
		return true;
	}
	//添加某个点
	this.appendPoint=function(_pointPosition,_class,_callback){
		var pointPosition=isNaN(parseInt(_pointPosition))?0:parseInt(_pointPosition);
		var point=$("<div>").addClass("videoPointNode").addClass(_class).data("pointPosition",pointPosition).data("callbackFunction",_callback).click(pointClickCallback);
		progressFrame.appendChild(point.get(0));
		pointList.push(point);
		this.updateAllPoint();
		return point;
	};
	//删除某个点
	this.deletePoint=function(_pointPosition,_class){
		var delPointDom=(_pointPosition instanceof jQuery)?_pointPosition.get(0):_pointPosition;
		for(var i=pointList.length-1;i>=0;i--){
			var point=pointList[i];
			var pointDom=point.get(0);
			var pointPosition=point.data("pointPosition");//点位置
			if( pointPosition==_pointPosition || pointDom==_pointPosition){
				if(!_class){
					//没有填写Class条件 就直接删除
					pointList.splice(i,1);
					point.remove();//删除自己
				}else if(point.hasClass(_class)){
					//符合Class 条件 就删除自己
					pointList.splice(i,1);
					point.remove();
				}
			}
		}
	};
	//获取所有点数组
	this.getAllPoint=function(){
		return pointList;
	};
	
	//插入
	this.appendTo=function(jQelement){
		$(jQelement).append(progressFrame);
	};
	this.moving=false;//是否正在调整过程中
	this.setProgress=function(_value){
		if(this.moving){return false;}
		progress=(isNaN(_value)?0:Number(_value));
		progress=(progress>totalProgress)?totalProgress:progress;
		this.update();
		return this;
	};
	this.getProgress=function(_value){
		return progress;
	};
	this.setTotalProgress=function(_value){
		totalProgress=(isNaN(_value)?0:Number(_value));
		this.update();
		return this;
	};
	this.getTotalProgress=function(_value){
		return totalProgress;
	};
	this.setAble=function(_value){
		able=!!_value;
		return this;
	};
	this.getAble=function(_value){
		return able;
	};
	this.setCallback=function(_value){
		callback=_value;
		return this;
	};
	var runCallback=function(_data){
		if(typeof(callback)==="function"){
			callback.call(this,_data);
		}
	};
	var mouseDownFun=function(event){
		if(!content.getAble()){return false;}
		content.moving=true;
		eventX=event.pageX;
		localX=eventX-$(this).offset().left;
		$(document.body).unbind("mousemove",mouseMoveFun).bind("mousemove",mouseMoveFun);
		$(document.body).unbind("mouseup",mouseUpFun).bind("mouseup",mouseUpFun);
		$(document.body).unbind("mouseleave",mouseUpFun).bind("mouseleave",mouseUpFun).addClass("video_progress_moving");
	};
	//移动
	var mouseMoveFun=function(event){
		var width=$(progressFrame).width();
		var borderWidth=$(progressBall).css("border-width");
		borderWidth=isNaN(parseInt(borderWidth))?0:parseInt(borderWidth);
		var ballWidth=$(progressBall).width()+borderWidth*2;
		
		var pageX=event.pageX;
		var moveX=pageX-eventX;
		var targetWidth=localX+moveX;
		var targetWidthCss="";
		if(targetWidth<=0){
			progress=0;
			targetWidthCss="0%";
			$(progressBall).css("left",0);//计算圆点位置
		}else if(targetWidth>=(width)){
			progress=totalProgress;
			targetWidthCss="100%";
			$(progressBall).css("left",width-ballWidth);
		}else{
			progress=totalProgress*(targetWidth/(width));
			targetWidthCss=(targetWidth/(width)*100+"%");
			if(targetWidth<=0){
				$(progressBall).css("left",0);
			}else if(targetWidth>=(width)){
				$(progressBall).css("left",width-ballWidth);
			}else{
				$(progressBall).css("left",(targetWidth>width-ballWidth?(width-ballWidth):targetWidth-ballWidth/2));
			}
		}
		$(progressBar).width(targetWidth);
		//移动过程中
		var percentage=content.getProgress()/content.getTotalProgress();
		runCallback({
			type:"moving",
			progress:content.getProgress(),
			totalProgress:content.getTotalProgress(),
			percentage:(isNaN(percentage)?0:percentage)
		});
	};
	var mouseUpFun=function(event){
		mouseMoveFun(event);
		content.moving=false;
		var percentage=content.getProgress()/content.getTotalProgress();
		runCallback({
			type:"done",
			progress:content.getProgress(),
			totalProgress:content.getTotalProgress(),
			percentage:(isNaN(percentage)?0:percentage)
		});
		$(document.body).unbind("mousemove",mouseMoveFun);
		$(document.body).unbind("mouseup",mouseUpFun);
		$(document.body).unbind("mouseleave",mouseUpFun).removeClass("video_progress_moving");
	};
	this.setCallback(_callback);
	$(progressFrame).bind("mousedown",mouseDownFun);
}
function TipList(_config,_callback){
	var content=this;
	this.itemList=[];
	var callback=function(_data){
		//_data.name;//标题
		//_data.value;//值
		//_data.index;//值
	};
	var width=50;
	this.node=$("<div>").addClass("tiplist_frame");
	var tipListbody=$("<div>").addClass("tiplist_body");
	this.node.append(tipListbody.get(0));
	//条目
	function Item(_data){
		var itemContent=this;
		var data={name:"",value:null};
		var select=false;
		this.node=$("<div>").addClass("tiplist_item");
		
		this.select=function(_value){
			data.select=!!_value;
			if(data.select){
				this.node.addClass("tiplist_item_select");
				runCallback(data);
			}else{
				this.node.removeClass("tiplist_item_select");
			}
		};
		this.getSelect=function(){
			return !!data.select;
		};
		this.setData=function(_data){
			data={name:(_data && _data.name!==undefined?_data.name:""),value:(_data && _data.value!==undefined)?_data.value:null};
			this.node.text(data.name);
		};
		this.setData(_data);
		this.node.bind("click",function(event){
			content.selectItem(itemContent);
			event.stopPropagation();
		});
	}
	this.setConfig=function(_config){
		tipListbody.empty();
		this.itemList.splice(0,this.itemList.length);
		for(var i=0;(_config instanceof Array) && i<_config.length;i++){
			this.addItem(_config[i]);
		}
		return this;
	};
	this.addItem=function(_data,_index){
		if(_data && _data.name){
			var item=new Item(_data);
			this.itemList.push(item);
			tipListbody.append(item.node.get(0));
			return item;
		}
		return null;
	};
	//选中一个元素
	this.selectItem=function(_item){
		var index=this.itemList.indexOf(_item);
		if(index<0){
			return ;
		}
		for(var i=0;i<this.itemList.length;i++){
			this.itemList[i].select(i===index);
		}
		return this;
	};
	this.setCallback=function(_callback){
		callback=_callback;
		return this;
	};
	var runCallback=function(_data){
		if(typeof(callback)==="function"){
			callback.call(content,_data);
		}
	};
	this.setWidth=function(_width){
		width=_width;
		this.node.width(width);
		return this;
	};
	this.getWidth=function(){
		return width;
	};
	this.show=function(){
		if(this.itemList.length){
			this.node.css("display","block");
		}
		return this;
	};
	this.hide=function(){
		this.node.css("display","none");
		return this;
	};
	//销毁对象
	this.dispose=function(){
		content.node.remove();
		content.node=null;
		content=null;
	};
	this.setWidth(50);
	this.setConfig(_config);
	this.setCallback(_callback);
	this.hide();
}
window.Video=Video;
})(window);