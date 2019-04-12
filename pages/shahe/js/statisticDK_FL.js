//地块分类统计
var websocket=window.parent.websocket;
var userData = window.parent.userData;
var statisticApp;
var statDataList=[];
var colorMark=[];
var colorList=["#db4d5d","#f5c86b","#1eb5a4","#db4dbb","#6b93f5"];
//初始化
function WSinit(){
	statisticApp=new StatisticApp();
}
$(WSinit);

function StatisticApp(){
	var content=this;
	var node=this.node=$(".statisticApp");
	var data=null;
	var startDate=0,endDate=0;
	var houseManagementType="所有房管所";//默认是所有房管所
	var orderByNavSelect=new OrderByNavSelect();
	
	var barchartsForBuildCount,
		barchartsForBuildArea,
		piechartsForBuildCount,
		piechartsForBuildArea;
	
	//加载数据
	this.loadData=function(_startDate,_endDate){
		node.find(".loadingStatus").fadeIn();        
        //获取地块分类统计结果
        websocket.send("JsonGetDKStatByFLRequest", $.extend(userData, { }), function (response) {
            if (response.status == 'success') {
                statDataList=response.dataList;
				node.find(".loadingStatus").fadeOut();
				selectEdCallback(orderByNavSelect.getSelectCount(),orderByNavSelect.getSelectData());
            }
            else{
				node.find(".loadingStatus").fadeOut();
				new AlertBoxMessage(
					{title:"信息提示",
					 message:"请求过程中遇到了错误",
					 showClose:false,btnCaption:["确定"],
					 callback:[function(){document.reload(true);}]});
            }
        });
	};
	
	//显示柱数据
	function showBarCharts(_count,_data){
		node.find(".chartFrame").find(".chartNodeBarBox").show(0);//显示柱图
		node.find(".chartFrame").find(".chartNodeBox").hide(0);//隐藏饼图
		
		var chartWidth=0,chartHeight=0;
		chartWidth=parseInt(node.find(".chartNodeBarBox").attr("chartWidth"));
		chartHeight=parseInt(node.find(".chartNodeBarBox").attr("chartHeight"));
		chartWidth=isNaN(chartWidth)?980:chartWidth;
		chartHeight=isNaN(chartHeight)?310:chartHeight;
		//选中数量及选中数据
		if(!barchartsForBuildCount){
			barchartsForBuildCount=echarts.init(node.find(".chartNodeBarBox .chartNodeBarTabData").get(0),"",{width:chartWidth,height:chartHeight});
		}
		if(!barchartsForBuildArea){
			barchartsForBuildArea=echarts.init(node.find(".chartNodeBarBox .chartNodeBarTabData").get(1),"",{width:chartWidth,height:chartHeight});
		}
		if(_count){
			node.find(".chartFrame").find(".chartNodeBarTabEmptyData").hide(0);//显示or隐藏没有数据的形态
			node.find(".chartNodeBarBox .chartNodeBarTabData canvas").show(0);
			barchartsForBuildCount.setOption(getHouseBarOption(_data,true),true);
			barchartsForBuildArea.setOption(getHouseBarOption(_data,false),true);
		}else{
			node.find(".chartFrame").find(".chartNodeBarTabEmptyData").show(0);//显示or隐藏没有数据的形态
			node.find(".chartNodeBarBox .chartNodeBarTabData canvas").hide(0);
		}
	}
	//显示饼图数据
	function showPieCharts(_count,_data){
		node.find(".chartFrame").find(".chartNodeBarBox").hide(0);//隐藏柱图
		node.find(".chartFrame").find(".chartNodeBox").show(0);//显示饼图
		if(_count===0){
			//显示空数据
			node.find(".chartFrame").find(".chartNodeBox").removeClass().addClass("chartNodeBox emptyData");
		}else if(_count===1){
			//显示一个数据
			var bgColor="#000000",
				nameData="",
				valueDataObject=getDataForName(houseManagementType),
				buildCountData="",
				buildAreaData="";
			for(var i=0;i<colorMark.length && i<_data.length;i++){
				if(_data[i]){
					bgColor=colorMark[i].color;
					nameData=colorMark[i].name;
					//Rui
					//2017-04
					buildCountData=valueDataObject["roomCount_"+(i+1)];
					buildAreaData=valueDataObject["roomArea_"+(i+1)];
				}
			}
			node.find(".chartFrame").find(".chartNodeBox").removeClass().addClass("chartNodeBox oneData");
			node.find(".chartFrame").find(".chartNodeBox").find(".oneDataFrame").eq(0).removeClass().addClass("oneDataFrame animated tada").css("background",bgColor).text(buildCountData);
			node.find(".chartFrame").find(".chartNodeBox").find(".oneDataFrameTxt").eq(0).removeClass().addClass("oneDataFrameTxt animated swing").text(nameData);
			
			node.find(".chartFrame").find(".chartNodeBox").find(".oneDataFrame").eq(1).removeClass().addClass("oneDataFrame animated tada").css("background",bgColor).text(buildAreaData);
			node.find(".chartFrame").find(".chartNodeBox").find(".oneDataFrameTxt").eq(1).removeClass().addClass("oneDataFrameTxt animated swing").text(nameData);
		}else{
			var chartWidth=0,chartHeight=0;
			//显示饼图
			node.find(".chartFrame").find(".chartNodeBox").removeClass().addClass("chartNodeBox pieChart");
			if(!piechartsForBuildCount){
				chartWidth=parseInt(node.find(".chartNodeBox").eq(0).attr("chartWidth"));
				chartHeight=parseInt(node.find(".chartNodeBox").eq(0).attr("chartHeight"));
				chartWidth=isNaN(chartWidth)?469:chartWidth;
				chartHeight=isNaN(chartHeight)?260:chartHeight;
				piechartsForBuildCount=echarts.init(node.find(".chartNodeBox").eq(0).find(".pieChart .pieChartCanvas").get(0),"",{width:chartWidth,height:chartHeight});
			}
			if(!piechartsForBuildArea){
				chartWidth=parseInt(node.find(".chartNodeBox").eq(1).attr("chartWidth"));
				chartHeight=parseInt(node.find(".chartNodeBox").eq(1).attr("chartHeight"));
				chartWidth=isNaN(chartWidth)?469:chartWidth;
				chartHeight=isNaN(chartHeight)?260:chartHeight;
				piechartsForBuildArea=echarts.init(node.find(".chartNodeBox").eq(1).find(".pieChart .pieChartCanvas").get(0),"",{width:chartWidth,height:chartHeight});
			}
			piechartsForBuildCount.setOption(getHousePieOption(houseManagementType,_data,true),true);
			piechartsForBuildArea.setOption(getHousePieOption(houseManagementType,_data,false),true);
		}
	}
	
	function selectEdCallback(_count,_data){
        showBarCharts(_count,_data);
	}
	
	//初始化事件
	function initEvent(){
		orderByNavSelect.callback(selectEdCallback);
		//关闭窗体
		node.find(".boxClose").bind("click",function(){
			if(window.top && typeof(window.top.closeStatisticFrame)==="function"){
				window.top.closeStatisticFrame();
			}
		});
		//下拉框选中
		node.find("#houseManagementSelectbox").selectBox("callback",function(_data,_caption,_selectbox,_selectchild){
			houseManagementType=_data;//设置选中的房管所
			selectEdCallback(orderByNavSelect.getSelectCount(),orderByNavSelect.getSelectData());
		});
		//柱图切换
		node.find(".chartNodeBarBox").find(".chartNodeBarTabValue").bind("click",function(){
			node.find(".chartNodeBarBox").find(".chartNodeBarTabValue").removeClass("hover");
			$(this).addClass("hover");
			$(this).parents(".chartNodeBarBox").find(".chartNodeBarTabData").hide(0).eq($(this).index()).show();
		});
        //搜索
		node.find(".searchBoxButton").bind("click",function(){
			if(!node.find(".startDateTimeInput input").val()){
				node.find(".startDateTimeInput input").focus();
			 }else if(!node.find(".endDateTimeInput input").val()){
				node.find(".endDateTimeInput input").focus();
			}else{
				content.loadData(node.find(".startDateTimeInput input").val(),node.find(".endDateTimeInput input").val());
			}
		});
		var date=new Date();
		//初始化时间筛选条件
		node.find(".startDateTimeInput input").datetimepicker({
			lang: 'ch', 
			value: date.getFullYear()+"年"+(date.getMonth()+1)+"月"+date.getDate()+"日", //赋值
			timepicker: false,
			format:'Y年m月d日',
			formatDate:'Y年m月d日',
			autoclose:true,
			inline: false, //如果要显示出编辑框的话这里写 false
			onChangeDateTime:function(_date,_input){
				startDate = _date.getFullYear()+"年"+(_date.getMonth()+1)+"月"+_date.getDate()+"日";
			}
		});
		date=new Date(new Date().getTime()-1000*60*60*24*30*6);
		node.find(".endDateTimeInput input").datetimepicker({
			lang: 'ch', 
			value: date.getFullYear()+"年"+(date.getMonth()+1)+"月"+date.getDate()+"日", //赋值
			timepicker: false,
			format:'Y年m月d日',
			formatDate:'Y年m月d日',
			autoclose:true,
			inline: false, //如果要显示出编辑框的话这里写 false
			onChangeDateTime:function(_date,_input){
				endDate = _date.getFullYear()+"年"+(_date.getMonth()+1)+"月"+_date.getDate()+"日";
			}
		});
	}
	
	//初始化下拉框数据
	function initHouseManagementSelectbox(){
		$("#houseManagementSelectbox").selectBox("removeAll").selectBox("add","全部","全部",true,false);
//      colorMark=[];
//		for(var i=0;i<data.dataList.length;i++){
//			var fangGuanSuo=data.dataList[i].fgsName;
//			$("#houseManagementSelectbox").selectBox("add",fangGuanSuo,fangGuanSuo,false,false);
//		}
	}
	
	//根据id获取数据
	function getDataForName(_id){
		for(var i=0;i<data.dataList.length;i++){
				return data.dataList[i];
		}
		return null;
	}
	
	//获取饼图配置参数
	function getHousePieOption(_typeId,_showtypeArr,_action){
		var showtypeArr= _showtypeArr;
		var option = {
			label: {
				normal: {
					formatter: "{b}\n({c}-{d}%)",
					position: "insideTopRight"
				},
				emphasis:{
					formatter: "{b}\n({c}-{d}%)",
					position: "insideTopRight"
				}
			},
			series: {
				name: _typeId?_typeId:"全部",
				type: 'pie',
				startAngle: 10,
				minAngle: 5,
				radius:[0,'50%'],
				roseType: 'angle',
				itemStyle: {
					emphasis: {
						shadowBlur: 50,
						shadowOffsetX: 0,
						shadowOffsetY: 0,
						shadowColor: 'rgba(0, 0, 0, 0.5)'
					}
				},
				data: []
			}
		};
		//var pieData=getDataForName(_typeId);
		for(var x=0;x<data.dataList.length;x++){
			//if(showtypeArr.length<x || !showtypeArr[x]){ continue;}
			var value=_action? data.dataList[x].COUNT:data.dataList[x].MJ;
			var dataValue={
				value:value,
				name: colorMark[x].name,
				itemStyle: {
					normal: {color:colorMark[x].color}
				},
			};
			option.series.data.push(dataValue);
		}
		return option;
		
	}
	
	//获取柱图配置参数
	function getHouseBarOption(_showtypeArr,_action){
		//_action  true为建筑
		var showtypeArr= _showtypeArr;
		//node.find(".chartFrame").addClass("showMask").find(".chartNodeBarBox").show(0);
		var xData=[];//xh轴名称
        var yData=[];
        if(_action) statDataList=statDataList.sort(function(x,y){return y.COUNT-x.COUNT;});
        else  statDataList=statDataList.sort(function(x,y){return y.MJ-x.MJ;});
		for(var i=0;i<statDataList.length;i++){
			xData.push(statDataList[i].FL);
			yData.push(statDataList[i][_action?"COUNT":"MJ"]);
		}
		var option={
            "color":[_action?"lightsalmon":"lightsalmon"],
			"tooltip": {
				"trigger": "axis",
				"axisPointer": {
					"type": "shadow"
				},
                "formatter": function (params) {
                    var tar = params[1];
                    return tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value;
                }
			},
			"grid": {
				"x":50,
				"x2":50,
				"y": 70,
				"y2": 20
			},
			"xAxis": [{
				"type": "category",
				"axisLine":{
					"show": true,
					"lineStyle": {
						"color": '#aaa',
						"width": 1,
						"type": "solid"
					}
				},
				"axisTick": {
					"show": false
				},
				"splitArea": {
					"show": false
				},
				"axisLabel": {
					"interval": 0,
					"rotate": 0,
					"show": true,
					"textStyle": {
						"color": "#ffffff",
						"fontFamily": "微软雅黑",
						"fontSize": 12
					}
				},
				"data": xData,
			}],
			"yAxis": [{
				"type": "value",
				"splitLine": {
					"show": true,
					"lineStyle": {
						"color": ['rgba(255,255,255,0.15)'],
						"width": 1,
						"type": "solid"
					}
				},
				"axisLine":{
					"show": true,
					"lineStyle": {
						"color": '#aaa',
						"width": 1,
						"type": "solid"
					}
				},
				"axisTick": {
					"show": false
				},
				"splitArea": {
					"show": false
				},
				"axisLabel": {
					"interval": 0,
					"rotate": 0,
					"show": true,
					"splitNumber": 10,
					"textStyle": {
						"color": "#ffffff",
						"fontFamily": "微软雅黑",
						"fontSize": 12
					}
				}
			}],
			"series": [{
                    "name":_action?"地块数量":"地块面积",
					"type": "bar",
					"stack": _action?"地块数量":"地块面积",
					"barGap":"50%",
					"barMaxWidth":"35",
                    "data":yData
            },
            {
                    "name": _action?"地块数量":"地块面积",
					"type": "bar",
					"stack": _action?"地块数量":"地块面积",
                    "label": {
                        "normal": {
                            "show": true,
                            "position": 'top',
					        "textStyle": {
						        "color": "#ffffff",
						        "fontFamily": "微软雅黑",
						        "fontSize": 12
					        }
                        }
                    },
                    "data":yData
            }]
		};
		return option;
	}
	
	initEvent();
    content.loadData(node.find(".startDateTimeInput input").val(),node.find(".endDateTimeInput input").val());
}

function OrderByNavSelect(){
	var content=this;
	var node=this.node=$(".orderByNavSelect");
	var callback=null,selectData=[];
	//设置回调函数
	this.callback=function(_value){
		if(typeof(_value)==="function"){
			callback=_value;
			return this;
		}
		return callback;
	};
	//获取选中情况，返回数组，选中为1，否则为0
	this.getSelectData=function(_data){
		selectData.splice(0,selectData.length);
		node.find(".orderByNavSelectNode").each(function(index,element){
			//selectData.push($(element).hasClass("selectNode")?1:0);
		});
        for (var i = 0; i < statDataList.length; i++) {
            selectData.push(statDataList[i].FL);
        }
		return selectData;
	};
	this.selectAll=function(){
		node.find(".orderByNavSelectNode i").removeClass("fa-square").addClass("fa-check-square");
		node.find(".orderByNavSelectNode").addClass("selectNode");
	};
	//获取选中的数量
	this.getSelectCount=function(_data){
		//return node.find(".selectNode").length;
        return statDataList.length;
	};
	function onOrderNodeClick(event){
		var iNode=$(this).find("i");
		if(iNode.hasClass("fa-check-square")){
			iNode.removeClass("fa-check-square").addClass("fa-square");
			$(this).removeClass("selectNode");
		}else{
			iNode.removeClass("fa-square").addClass("fa-check-square");
			$(this).addClass("selectNode");
		}
		if(content.callback()){
			content.callback().call(content,content.getSelectCount(),content.getSelectData());
		}
	}
	function initEvent(){
		node.find(".orderByNavSelectNode i").removeClass("fa-check-square").addClass("fa-square");
		node.find(".orderByNavSelectNode").bind("click",onOrderNodeClick);
	}
	initEvent();
}