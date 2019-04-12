function LabelManager(){
	var content=this;
	var node=this.node=$('<div class="tag_label_frame clearfix" name="tag_label"></div>');
	var nodeBody=$('<div>');
	var nodeList=[];
	var inputMaxCount=0,labelMaxCount=0;
	
	var tagLabelBoxButtonAdd=$('<button class="btn_icon icon_add_btn"></button>');
	var tagLabelBoxButtonClose=$('<button class="btn_icon icon_close_btn hide"></button>');
	node.append(nodeBody.get(0));
	var addCallback=null,delCallback=null;
	
	//内部元素子对象
	function LabelManagerNode(){
		var nodeContent=this;
		var node=this.node=$('<div class="tag_label delete fl mr10">');
		var lableTagTxt=$('<span>带删除按钮的tip</span>');
		var lableTagInput=$('<input type="hidden" value="带删除按钮的tip">');
		var lableTagDelete=$('<p>╳</p>');
		node.append(lableTagTxt);
		node.append(lableTagInput);
		node.append(lableTagDelete);
		var callback=null;
		var config=null;
		this.appendTo=function(_jq){
			$(_jq).append(this.node.get(0));	
		};
		this.setCallback=function(_callback){
			callback=_callback;
		};
		this.setText=function(_text,_config){
			node.find("span").text(_text);
			config=_config;
		};
		this.getText=function(){
			return node.find("span").text();
		};
		this.getConfig=function(){
			return config;
		};
		this.dispose=function(){
			node.remove();
			nodeContent=null;
		};
		lableTagDelete.bind("click",function(){
			if(callback){
				callback.call(nodeContent);
			}else{
				nodeContent.dispose();
			}
		});
	}
	function AddLabelBox(){
		var labelBoxContent=this;
		var node=this.node=$('<div class="tag_label_box"></div>');
		var tagLabelBoxAction=$('<div class="tag_label_box_action"></div>');
		var tagLabelBoxActionInput=$('<input value="" placeholder="请输入标签名称" autocomplete="off">');
		var tagLabelBoxActionButton=$('<button>确定</button>');
		node.append(tagLabelBoxAction);
		tagLabelBoxAction.append(tagLabelBoxActionInput);
		tagLabelBoxAction.append(tagLabelBoxActionButton);
		var callback=null;
		
		this.setValue=function(_value){
			tagLabelBoxActionInput.val(_value);
		};
		this.getValue=function(){
			var value= $.trim(tagLabelBoxActionInput.val());
			if(inputMaxCount>0){
				value=value.subchar(inputMaxCount);
			}
			return value;
		};
		this.show=function(){
			tagLabelBoxActionInput.val("");
			node.css("display","block");
			node.find(".tag_label_box_action").css("display","block");
		};
		this.hide=function(){
			node.css("display","none");
			node.find(".tag_label_box_action").css("display","block");
		};
		this.appendTo=function(_jq){
			$(_jq).append(this.node.get(0));	
		};
		this.setCallback=function(_callback){
			callback=_callback;
		};
		this.dispose=function(){
			node.remove();
			labelBoxContent=null;
		};
		tagLabelBoxActionButton.bind("click",function(){
			if(callback){
				callback.call(labelBoxContent,labelBoxContent.getValue());
			}
		});
	}
	
	//文本方法
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
	String.prototype.charLength=function(){//获取中文长度，中文占用两个字符
		var value=this,len = 0; //字符长度，汉字占有2个字节，英文占有1个字节
		for (var i = 0; i < value.length; i++) {
			if (value.substr(i,1).match(/[^\x00-\xff]/ig)){len += 2;}else {len += 1;} 
		}
		return len;
	};
	this.appendTo=function(_jq){
		$(_jq).append(this.node.get(0));
	};
	//每个标签最多输入多少个字符
	this.setInputMaxCount=function(_value){
		inputMaxCount=_value;
	};
	//最多有几个标签
	this.setLabelMaxCount=function(_value){
		labelMaxCount=_value;
	};
	this.addLabel=function(_text,_config){
		if(labelMaxCount>0 && nodeList.length>=labelMaxCount){return false;}
		var labelNode=new LabelManagerNode();
		labelNode.setText(_text,_config);
		labelNode.setCallback(closeCallback);
		labelNode.appendTo(nodeBody);
		nodeList.push(labelNode);
	};
	this.delLabel=function(_node){
		for(var i=0;i<nodeList.length;i++){
			if(nodeList[i]==_node){
				nodeList[i].dispose();
				nodeList.splice(i,1);
				if(labelMaxCount>0 && nodeList.length<labelMaxCount){
					tagLabelBoxButtonAdd.css("display","block");
				}
				return ;
			}
		}
	};
	var addLabelBox=new AddLabelBox();
	addLabelBox.setCallback(function(_text){
			var addLabelBox=this;
			if(addCallback){
				addCallback.call(addLabelBox,function(_text,_config){
					content.addLabel(_text);
					tagLabelBoxButtonClose.trigger("click");
				});
			}else{
				content.addLabel(_text);
				tagLabelBoxButtonClose.trigger("click");
			}
		}
	);
	//获取所有数据
	this.getData=function(){
		var list=[];
		for(var i=0;i<nodeList.length;i++){
			list.push({text:nodeList[i].getText(),id:nodeList[i].getConfig()});
		}
		return list;
	};
	//设置添加时候的回调函数
	this.setAddCallback=function(_callback){
		addCallback=_callback;
	};
	//设置删除时候的回调函数
	this.setDelCallback=function(_callback){
		delCallback=_callback;
	};
	addLabelBox.appendTo(node);
	
	function closeCallback(){
		var labelNode=this;
		if(delCallback){
			delCallback.call(labelNode,function(){
				content.delLabel(labelNode);
			});
		}else{
			content.delLabel(labelNode);
		}
	}
	
	node.append(tagLabelBoxButtonAdd.get(0));
	node.append(tagLabelBoxButtonClose.get(0));
	tagLabelBoxButtonAdd.bind("click",function(){
		addLabelBox.show();
		tagLabelBoxButtonAdd.css("display","none");
		tagLabelBoxButtonClose.css("display","block");
	});
	tagLabelBoxButtonClose.bind("click",function(){
		addLabelBox.hide();
		tagLabelBoxButtonAdd.css("display",(labelMaxCount>0 && nodeList.length>=labelMaxCount)?"none":"block");
		tagLabelBoxButtonClose.css("display","none");
	});
}