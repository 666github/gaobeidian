//底图服务
var urlPrefix = "http://" + WebConfig.uploadFileUrl + "/fileservice/services/";
var shaHeBaseMap_1954_V_C_url = urlPrefix + "ShaHeBaseMap_1954_V_C/MapServer";
var shaHe_GHZH_1954_VC_url = urlPrefix + "ShaHe_GHZH_1954_VC/MapServer";
var shaHe_TDLYZTGH_1954_VC_url = urlPrefix + "ShaHe_TDLYZTGH_1954_VC/MapServer";
var shaHe_4_3JQ_1954_VC_url = urlPrefix + "ShaHe_4_3JQ_1954_VC/MapServer";
/*高碑店*/
var GaoBeiDianBaseMap_1954_V_C_url = urlPrefix + "GaoBeiDian_1954_V_C/MapServer";
var GaoBeiDianBaseMap_DZDT_url = urlPrefix + "GaoBeiDian_dzdt/MapServer";
var GaoBeiDianBaseMap_QDR_url = urlPrefix + "GaoBeiDian_qdr/MapServer";
/*高碑店*/
var shahebmLayer, ghzhbmLayer, tdlyztghbmLayer, _4_3jqbmlayer, cunlayer, sqlayer,fwlayerGytd,fwlayerJttd,fwlayerFwsj
    , showdkLayer, symbol_dk_high, attr, __drawToolbar, dkTxtLayer,sqTxtLayer;
var changed = false;
var dkIDMap = {};
var fwIDMap = {},fwIDMap2={},fwIDMapJttd={},fwIDMapFwsj;
var ztt = {};
var renderer = {};
//图层加载
function initMap() {
    require([
		"esri/map",
		"esri/layers/ArcGISTiledMapServiceLayer",
		"esri/layers/GraphicsLayer",
		"esri/geometry/Extent",
		"esri/SpatialReference",
		"esri/geometry/Polygon",
        "esri/geometry/Point",
        "esri/graphic",
		"esri/renderers/jsonUtils",
		"esri/InfoTemplate",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/TextSymbol",
        "esri/symbols/Font",
        "esri/layers/LabelClass",
        "esri/Color",
        "dojo/_base/connect",
		"esri/toolbars/draw"
		],
    function (Map, ArcGISTiledMapServiceLayer, GraphicsLayer, Extent, SpatialReference, Polygon, Point, Graphic, jsonUtil, InfoTemplate,
SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, TextSymbol, Font, LabelClass, Color, connect) {
        //初始化map
        map = new esri.Map("mapContent", { logo: false, slider: false, zoom: -1 });

        //加载底图
        shahebmLayer = new ArcGISTiledMapServiceLayer(GaoBeiDianBaseMap_1954_V_C_url);
        map.addLayer(shahebmLayer);//影像
        ghzhbmLayer = new ArcGISTiledMapServiceLayer(GaoBeiDianBaseMap_DZDT_url);
        map.addLayer(ghzhbmLayer);//电子地图
        tdlyztghbmLayer = new ArcGISTiledMapServiceLayer(GaoBeiDianBaseMap_QDR_url);
        map.addLayer(tdlyztghbmLayer);//qdr
//      _4_3jqbmlayer = new ArcGISTiledMapServiceLayer(shaHe_4_3JQ_1954_VC_url);
//      map.addLayer(_4_3jqbmlayer);

        shahebmLayer.setVisibility(true);
        ghzhbmLayer.setVisibility(false);
        tdlyztghbmLayer.setVisibility(false);
//      _4_3jqbmlayer.setVisibility(false);

//      //专题图配置信息
        for (var index = 0; index < zttsetting.length; index++) {
            var item = zttsetting[index];
            ztt[item.NAME] = JSON.parse(item.DETAIL);
            var ly = ztt[item.NAME];
            renderer[item.NAME] = jsonUtil.fromJson(ly.drawingInfo.renderer);
        }
//      //添加村图层
        cunlayer = new GraphicsLayer();
        var infoTemplate_cun = new InfoTemplate("<i class='fa fa-fw fa-file'></i>村界信息", function click(fea) {
            return clickCUN(fea);
        });
        cunlayer.setInfoTemplate(infoTemplate_cun);
        //cunlayer.on("dbl-click", function (evt) { alert("test"); });
        map.addLayer(cunlayer);
        //添加村界展示图层
        showdkLayer = new GraphicsLayer();
        //showdkLayer.setInfoTemplate(infoTemplate_cun);
        map.addLayer(showdkLayer);
        //添加社区界图层
        sqlayer = new GraphicsLayer();
        sqlayer.minScale = 20000;
        var infoTemplate_fw = new InfoTemplate("<i class='fa fa-fw fa-file'></i>社区界信息", function click(fea) {
            return clickSQ(fea);
        });
        sqlayer.setInfoTemplate(infoTemplate_fw);
        map.addLayer(sqlayer);
        //---
        //国有土地
        fwlayerGytd = new GraphicsLayer();
//      fwlayerGytd.minScale = 8000;
        fwlayerGytd.setOpacity(0.4);
        var infoTemplate_gytd = new InfoTemplate("<i class='fa fa-fw fa-file'></i>国有土地信息", function click(fea) {
            return clickTD(fea);
        });
        fwlayerGytd.setInfoTemplate(infoTemplate_gytd);
        map.addLayer(fwlayerGytd);
        //集体土地
        fwlayerJttd = new GraphicsLayer();
//      fwlayerJttd.minScale = 8000;
        fwlayerJttd.setOpacity(0.15);
        var infoTemplate_jttd = new InfoTemplate("<i class='fa fa-fw fa-file'></i>集体土地信息", function click(fea) {
            return clickTD(fea);
        });
        fwlayerJttd.setInfoTemplate(infoTemplate_jttd);
        map.addLayer(fwlayerJttd);
        //房屋数据
        fwlayerFwsj = new GraphicsLayer();
        fwlayerFwsj.minScale = 8000;fwlayerJttd.setOpacity(0.5);
        var infoTemplate_jttd = new InfoTemplate("<i class='fa fa-fw fa-file'></i>房屋数据信息", function click(fea) {
            return clickFWSJ(fea);
        });
        fwlayerFwsj.setInfoTemplate(infoTemplate_jttd);
        map.addLayer(fwlayerFwsj);
        //---
        //添加村名称显示层
        dkTxtLayer = new GraphicsLayer();
//        dkTxtLayer.minScale = 8000;
        //dkTxtLayer.setOpacity(0.1);
        map.addLayer(dkTxtLayer);
        //添加社区名称显示层
        sqTxtLayer= new GraphicsLayer();
        map.addLayer(sqTxtLayer);
        //加载业务图层数据
        mapClickBuild(null, Polygon, Graphic);
//      //设置地图的中心
 		map.on("extent-change", function (event) {
            mapquery(event, Polygon, Graphic);
        });
//      map.on("load", function () { map.centerAndZoom(new esri.geometry.Point(492762.64, 329492.535, map.spatialReference)); });
        //地块高亮显示渲染
        symbol_dk_high = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 245, 255]), 5), new Color([0, 255, 0, 1])
        );
        //测量工具
        __drawToolbar = new esri.toolbars.Draw(map);
    });
}

//map event
var graphmapFW = {};
function mapquery(event, Polygon, Graphic) {//动态获取房屋数据
    if (fwlayerFwsj.visibleAtMapScale) {
        websocket.send("JsonGetGBDFWByExtentFilterRequest", { sessionid: userData.sessionid, extent: event.extent }, function (response) {
            if (response.status == "success") {
                var data = response.data;
                for (var index = 0; index < data.length; index++) {
                    var item = data[index];
                    if (item.polygon == null) {
                        continue;
                    }
                    var geometry = new Polygon(item.polygon);
                    var graphic = new Graphic(geometry);

                    graphic.setAttributes(item.fw);

                    AddToGraphLayer(fwlayerFwsj, graphmapFW, graphic, "OBJECTID");
                }
            }
        });
    }
}
function AddToGraphLayer(layer, graphmap, graph, mapfield) {
    var key = graph.attributes[mapfield];
    if (graphmap[key] == null) {
        graphmap[key] = graph;
        layer.add(graph);
    }
    else {
        graphmap[key].geometry = graph.geometry;
        graphmap[key].attributes = graph.attributes;
        graphmap[key].draw();
    }
}
function mapClickBuild(event, Polygon, Graphic) {
    websocket.send("JsonGetAllGBDCUNRequest", { sessionid: userData.sessionid }, function (response) {//村界
        if (response.status == "success") {
            require(["esri/geometry/Extent", "esri/SpatialReference", "esri/symbols/TextSymbol", "esri/Color", "esri/symbols/Font"]
            , function (Extent, SpatialReference, TextSymbol, Color, Font) {
                var data = response.data;
                dkIDMap = {};
                cunlayer.clear();
                for (var index = 0; index < data.length; index++) {
                    var item = data[index];
                    var geometry = new Polygon(item.polygon);
                    //坐标系id转换成数字，原来是字符串
                    var extent = geometry.getExtent();
                    extent = new Extent(extent.xmin, extent.ymin, extent.xmax, extent.ymax, new SpatialReference({ wkid: 2436 }));
                    geometry.extent = extent;
                    geometry.setSpatialReference(new SpatialReference({ wkid: 2436 }));//Beijing_1954_3_Degree_GK_CM_117E
                    geometry.setCacheValue("_extent", extent);
                    var graphic = new Graphic(geometry);

                    graphic.setAttributes(item.cun);
//                  dkIDMap[item.dk.OBJECTID] = graphic;
					dkIDMap[item.OBJECTID] = graphic;
                    cunlayer.add(graphic);

                    var graphic_txt = new Graphic(geometry);//设textSymbol设置字体显示和样式243, 151, 119 13, 166, 220
                    var textSymbol = new TextSymbol(item.cun.NAME)
                                        .setColor(new Color([191, 0, 0]))
                                        .setAlign(Font.ALIGN_MIDDLE)
                                        .setFont(new Font("18pt").setWeight(Font.WEIGHT_BOLD));
                    graphic_txt.symbol = textSymbol;
                    dkTxtLayer.add(graphic_txt);
                }
                renderDKLayerShow("村名称");
            });
        }
    });
    websocket.send("JsonGetAllGBDSQRequest", { sessionid: userData.sessionid }, function (response) {//社区界
        if (response.status == "success") {
            require(["esri/geometry/Extent", "esri/SpatialReference", "esri/symbols/TextSymbol", "esri/Color", "esri/symbols/Font"]
            ,function (Extent, SpatialReference, TextSymbol, Color, Font) {
                var data = response.data;
                fwIDMap = {};
                sqlayer.clear();
                for (var index = 0; index < data.length; index++) {
                    var item = data[index];
                    var geometry = new Polygon(item.polygon);
                    //坐标系id转换成数字，原来是字符串
                    var extent = geometry.getExtent();
                    if (extent) {
                        extent = new Extent(extent.xmin, extent.ymin, extent.xmax, extent.ymax, new SpatialReference({ wkid: 2436 }));
                        geometry.extent = extent;
                        geometry.setSpatialReference(new SpatialReference({ wkid: 2436 }));
                        geometry.setCacheValue("_extent", extent);
                        var graphic = new Graphic(geometry);
                        graphic.setAttributes(item.sq);
//                      fwIDMap[item.fw.OBJECTID] = graphic;
						fwIDMap[item.OBJECTID] = graphic;
                        sqlayer.add(graphic);  
                        
                        var graphic_txtsq = new Graphic(geometry);//设textSymbol设置字体显示和样式
	                    var textSymbolsq = new TextSymbol(item.sq.NAME)
	                                        .setColor(new Color([255, 87, 34]))
	                                        .setAlign(Font.ALIGN_MIDDLE)
	                                        .setFont(new Font("15pt").setWeight(Font.WEIGHT_BOLD));
	                    graphic_txtsq.symbol = textSymbolsq;
	                    sqTxtLayer.add(graphic_txtsq);
                    }
                }
                renderFWLayerShow("社区界");
            });
        }
    });
     websocket.send("JsonGetAllGBDGYRequest", { sessionid: userData.sessionid }, function (response) {//国有土地
        if (response.status == "success") {
            require(["esri/geometry/Extent", "esri/SpatialReference"], function (Extent, SpatialReference) {
                var data = response.data;
                fwIDMap2 = {};
                fwlayerGytd.clear();
                for (var index = 0; index < data.length; index++) {
                    var item = data[index];
                    var geometry = new Polygon(item.polygon);
                    //坐标系id转换成数字，原来是字符串
                    var extent = geometry.getExtent();
                    if (extent) {
                        extent = new Extent(extent.xmin, extent.ymin, extent.xmax, extent.ymax, new SpatialReference({ wkid: 2436 }));
                        geometry.extent = extent;
                        geometry.setSpatialReference(new SpatialReference({ wkid: 2436 }));
                        geometry.setCacheValue("_extent", extent);
                        var graphic = new Graphic(geometry);
                        graphic.setAttributes(item.gy);
						fwIDMap2[item.OBJECTID] = graphic;
                        fwlayerGytd.add(graphic);
                    }
                }
                renderFWLayerShow2("国有界线");
            });
        }
    });
	websocket.send("JsonGetAllGBDJTRequest", { sessionid: userData.sessionid }, function (response) {//集体土地
        if (response.status == "success") {
            require(["esri/geometry/Extent", "esri/SpatialReference"], function (Extent, SpatialReference) {
                var data = response.data;
                fwIDMapJttd = {};
                fwlayerJttd.clear();
                for (var index = 0; index < data.length; index++) {
                    var item = data[index];
                    var geometry = new Polygon(item.polygon);
                    //坐标系id转换成数字，原来是字符串
                    var extent = geometry.getExtent();
                    if (extent) {
                        extent = new Extent(extent.xmin, extent.ymin, extent.xmax, extent.ymax, new SpatialReference({ wkid: 2436 }));
                        geometry.extent = extent;
                        geometry.setSpatialReference(new SpatialReference({ wkid: 2436 }));
                        geometry.setCacheValue("_extent", extent);
                        var graphic = new Graphic(geometry);
                        graphic.setAttributes(item.jt);
						fwIDMapJttd[item.OBJECTID] = graphic;
                        fwlayerJttd.add(graphic);
                    }
                }
                renderFWLayerShowJttd("集体界线");
            });
        }
    });
    websocket.send("JsonGetAllGBDFWRequest", { sessionid: userData.sessionid }, function (response) {//房屋数据 JsonGetAllGBDFWRequest
        if (response.status == "success") {
            require(["esri/geometry/Extent", "esri/SpatialReference"], function (Extent, SpatialReference) {
                var data = response.data;
                fwIDMapFwsj = {};
                fwlayerFwsj.clear();
                for (var index = 0; index < data.length; index++) {
                    var item = data[index];
                    var geometry = new Polygon(item.polygon);
                    //坐标系id转换成数字，原来是字符串
                    var extent = geometry.getExtent();
                    if (extent) {
                        extent = new Extent(extent.xmin, extent.ymin, extent.xmax, extent.ymax, new SpatialReference({ wkid: 2436 }));
                        geometry.extent = extent;
                        geometry.setSpatialReference(new SpatialReference({ wkid: 2436 }));
                        geometry.setCacheValue("_extent", extent);
                        var graphic = new Graphic(geometry);
                        graphic.setAttributes(item.fw);
						fwIDMapFwsj[item.OBJECTID] = graphic;
                        fwlayerFwsj.add(graphic);
                    }
                }
                renderFWLayerShowFwsj("房屋数据");//房屋图例
            });
        }
    });
   //房屋筛选事件
	var fwsxSelect=()=>{
		var fwsxFormCun=$(".fwsxFormCun"),fwsxFormCunInput= $(".fwsxFormCunInput"),
		fwsxFormSq=$(".fwsxFormSq"),fwsxFormSqInput= $(".fwsxFormSqInput"),
//		fwsjFormDk=$(".fwsjFormDk"),fwsjFormYt=$(".fwsjFormYt"),fwsjFormYt2=$(".fwsjFormYt2");
		fwsjFormDk=$(".fwsjFormDk"),fwsjFormDkInput= $(".fwsjFormDkInput"),
		fwsjFormYt=$(".fwsjFormYt"),fwsjFormYtInput= $(".fwsjFormYtInput"),
		fwsjFormDk2=$(".fwsjFormDk2"),fwsjFormDk2Input= $(".fwsjFormDk2Input");
		var strSq="",strCun=''; var strDk='',strYt='';    				
	    layui.use(['layer','form'],function(){
	    	var layer=layui.layer,form=layui.form;
			websocket.send("JsonGetFWStatisticsRequest_init", $.extend(userData, {}), function (_json) {
	            var htmlcun = '', htmlsq ='',htmldk='',htmlyt='';
//	            htmldk='<option>地块类型</option>',htmlyt='<option>用途</option>';
	            for (var i = 0; i < _json.data[0].length; i++) {
	                htmlcun +='<input type="checkbox" name="" lay-skin="primary" title="'+ _json.data[0][i].CMC +'" >';
	                strCun+=_json.data[0][i].CMC+',';
	            }
	            for (var i = 0; i < _json.data[1].length; i++) {
	            	if(_json.data[1][i].YT==null)continue;
//	                htmlyt +='<option>'+ _json.data[1][i].YT + '</option>';
					htmlyt +='<input type="checkbox" name="" lay-skin="primary" title="'+ _json.data[1][i].YT +'" >'
	                strYt+=_json.data[1][i].YT+',';
	            }
	            for (var i = 0; i < _json.data[2].length; i++) {
	            	if(_json.data[2][i].DLMC==null)continue;
//	                htmldk +='<option>'+ _json.data[2][i].DLMC + '</option>';
					htmldk +='<input type="checkbox" name="" lay-skin="primary" title="'+ _json.data[2][i].DLMC +'" >';
	                strDk+=_json.data[2][i].DLMC+',';
	            }
	            for (var i = 0; i < _json.data[3].length; i++) {
	            	if(_json.data[3][i].SQMC==null)continue;
	                htmlsq +='<input type="checkbox" name="" lay-skin="primary" title="'+ _json.data[3][i].SQMC +'" >';
	                strSq+=_json.data[3][i].SQMC+',';
	            }
	            fwsxFormCunInput.html(htmlcun);
	            fwsxFormSqInput.html(htmlsq);
				fwsjFormYtInput.html(htmlyt);
	            fwsjFormDkInput.html(htmldk);
	            fwsjFormDk2Input.html(htmldk);
	            form.render();
	        });
			//村选择
	        fwsxFormCun.focus(function(){
				fwsxFormCunInput.show();
				fwsxFormSqInput.hide();
			});
			fwsxFormCunInput.hover(function(){
				fwsxFormCunInput.show();
			},function(){
				fwsxFormCunInput.hide();
				fwsxFormCun.blur();//[1].innerText
				var spantexts=fwsxFormCunInput.find('.layui-form-checked span');
				var strs='';
				spantexts.each(function(x){
					strs+=spantexts[x].innerText+',';
				});
				strs=strs.slice(0,-1);
				fwsxFormCun.val(strs);
				websocket.send("JsonGetFWStatisticsRequest_initByCMC", $.extend(userData, {CMC:strs}), function (_json) {
		            var htmlsq ='';		            
		            for (var i = 0; i < _json.data.length; i++) {
		            	if(_json.data[i].SQMC==null)continue;
		                htmlsq +='<input type="checkbox" name="" lay-skin="primary" title="'+ _json.data[i].SQMC +'" >';
		            }
		            fwsxFormSqInput.html(htmlsq);
		            form.render();
		       });
			})
			//社区选择
			var fwsxChoice=function(fwsjInput,fwsjDiv){//房屋筛选下拉封装
				fwsjInput.focus(function(){
					fwsjDiv.show();
				});
				fwsjDiv.hover(function(){
					fwsjDiv.show();
				},function(){
					fwsjDiv.hide();
					fwsjInput.blur();//[1].innerText
					var spantexts=fwsjDiv.find('.layui-form-checked span');
					var strs='';
					spantexts.each(function(x){
						strs+=spantexts[x].innerText+',';
					});
					fwsjInput.val(strs.slice(0,-1));
				});
			}
			fwsxChoice(fwsxFormSq,fwsxFormSqInput);//社区选择
			fwsxChoice(fwsjFormDk,fwsjFormDkInput);
			fwsxChoice(fwsjFormYt,fwsjFormYtInput);//用途选择		
			fwsxChoice(fwsjFormDk2,fwsjFormDk2Input);//用途筛选2
			//用途图层筛选
//		    form.on('select(fwsjFormYt2)',function(data){
//		    	var dkValue=$(".fwsjFormYt2").val();
//		    	websocket.send("JsonGetAllGBDFWRequest", { sessionid: userData.sessionid }, function (response) {//房屋数据 JsonGetAllGBDFWRequest
//			        if (response.status == "success") {
//			            require(["esri/geometry/Extent", "esri/SpatialReference"], function (Extent, SpatialReference) {
//			                var data = response.data;
//			                fwIDMapFwsj = {};
//			                fwlayerFwsj.clear();
//			                for (var index = 0; index < data.length; index++) {
//			                    if(data[index].fw.YT!==dkValue && dkValue!=="用途")continue;
//		                    	var item = data[index];debugger
//			                    var geometry = new Polygon(item.polygon);
//			                    //坐标系id转换成数字，原来是字符串
//			                    var extent = geometry.getExtent();
//			                    if (extent) {
//			                        extent = new Extent(extent.xmin, extent.ymin, extent.xmax, extent.ymax, new SpatialReference({ wkid: 2436 }));
//			                        geometry.extent = extent;
//			                        geometry.setSpatialReference(new SpatialReference({ wkid: 2436 }));
//			                        geometry.setCacheValue("_extent", extent);
//			                        var graphic = new Graphic(geometry);
//			                        graphic.setAttributes(item.fw);
//									fwIDMapFwsj[item.OBJECTID] = graphic;
//			                        fwlayerFwsj.add(graphic);
//			                    }
//
//			                }
//			                renderFWLayerShowFwsj("房屋数据");//房屋图例
//			            });
//			        }
//		    	}) 
//		    })
	    })
	    //房屋图层筛选
	    $("#fwsxBtn,#fwsxTjBtn").hover(function(){
	    	fwsxFormCunInput.hide();fwsxFormSqInput.hide(); fwsjFormDkInput.hide(); fwsjFormYtInput.hide();
	    	$(".fwsxFormParent .fwsxForm>input").blur();
	    })
	    $("#fwsxBtn").click(function(){//社区可以为空（社区为空按村查，其他为空默认为所有）
	    	var sxCun=($(".fwsxFormCun").val()==''?strCun.slice(0,-1):$(".fwsxFormCun").val()),sxSq=$(".fwsxFormSq").val(),
	    		sxTd=$(".fwsjFormTd option:selected").val(),
	    		sxDk=($(".fwsjFormDk").val()==''?strDk.slice(0,-1):$(".fwsjFormDk").val()),
	    		sxYt=($(".fwsjFormYt").val()==''?strYt.slice(0,-1):$(".fwsjFormYt").val());
	    	websocket.send("JsonGetAllGBDFWRequest", { sessionid: userData.sessionid }, function (response) {//房屋数据 JsonGetAllGBDFWRequest
		        if (response.status == "success") {
		            require(["esri/geometry/Extent", "esri/SpatialReference"], function (Extent, SpatialReference) {
		                var data = response.data;
		                fwIDMapFwsj = {};
		                fwlayerFwsj.clear();		               
		                for (var index = 0; index < data.length; index++) {
//		                	if(data[index].fw.CMC!==sxCun)continue;
		                	var fwval=false;
		                	if(sxSq!=''){//社区不为空，忽略村查社区
		                		sxSq.split(',').forEach(function(val){
									if(val==data[index].fw.SQMC){
										if(sxTd!=''){
					                		if(sxTd==data[index].fw.TZLX){
					                			sxYt.split(',').forEach(function(val2){
													if(val2==data[index].fw.YT){
														fwval=true;console.log(val,fwval)
													}
												})
					                		}
					               		}else{
					               			sxYt.split(',').forEach(function(val2){
												if(val2==data[index].fw.YT){
													fwval=true;console.log(val,fwval)
												}
											})
					               		}
									}
								})
								if(!fwval){
									continue
								}
		                	}else{//社区为空，忽略社区查村
		                		sxCun.split(',').forEach(function(val){
									if(val==data[index].fw.CMC){ 
										if(val==data[index].fw.SQMC){
											if(sxTd!=''){
						                		if(sxTd==data[index].fw.TZLX){
						                			sxYt.split(',').forEach(function(val2){
														if(val2==data[index].fw.YT){
															fwval=true;console.log(val,fwval)
														}
													})
						                		}
						               		}else{
						               			sxYt.split(',').forEach(function(val2){
													if(val2==data[index].fw.YT){
														fwval=true;console.log(val,fwval)
													}
												})
						               		}
										}
									}
								})
		                		if(!fwval){
		                			continue
		                		}
		                	}
		                	
//		                	if(sxYt!=''){
//		                		sxYt.split(',').forEach(function(val){
//									if(val==data[index].fw.YT){
//										fwval=true;console.log(val,fwval)
//									}
//								})
//		                		if(!fwval){
//		                			continue
//		                		}
//		                	}
		                    var item = data[index];		                    
		                    var geometry = new Polygon(item.polygon);
		                    //坐标系id转换成数字，原来是字符串
		                    var extent = geometry.getExtent();
		                    if (extent) {
		                        extent = new Extent(extent.xmin, extent.ymin, extent.xmax, extent.ymax, new SpatialReference({ wkid: 2436 }));
		                        geometry.extent = extent;
		                        geometry.setSpatialReference(new SpatialReference({ wkid: 2436 }));
		                        geometry.setCacheValue("_extent", extent);
		                        var graphic = new Graphic(geometry);
		                        graphic.setAttributes(item.fw);
								fwIDMapFwsj[item.OBJECTID] = graphic;
		                        fwlayerFwsj.add(graphic);
		                    }
		                }
		                renderFWLayerShowFwsj("房屋数据");//房屋图例
		            });
		        }
	    	}) 
	    })
	    //房屋筛选统计表单
	    $("#fwsxTjBtn").click(function(){
	    	var sxCun=($(".fwsxFormCun").val()==''?strCun.slice(0,-1):$(".fwsxFormCun").val()),sxSq=$(".fwsxFormSq").val(),
	    		sxTd=$(".fwsjFormTd option:selected").val(),
	    		sxDk=($(".fwsjFormDk").val()==''?strDk.slice(0,-1):$(".fwsjFormDk").val()),
	    		sxYt=($(".fwsjFormYt").val()==''?strYt.slice(0,-1):$(".fwsjFormYt").val());console.log(sxTd)
	    	websocket.send("JsonGetFWStatisticsRequest_ByPara", $.extend(userData, { CMC:sxCun,SQMC:sxSq,YT:sxYt,TZLX:sxTd,DLMC:sxDk }), function (_json) {
	    		var fwdata1=_json.data[0],fwdata2=_json.data[1];var fwdata=(sxSq==""?sxCun:sxSq);
				fwYtInfo(fwdata1,fwdata2,fwdata);					
                $(".chartBoxFrame3").removeClass("hide");
                $(".esriPopup").removeClass('hide');//信息弹框去掉区域查询时添加的hide   
                $("#clickfw2").removeClass('layui-this');//控制区域查询表单显示，默认显示属性表
        		$("#clickfw1").addClass('layui-this');       		
	    	})
	   })	    
	    //用途筛选统计表单
	    $("#dksxBtn,#dksxTjBtn").hover(function(){fwsjFormDk2Input.hide();fwsjFormDk2.blur();});
	    $("#dksxTjBtn").click(function(){
	    	var sxDk2=($(".fwsjFormDk2").val()==''?strDk.slice(0,-1):$(".fwsjFormDk2").val());
	    	websocket.send("JsonGetFWStatisticsRequest_DKLX", $.extend(userData,{DKLX:sxDk2}), function (_json) {debugger
	    		var lxData=_json.data;
				fwYtInfo2(lxData);					
                $(".chartBoxFrame4").removeClass("hide");
                $(".esriPopup").removeClass('hide');//信息弹框去掉区域查询时添加的hide   
	    	})
	    })
	}
	fwsxSelect();
}
// 点击geometry显示信息内容  增加查看更多
function clickCUN(obj, _reportId) {
    var content = "<p class='fe_Attr mb5'>所属村：<span>" + getFeatureFieldValue(obj.attributes.NAME) + "</span></p>"
    return content;
}
// 点击geometry显示信息内容  增加查看更多
function clickSQ(obj, _reportId) {
	var bld_area = obj.attributes.ZDMJ;
    if (!isNaN(parseFloat(bld_area))) bld_area = bld_area.toFixed(2);
    var content = "<p class='fe_Attr mb5'>所属乡村：<span>" + getFeatureFieldValue(obj.attributes.SQC) + "</span></p>"
        + "<p class='fe_Attr mb5'>所属社区：<span>" + getFeatureFieldValue(obj.attributes.NAME) + "</span></p>"
        + "<p class='fe_Attr mb5'>占地面积：<span>" + bld_area + "平方米</span></p>"
    return content;
}
function clickTD(obj) {//土地
    var dkmj = obj.attributes.TDMJ;
    if (!isNaN(parseFloat(dkmj))) dkmj = dkmj.toFixed(2);
    var content = "<p class='fe_Attr mb5'>土地类型：<span>" + getFeatureFieldValue(obj.attributes.TDTYPE) + "</span></p>"
        + "<p class='fe_Attr mb5'>土地面积：<span>" + dkmj + "平方米</span></p>"
    return content;
}
function clickFWSJ(obj) {//房屋数据
    var dkmj = obj.attributes.ZDMJ;
    var upArea = obj.attributes.JZMJ;
    if (!isNaN(parseFloat(dkmj))) dkmj = dkmj.toFixed(2);
    var content = "<p class='fe_Attr mb5'>所属村：<span>" + getFeatureFieldValue(obj.attributes.CMC) + "</span></p>"
        + "<p class='fe_Attr mb5'>所属社区：<span>" + getFeatureFieldValue(obj.attributes.SQMC) + "</span></p>"
        + "<p class='fe_Attr mb5'>门牌号：<span>" + getFeatureFieldValue(obj.attributes.MPH) + "</span></p>"
        + "<p class='fe_Attr mb5'>层数：<span>" + getFeatureFieldValue(obj.attributes.CS) + "</span></p>"
        + "<p class='fe_Attr mb5'>实际层数：<span>" + getFeatureFieldValue(obj.attributes.SJCS) + "</span></p>"
        + "<p class='fe_Attr mb5'>占地面积：<span>" + dkmj + "平方米</span></p>"
        + "<p class='fe_Attr mb5'>建筑面积：<span>" + upArea + "平方米</span></p>"
        + "<p class='fe_Attr mb5'>土地类别：<span>" + getFeatureFieldValue(obj.attributes.TZLX) + "</span></p>"
        + "<p class='fe_Attr mb5'>房屋用途：<span>" + getFeatureFieldValue(obj.attributes.YT) + "</span></p>"
        + "<p class='fe_Attr mb5'>备注：<span>" + getFeatureFieldValue(obj.attributes.BZ) + "</span></p>";
    return content;
}
function getFeatureFieldValue(fv) {
    if (fv == null || fv == undefined) return "";
    return fv;
}
//影像、地图模式
function showImgLayer(node) {
//  var currBgLayer = map.getLayer('bgLayerName');
    $(".legendBox").removeClass().addClass("legendBox hide").fadeOut();
    switch (node) {
        case "影像地图":
            shahebmLayer.setVisibility(true);
            ghzhbmLayer.setVisibility(false);
            tdlyztghbmLayer.setVisibility(false);
            break;
        case "电子地图":
            shahebmLayer.setVisibility(false);
            ghzhbmLayer.setVisibility(true);
            tdlyztghbmLayer.setVisibility(false);
//          _4_3jqbmlayer.setVisibility(false);
//          $(".legendBox").removeClass().addClass("legendBox ghzh").fadeIn();
            break;
        case "qdr":
            shahebmLayer.setVisibility(false);
            ghzhbmLayer.setVisibility(false);
            tdlyztghbmLayer.setVisibility(true);
            break;
    }
    $(".closeImageLegend").click(function(){
    	$(".legendBox").removeClass().addClass("legendBox hide").fadeOut();
    })
}
//搜索结果定位_村
function locateCUN(_id) {
    websocket.send("JsonGetCUNDetailByIDRequest", $.extend(userData, { ONLYID: _id.CID }), function (response) {
        require(["esri/graphic", "esri/geometry/Polygon", "esri/geometry/Extent", "esri/SpatialReference", "esri/InfoTemplate", ]
        , function (Graphic, Polygon, Extent, SpatialReference, InfoTemplate) {
            showdkLayer.clear();
            map.graphics.clear();

            var item = response.data[0];
            var geometry = new Polygon(item.polygon);
            var graphic = new Graphic(geometry, symbol_dk_high);
            graphic.setAttributes(item.cun);
            showdkLayer.add(graphic);
            var extent = geometry.getExtent();
            extent = new Extent(extent.xmin, extent.ymin, extent.xmax, extent.ymax, new SpatialReference({ wkid: 2436 }));
            map.setExtent(extent);
            map.infoWindow.setTitle("<i class='fa fa-fw fa-file'></i>村信息");
            map.infoWindow.setContent(clickCUN(graphic, null));
            map.infoWindow.show(extent.getCenter());
        });
    });
}
//搜索结果定位_社区
function locateSQ(_id) {
    websocket.send("JsonGetSQDetailByIDRequest", $.extend(userData, { ONLYID: _id.SQID }), function (response) {
        require(["esri/graphic", "esri/geometry/Polygon", "esri/geometry/Extent", "esri/SpatialReference"], function (Graphic, Polygon, Extent, SpatialReference) {
            showdkLayer.clear();
            map.graphics.clear();

            var item = response.data[0];
            var geometry = new Polygon(item.polygon);
            var graphic = new Graphic(geometry, symbol_dk_high);
            graphic.setAttributes(item.sq);
            showdkLayer.add(graphic);
            var extent = geometry.getExtent();
            extent = new Extent(extent.xmin, extent.ymin, extent.xmax, extent.ymax, new SpatialReference({ wkid: 2436 }));
            map.setExtent(extent);
            map.infoWindow.setTitle("<i class='fa fa-fw fa-file'></i>社区信息");
            map.infoWindow.setContent(clickSQ(graphic, null));
            map.infoWindow.show(extent.getCenter());
        });
    });
}
//搜索结果定位_房屋
function locateFW(_id) {
    websocket.send("JsonGetFWDetailByMPHRequest", $.extend(userData, { ONLYID: _id.FWID }), function (response) {
        require(["esri/graphic", "esri/geometry/Polygon", "esri/geometry/Extent", "esri/SpatialReference"], function (Graphic, Polygon, Extent, SpatialReference) {
            showdkLayer.clear();
            map.graphics.clear();

            var item = response.data[0];
            var geometry = new Polygon(item.polygon);
            var graphic = new Graphic(geometry, symbol_dk_high);
            graphic.setAttributes(item.fw);
            showdkLayer.add(graphic);
            var extent = geometry.getExtent();
            extent = new Extent(extent.xmin, extent.ymin, extent.xmax, extent.ymax, new SpatialReference({ wkid: 2436 }));
            map.setExtent(extent);
            map.infoWindow.setTitle("<i class='fa fa-fw fa-file'></i>房屋信息");
            map.infoWindow.setContent(clickFWSJ(graphic, null));
            map.infoWindow.show(extent.getCenter());
        });
    });
}
//搜索结果定位_Poi
function locatePOI(_id) {
    websocket.send("JsonGetPOIDetailByIDRequest", $.extend(userData, { ONLYID: _id.ONLYID }), function (response) {
        require(["esri/graphic", "esri/geometry/Point", "esri/SpatialReference", "esri/geometry/Circle", "esri/units", "esri/symbols/PictureMarkerSymbol"]
        , function (Graphic, Point, SpatialReference, Circle, Units, PictureMarkerSymbol) {
            showdkLayer.clear();
            map.graphics.clear();
            var item = response.data[0];
            var point = new Point(item.point.x, item.point.y, new SpatialReference({ wkid: parseInt(item.point.spatialReference.wkid) }));
            var pictureMarkerSymbol = new PictureMarkerSymbol('../Shahe/images/mark.png', 32, 32);
            var circle = new Circle({ center: point, radius: 500, radiusUnit: Units.METERS });
            var graphic = new Graphic(point, pictureMarkerSymbol);
            map.graphics.add(graphic);
            map.setExtent(circle.getExtent());
            map.infoWindow.setTitle("<i class='fa fa-fw fa-file'></i>名称：" + getFeatureFieldValue(item.poi.Name));
            map.infoWindow.setContent("<p class='fe_Attr mb5'>类别：<span>" + getFeatureFieldValue(item.poi.Type) + "</span></p>"
                                    + "<p class='fe_Attr mb5'>地址：<span>" + getFeatureFieldValue(item.poi.Address) + "</span></p>");
            map.infoWindow.show(point);
        });
    });
}
//清除按钮
function clearAllGraphics() {
    showdkLayer.clear();
    map.infoWindow.hide();
    map.graphics.clear();
    __drawToolbar.deactivate();//查询结束后清除事件
}
//全图按钮
function fullScreen() {
    map.setZoom(0);
}
var __drawEvent;
function mapMeasure(type) {
    map.graphics.clear();
    map.infoWindow.hide();
    if (type == 1) {//距离量算
        __drawToolbar.activate(esri.toolbars.Draw.POLYLINE);
        __drawEvent = dojo.connect(__drawToolbar, 'onDrawEnd', areaOrLength);
    } else if (type == 2) {//面积量算
        __drawToolbar.activate(esri.toolbars.Draw.POLYGON);
        if (__drawEvent) dojo.disconnect(__drawEvent);
        __drawEvent = dojo.connect(__drawToolbar, 'onDrawEnd', areaOrLength);
    }   
}
//区域查询
function queryByExtent() {
    __drawToolbar.activate(esri.toolbars.Draw.POLYGON);
    if (__drawEvent) dojo.disconnect(__drawEvent);
    __drawEvent = dojo.connect(__drawToolbar, 'onDrawEnd', function (geometry_search) {
        map.graphics.clear();
        map.infoWindow.hide();var shuxingJson=[];var onlyId='';
        require(["esri/graphic", "esri/geometry/Polygon", "esri/geometry/Extent", "esri/SpatialReference"], function (Graphic, Polygon, Extent, SpatialReference) {
            websocket.send("JsonSearchGBDFWByExtentFilterRequest", $.extend(userData, { extent: geometry_search.getExtent() }), function (response) {
                for (var i = 0; i < response.data.fwlist.length; i++) {
                    var item = response.data.fwlist[i];
//                  if (item.polygon == null) {
//                      continue;
//                  }
                    if (item.polygon.rings.length===0) {
                        continue;
                    }
                    var geometry = new Polygon(item.polygon);
                    //排除不在查询范围的数据
                    var flag = false;
//                  if (geometry.rings.length===0) break;
                    for (var k = 0; k < geometry.rings[0].length; k++) {
                        var ring = geometry.rings[0][k];
                        var point = new esri.geometry.Point(ring[0], ring[1], new esri.SpatialReference({ wkid: 2436 }));
                        if (geometry_search.contains(point)) {
                            flag = true;
                            break;
                        }
                    }
                    if (!flag) continue;
                    
                    var graphic = new Graphic(geometry, symbol_dk_high);
                    graphic.setAttributes(item.fw);
                    shuxingJson.push(item.fw);onlyId+=item.fw.FWID+",";
                    map.graphics.add(graphic);                     
                };
            	websocket.send("JsonStaticGBDFWRequest", $.extend(userData, { ONLYID:onlyId }), function (_json) {
            		var dataId=_json.data;
   					fwSearchInfo(shuxingJson,dataId); 					
	                $(".chartBoxFrame2").removeClass("hide");
	                $(".esriPopup").removeClass('hide');//信息弹框去掉区域查询时添加的hide   
	                $("#clickTj").removeClass('layui-this');//控制区域查询表单显示，默认显示属性表
            		$("#clickSx").addClass('layui-this');
            	})               
            });      
            
        });       
        __drawToolbar.deactivate();//查询结束后清除事件
    });
}

var graphicCenterPoint;

function areaOrLength(geometry) {
    mapClear();
    geometry.spatialReference.wkid = 2436;
    switch (geometry.type) {
        case "point":
            var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 0, 0, 0.05]));
            graphicCenterPoint = geometry;
            break;
        case "polyline":
            var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1);
            //获得每个点的经纬度坐标
            var points = geometry.paths[0];
            var distance, lineLength = 0;
            var result = {};
            var lengths = {};
            for (var i = 0; i < points.length - 1; i++) {
                var x1 = points[i][1];
                var y1 = points[i][0];
                var x2 = points[i + 1][1];
                var y2 = points[i + 1][0];
                distance = getFlatternDistance2(x1, y1, x2, y2);
                lineLength = distance += lineLength;
            }
            lengths['0'] = lineLength;
            result.lengths = lengths;
            outputAreaAndLength(result, geometry);//result获得平面坐标
            break;
        case "polygon":
            var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([255, 255, 0, 0]));
            var points = new Array();
            var result = {};
            var areas = {};
            var rings = geometry.rings[0];
            for (var i = 0; i < rings.length; i++) {
                var x = rings[i][1];
                var y = rings[i][0];
//              var xy = wgs84Tosh(x, y);
//              points.push(xy);
				points.push([x,y]);
            }
            areas['0'] = polygonArea(points);
            result.areas = areas;
            outputAreaAndLength(result, geometry);
            break;
    }
    var graphic = new esri.Graphic(geometry, symbol);
    map.graphics.clear();
    map.graphics.add(graphic);
    __drawToolbar.deactivate();
    dojo.disconnect(__drawEvent);
    __drawEvent = null;
}
function mapClear() {
    map.graphics.clear();
    map.infoWindow.hide();
}
//平面坐标
function getFlatternDistance2(lat1, lng1, lat2, lng2) {
    return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
}
function getFlatternDistance(lat1, lng1, lat2, lng2) {
    var f = getRad((lat1 + lat2) / 2);
    var g = getRad((lat1 - lat2) / 2);
    var l = getRad((lng1 - lng2) / 2);

    var sg = Math.sin(g);
    var sl = Math.sin(l);
    var sf = Math.sin(f);

    var s, c, w, r, d, h1, h2;
    var a = EARTH_RADIUS;
    var fl = 1 / 298.257;

    sg = sg * sg;
    sl = sl * sl;
    sf = sf * sf;

    s = sg * (1 - sl) + (1 - sf) * sl;
    c = (1 - sg) * (1 - sl) + sf * sl;

    w = Math.atan(Math.sqrt(s / c));
    r = Math.sqrt(s * c) / w;
    d = 2 * w * a;
    h1 = (3 * r - 1) / 2 / c;
    h2 = (3 * r + 1) / 2 / s;

    var length = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
    return length;
}
//长度计算
var EARTH_RADIUS = 6378137.84;
var PI = Math.PI;
function getRad(d) {
    return d * PI / 180.0;
}
//平面多边形面积
function polygonArea(points) {
    var i, j;
    var area = 0;
    for (i = 0; i < points.length; i++) {
        j = (i + 1) % points.length;
        area += points[i][0] * points[j][1];
        area -= points[i][1] * points[j][0];
    }
    area /= 2;
    var mianji = Math.abs(area);
    return mianji;
}

//北京经纬度转换为大地坐标
function wgs84Tosh(lat, lon) {
    var xx, yy, r2d, tolat, tolon, rearth, PI;
    PI = 3.141592653589793;
    r2d = 57.2957795131;
    tolat = (39.93 + (14.0 + 7.55996 / 60.0) / 60.0) / r2d;
    tolon = (116.42 + (28.0 + 1.80651 / 60.0) / 60) / r2d;
    rearth = 6378137.84;
    var hor, frlat, frlon, gcdist, clatf, clatt, slatf, slatt, gcbrg;
    var dlon, cdlon, sdlon, sdist, cdist, sbrg, cbrg, temp;
    var intlat, intlon;
    intlat = lat;
    intlon = lon;
    frlat = lat / r2d;
    frlon = lon / r2d;
    clatt = Math.cos(frlat);
    clatf = Math.cos(tolat);
    slatt = Math.sin(frlat);
    slatf = Math.sin(tolat);
    dlon = frlon - tolon;
    cdlon = Math.cos(dlon);
    sdlon = Math.sin(dlon);
    cdist = slatf * slatt + clatf * clatt * cdlon;
    temp = (clatt * sdlon) * (clatt * sdlon) + (clatf * slatt - slatf * clatt * cdlon) * (clatf * slatt - slatf * clatt * cdlon);
    sdist = Math.sqrt(Math.abs(temp));
    if ((Math.abs(sdist) > 1e-7) || (Math.abs(cdist) > 1e-7))
        gcdist = Math.atan2(sdist, cdist);
    else
        gcdist = 0;
    sbrg = sdlon * clatt;
    cbrg = (clatf * slatt - slatf * clatt * cdlon);
    if ((Math.abs(sbrg) > 1e-7) || (Math.abs(cbrg) > 1e-7)) {
        temp = Math.atan2(sbrg, cbrg);
        while (temp < 0) {
            temp = temp + 2 * PI;
            gcbrg = temp;
        }
    } else
        gcbrg = 0;
    hor = gcdist * rearth;
    xx = hor * Math.sin(temp);
    yy = hor * Math.cos(temp);
    point = [xx, yy];
    return point;
}
function outputAreaAndLength(result, geo) {
    var point = geo.getExtent().getCenter();
    map.infoWindow.resize(165, 80);
    var txt = "";
    if (result.areas != null) {
        var num = result.areas[0].toFixed(2);
        var info = num + "平方米";
        if (num > 999999) {
            info = (num / 1000000).toFixed(2) + "平方千米";
            if (num / 1000000 > 999)
                info = (num / 1000000 / 10000).toFixed(2) + "万平方千米";
        }
        map.infoWindow.setTitle("面积测算");
        map.infoWindow.setContent("面积：" + info);
        map.infoWindow.show(point);
    } else {
        var num = result.lengths[0].toFixed(2);
        var info = num + "米";
        if (num > 999) {
            info = (num / 1000).toFixed(2) + "千米";
            if (num / 1000 > 999)
                info = (num / 1000 / 10000).toFixed(2) + "万千米";
        }
        map.infoWindow.setTitle("长度测算");
        map.infoWindow.setContent("距离：" + info);
        map.infoWindow.show(point);
    }
    $(".esriPopup").removeClass('hide');
}
//是否显示村图层
function setDkLayerVisible(isShow) {
    cunlayer.setVisibility(isShow);
    dkTxtLayer.setVisibility(isShow);//村文字图层显示
    var dataList = CallbackForLegend();
    legendInfo.setData(dataList);
    legendInfo.show();
}
//是否显示社区图层
function setFwLayerVisible(isShow) {
    sqlayer.setVisibility(isShow);
    sqTxtLayer.setVisibility(isShow);//社区文字图层
    var dataList = CallbackForLegend();
    legendInfo.setData(dataList);
    legendInfo.show();
}
/*是否显示‘地块’、‘房屋’图层*/
function setFwLayerVisible2(isShow) {//国有土地
    fwlayerGytd.setVisibility(isShow);
    var dataList = CallbackForLegend();
    legendInfo.setData(dataList);
    legendInfo.show();
}
function setFwLayerVisibleJttd(isShow) {//集体土地
    fwlayerJttd.setVisibility(isShow);
    var dataList = CallbackForLegend();
    legendInfo.setData(dataList);
    legendInfo.show();
}
function setFwLayerVisibleFwsj(isShow) {//房屋数据
    fwlayerFwsj.setVisibility(isShow);
    var dataList = CallbackForLegend();
    legendInfo.setData(dataList);
    legendInfo.show();
}
//---房屋数据筛选
function setFwLayerVisibleFwsx(fwsx,isShow) {//房屋数据筛选
    fwlayerFwsj.setVisibility(false);
    fwsx.setVisibility(isShow);
    var dataList = CallbackForLegend();
    legendInfo.setData(dataList);
    legendInfo.show();
}
/*是否显示‘地块’、‘房屋’图层*/
//地块专题图渲染
function renderDKLayerShow(content) {
    var ly = ztt[content];
    cunlayer.setRenderer(renderer[content]);
    cunlayer.show();//--下方是图例绘制代码
    dklegendsetting.length = 0;
    var render = renderer[content];
    if (content != '村名称') {
        for (var index = 0; index < render.infos.length; index++) {
            var info = render.infos[index];
            var color = info.symbol.color;
            var oClolor = info.symbol.outline.color;
            var border = "solid " + Math.round(info.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
//          var border = "solid " + Math.round(info.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
            dklegendsetting.push({ color: [color.r, color.g, color.b, color.a], name: '（村界）' + info.label, border: border });
        }
        if (render.defaultSymbol != null) {
            var color = render.defaultSymbol.color;
            var oClolor = render.defaultSymbol.outline.color;
            var border = "solid " + Math.round(info.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
//          var border = "solid " + Math.round(info.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
            dklegendsetting.push({ color: [color.r, color.g, color.b, color.a], name: '（村界）' + render.defaultLabel, border: border });
        }
    }
    else if (render.symbol != null) {
        var color = render.symbol.color;
        var oClolor = render.symbol.outline.color;
        var border = "solid " + Math.round(render.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
        dklegendsetting.push({ color: [color.r, color.g, color.b, color.a], name: '村界', border: border });
    }
    var dataList = CallbackForLegend();
    legendInfo.setData(dataList);
    legendInfo.show();
}
//房屋专题图渲染
function renderFWLayerShow(content) {
    var ly = ztt[content];
    if (ly.minScale > 0) sqlayer.minScale = ly.minScale;
    if (ly.maxScale > 0) sqlayer.maxScale = ly.maxScale;
    sqlayer.setRenderer(renderer[content]);
    sqlayer.redraw();
    fwlegendsetting.length = 0;
    var render = renderer[content];
    if (content != '社区界') {
        for (var index = 0; index < render.infos.length; index++) {
            var info = render.infos[index];
            var color = info.symbol.color;
            var oClolor = info.symbol.outline.color;
            var border = "solid " + Math.round(info.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
            fwlegendsetting.push({ color: [color.r, color.g, color.b, color.a], name: '（社区界）' + info.label, border: border });
        }
        if (render.defaultSymbol != null) {
            var color = render.defaultSymbol.color;
            var oClolor = render.defaultSymbol.outline.color;
//          var border = "solid " + Math.round(info.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
            var border = "solid " + Math.round(info.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
            fwlegendsetting.push({ color: [color.r, color.g, color.b, color.a], name: '（社区界）' + render.defaultLabel, border: border });
        }
    }
    else if (render.symbol != null) {
        var color = render.symbol.color;
        var oClolor = render.symbol.outline.color;
        var border = "solid " + Math.round(render.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
        fwlegendsetting.push({ color: [color.r, color.g, color.b, color.a], name: '社区界', border: border });
    }
    var dataList = CallbackForLegend();
    legendInfo.setData(dataList);
    legendInfo.show();
}
//---
function renderFWLayerShow2(content) {//国有土地
    var ly = ztt[content];
    if (ly.minScale > 0) fwlayerGytd.minScale = ly.minScale;
    if (ly.maxScale > 0) fwlayerGytd.maxScale = ly.maxScale;
    fwlayerGytd.setRenderer(renderer[content]);
    fwlayerGytd.redraw();
    fwlegendsetting2.length = 0;
    var render = renderer[content];
    if (content != '国有界线') {
        for (var index = 0; index < render.infos.length; index++) {
            var info = render.infos[index];
            var color = info.symbol.color;
            var oClolor = info.symbol.outline.color;
            var border = "solid " + Math.round(info.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
            fwlegendsetting2.push({ color: [color.r, color.g, color.b, color.a], name: '（国有土地）' + info.label, border: border });
        }
        if (render.defaultSymbol != null) {
            var color = render.defaultSymbol.color;
            var oClolor = render.defaultSymbol.outline.color;      
            var border = "solid " + Math.round(info.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
            fwlegendsetting2.push({ color: [color.r, color.g, color.b, color.a], name: '（国有土地）' + render.defaultLabel, border: border });
        }
    }
    else if (render.symbol != null) {
        var color = render.symbol.outline.color;
        var oClolor = render.symbol.outline.color;
        var border = "solid " + Math.round(render.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
        fwlegendsetting2.push({ color: [color.r, color.g, color.b, color.a], name: '国有土地', border: border });
    }
    var dataList = CallbackForLegend();
    legendInfo.setData(dataList);
    legendInfo.show();
}
function renderFWLayerShowJttd(content) {//集体土地
    var ly = ztt[content];
    if (ly.minScale > 0) fwlayerGytd.minScale = ly.minScale;
    if (ly.maxScale > 0) fwlayerGytd.maxScale = ly.maxScale;
    fwlayerJttd.setRenderer(renderer[content]);
    fwlayerJttd.redraw();
    fwlegendsettingJttd.length = 0;
    var render = renderer[content];
    if (content != '集体界线') {
        for (var index = 0; index < render.infos.length; index++) {
            var info = render.infos[index];
            var color = info.symbol.color;
            var oClolor = info.symbol.outline.color;
            var border = "solid " + Math.round(info.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
            fwlegendsettingJttd.push({ color: [color.r, color.g, color.b, color.a], name: '（集体土地）' + info.label, border: border });
        }
        if (render.defaultSymbol != null) {
            var color = render.defaultSymbol.color;
            var oClolor = render.defaultSymbol.outline.color;
            var border = "solid " + Math.round(info.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
            fwlegendsettingJttd.push({ color: [color.r, color.g, color.b, color.a], name: '（集体土地）' + render.defaultLabel, border: border });
        }
    }
    else if (render.symbol != null) {
        var color = render.symbol.color;
        var oClolor = render.symbol.outline.color;
        var border = "solid " + Math.round(render.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
        fwlegendsettingJttd.push({ color: [color.r, color.g, color.b, color.a], name: '集体土地', border: border });
    }
    var dataList = CallbackForLegend();
    legendInfo.setData(dataList);
    legendInfo.show();
}
function renderFWLayerShowFwsj(content) {//房屋数据
	var ly = ztt[content];
    fwlayerFwsj.setRenderer(renderer[content]);
    fwlayerFwsj.show();//--下方是图例绘制代码
    fwlegendsettingFwsj.length = 0;
    var ly = ztt[content];
    if (ly.minScale > 0) fwlayerGytd.minScale = ly.minScale;
    if (ly.maxScale > 0) fwlayerGytd.maxScale = ly.maxScale;
    fwlayerFwsj.setRenderer(renderer[content]);
    fwlayerFwsj.redraw();
    fwlegendsettingFwsj.length = 0;
    var render = renderer[content];
    if (content == '房屋数据') {
        for (var index = 0; index < render.infos.length; index++) {
            var info = render.infos[index];
            var color = info.symbol.color;
            var oClolor = info.symbol.outline.color;
            var border = "solid " + Math.round(info.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
            fwlegendsettingFwsj.push({ color: [color.r, color.g, color.b, color.a], name: '（房屋）' + info.label, border: border });
        }
        if (render.defaultSymbol != null) {
            var color = render.defaultSymbol.color;
            var oClolor = render.defaultSymbol.outline.color;
            var border = "solid " + Math.round(info.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
            fwlegendsettingFwsj.push({ color: [color.r, color.g, color.b, color.a], name: '（房屋）其它' , border: border });
        }
    }
    else if (render.symbol != null) {
        var color = render.symbol.color;
        var oClolor = render.symbol.outline.color;
        var border = "solid " + Math.round(render.symbol.outline.width, 1) + "px rgba(" + oClolor.r + ", " + oClolor.g + ", " + oClolor.b + "," + oClolor.a + ")";
        fwlegendsettingFwsj.push({ color: [color.r, color.g, color.b, color.a], name: '房屋', border: border });
    }
    var dataList = CallbackForLegend();
    legendInfo.setData(dataList);
    legendInfo.show();
}
//数据统计
function BtnF_0() {//详情说明
		$('.tbChart').html('<div id="xqsm"  style="height: 350px;"></div>');	 
		websocket.send("JsonGetFWStatisticsRequest_OneText", $.extend(userData, {}), function (_json) {
			var smData=_json.data;
            $("#xqsm").html(smData);
       });
    };
function BtnF_1() {//类型统计
		$('.tbChart').html('<table class="layui-table" id="tab_4"></table>');
		websocket.send("JsonGetFWStatisticsRequest_2", $.extend(userData, {}), function (_json) {
            layui.use('table', function () {
                var table = layui.table;
                table.render({
                    elem: '#tab_4',
                    data: _json.data,
                    size: 'sm', //小尺寸的表格
//                  totalRow:true,
                    limit:8,
                    page:true,
                    cols: [
                            [
                             { field: 'col1', rowspan: "3", "title": "用途", minWidth: 100, align: "center" },
                             { colspan: 2, "title": "国有", align: "center" },
                             { colspan: 2, "title": "集体", align: "center" }
                            ],
                            [
                            { field: 'col2', title: "占地面积(平方米)", colspan: 1, minWidth: 140, align: "center" },
                            { field: 'col3', title: "建筑面积(平方米)", colspan: 1, minWidth: 140, align: "center" },
                            { field: 'col4', title: "占地面积(平方米)", colspan: 1, minWidth: 140, align: "center" },
                            { field: 'col5', title: "建筑面积(平方米)", colspan: 1, minWidth: 140, align: "center" },
                            ]
                          ]
                });
            });
       });
    };
function BtnF_2() {//各社区
	$('.tbChart').html('<table class="layui-table" id="tab_4"></table>');
        websocket.send("JsonGetFWStatisticsRequest_5", $.extend({ safeLevel: 1, page: 1, pageSize: 6, keyword: "" }, userData, {}), function (_json) {
            layui.use('table', function () {
                var table = layui.table;
                table.render({
                    elem: '#tab_4',
                    data: _json.data,
                    size: 'sm', //小尺寸的表格
                    limit:8,
                    page:true,
                    cols: [
                            [
                             { field: 'col1', rowspan: "3", "title": "社区名称", minWidth: 100 , align: "center" },
                             { colspan: 4, "title": "办公", align: "center" },
                             { colspan: 4, "title": "仓储", align: "center" },
                             { colspan: 4, "title": "工业", align: "center" },
                             { colspan: 4, "title": "交通", align: "center" },
                             { colspan: 4, "title": "教育", align: "center" },
                             { colspan: 4, "title": "金融", align: "center" },
                             { colspan: 4, "title": "科研", align: "center" },
                             { colspan: 4, "title": "其他", align: "center" },
                             { colspan: 4, "title": "商业", align: "center" },
                             { colspan: 4, "title": "体育", align: "center" },
                             { colspan: 4, "title": "文化", align: "center" },
                             { colspan: 4, "title": "信息", align: "center" },
                             { colspan: 4, "title": "医疗卫生", align: "center" },
                             { colspan: 4, "title": "娱乐", align: "center" },
                             { colspan: 4, "title": "园林绿化", align: "center" },
                             { colspan: 4, "title": "住宅", align: "center" },
                             { colspan: 4, "title": "不详", align: "center" },
                            ],
                            [
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" }
                            ],
                            [
                            { field: 'col2', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col3', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col36', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col37', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col4', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col5', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col38', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col39', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col6', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col7', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col40', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col41', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col8', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col9', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col42', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col43', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col10', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col11', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col44', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col45', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col12', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col13', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col46', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col47', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col14', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col15', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col48', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col49', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col16', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col17', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col50', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col51', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col18', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col19', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col52', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col53', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col20', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col21', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col54', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col55', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col22', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col23', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col56', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col57', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col24', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col25', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col58', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col59', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col26', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col27', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col60', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col61', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col28', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col29', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col62', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col63', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col30', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col31', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col64', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col65', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col32', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col33', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col66', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col67', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col34', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col35', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col68', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col69', title: "建筑面积(平方米)", minWidth: 140, align: "center" }
                            ]
                          ]
                });
            });
        });
    }
    function BtnF_3() {//村明细
    	$('.tbChart').html('<table class="layui-table" id="tab_4"></table>');
        websocket.send("JsonGetFWStatisticsRequest_3", $.extend(userData, {}), function (_json) {
            layui.use('table', function () {
                var table = layui.table;
                table.render({
                    elem: '#tab_4',
                    data: _json.data,
                    size: 'sm', //小尺寸的表格
//                  totalRow:true,
                    limit:40,
                    cols: [
                            [
                             { field: 'col1', rowspan: "3", "title": "村名称", minWidth: 100 , align: "center"},
                             { colspan: 4, "title": "办公", align: "center" },
                             { colspan: 4, "title": "仓储", align: "center" },
                             { colspan: 4, "title": "工业", align: "center" },
                             { colspan: 4, "title": "交通", align: "center" },
                             { colspan: 4, "title": "教育", align: "center" },
                             { colspan: 4, "title": "金融", align: "center" },
                             { colspan: 4, "title": "科研", align: "center" },
                             { colspan: 4, "title": "其他", align: "center" },
                             { colspan: 4, "title": "商业", align: "center" },
                             { colspan: 4, "title": "体育", align: "center" },
                             { colspan: 4, "title": "文化", align: "center" },
                             { colspan: 4, "title": "信息", align: "center" },
                             { colspan: 4, "title": "医疗卫生", align: "center" },
                             { colspan: 4, "title": "娱乐", align: "center" },
                             { colspan: 4, "title": "园林绿化", align: "center" },
                             { colspan: 4, "title": "住宅", align: "center" },
                             { colspan: 4, "title": "不详", align: "center" },
                            ],
                            [
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" },
                            { title: "国有", colspan: 2, minWidth: 100, align: "center" },
                            { title: "集体", colspan: 2, minWidth: 100, align: "center" }
                            ],
                            [
                            { field: 'col2', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col3', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col4', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col5', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col6', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col7', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col8', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col9', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col10', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col11', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col12', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col13', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col14', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col15', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col16', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col17', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col18', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col19', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col20', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col21', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col22', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col23', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col24', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col25', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col26', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col27', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col28', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col29', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col30', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col31', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col32', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col33', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col34', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col35', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col36', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col37', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col38', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col39', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col40', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col41', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col42', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col43', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col44', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col45', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col46', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col47', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col48', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col49', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col50', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col51', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col52', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col53', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col54', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col55', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col56', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col57', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col58', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col59', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col60', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col61', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col62', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col63', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col64', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col65', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col66', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col67', title: "建筑面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col68', title: "占地面积(平方米)", minWidth: 140, align: "center" },
                            { field: 'col69', title: "建筑面积(平方米)", minWidth: 140, align: "center" }
                            ]
                          ]
                });
            });
        });
    };
 //图标select选项加载
    function initSelectDefuatMessage() {
        websocket.send("JsonGetFWStatisticsRequest_init", $.extend(userData, {}), function (_json) {
            var html1 = "<option>村名称</option>", html2 = "<option>社区名称</option>";
            for (var i = 0; i < _json.data[0].length; i++) {
                html1 += "<option>" + _json.data[0][i].CMC + "</option>";
            }
            for (var i = 0; i < _json.data[1].length; i++) {
            	if(_json.data[3][i].SQMC==null)continue;
                html2 += "<option>" + _json.data[3][i].SQMC + "</option>";
            }
            $("#village").html(html1);//村下拉
            $("#Community").html(html2);//社区下拉
        });
    };
//饼图展示
	 function Btn_Pie() {
	 	$('.tbChart').html('<div id="pie"  style="height: 400px;"></div>');	 	
	 	var villageVal=$("#village option:selected").val();
	 	var CommunityVal=$("#Community option:selected").val();
	 	villageVal=villageVal=="村名称"?"":villageVal;
	 	CommunityVal=CommunityVal=="社区名称"?"":CommunityVal;
         websocket.send("JsonGetFWStatisticsRequest_pie", $.extend(userData, { CMC: villageVal, SQMC: CommunityVal}), function (_json) {
            var dom = document.getElementById("pie");
            var myChart = echarts.init(dom);
            var app = {};
            option = null;
            option = {
                title: {
                    text: '',
                    subtext: '',
                    x: 'center'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    data: ["国有占地面积", "国有建筑面积", "集体占地面积", "集体建筑面积"]
                },
                series: [
        {
            name: '面积',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [{ value: _json.data.GYZD, name: "国有占地面积" }, { value: _json.data.GYJZ, name: "国有建筑面积" }, { value: _json.data.JTZD, name: "集体占地面积" }, { value: _json.data.JTJZ, name: "集体建筑面积"}],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
            };


            if (option && typeof option === "object") {
                myChart.setOption(option, true);
            }
        });
   };
//柱状图展示
	 function Btn_Bar() {
	 	$('.tbChart').html('<div id="bar"  style="height: 400px;"></div>');
	 	var villageVal=$("#village option:selected").val();
	 	var CommunityVal=$("#Community option:selected").val();
	 	villageVal=villageVal=="村名称"?"":villageVal;
	 	CommunityVal=CommunityVal=="社区名称"?"":CommunityVal;
        websocket.send("JsonGetFWStatisticsRequest_bar", $.extend(userData, { CMC: villageVal, SQMC: CommunityVal }), function (_json) {
            var ArrayData = new Array();
            for (var i = 0; i < _json.data.length; i++) {
                var obj = { product: _json.data[i].YT, '国有建筑面积': _json.data[i].GYJZ, '国有占地面积': _json.data[i].GYZD, '集体建筑面积': _json.data[i].JTJZ, '集体占地面积': _json.data[i].JTZD }
                ArrayData.push(obj);
            }
            var dom = document.getElementById("bar");
            var myChart = echarts.init(dom);
            var app = {};
            option = null;
            option = {
                legend: {},
                tooltip: {},
                dataset: {
                    dimensions: ['product', '国有建筑面积', '国有占地面积', '集体建筑面积', '集体占地面积'],
                    source: ArrayData
                },
                xAxis: { type: 'category',
                axisLabel :{
		               interval:0
		            }
                },
                yAxis: { type: 'value',
                    axisLabel: {
                        formatter: '{value} 万平方米'
                    }
                },
                // Declare several bar series, each will be mapped
                // to a column of dataset.source by default.
                series: [
			        { type: 'bar' },
			        { type: 'bar' },
			        { type: 'bar' },
			        { type: 'bar' }
			    ],
			    grid: {
			    	x:140
              	}
            };
            if (option && typeof option === "object") {
                myChart.setOption(option, true);
            }

        });
    };
    //房屋区域查询信息
    function fwSearchInfo(shuxingJson,dataId){
    	$(".chartBoxClose2").click(function(){$(".chartBoxFrame2").addClass("hide");});
    	$("#clickSx").click(function(){
			$('.sxtj .layui-form:first-of-type').removeClass('hide');
			$('.sxtj .layui-form:nth-of-type(2)').addClass('hide');
    	});
    	$("#clickTj").click(function(){
			$('.sxtj .layui-form:first-of-type').addClass('hide');
			$('.sxtj .layui-form:nth-of-type(2)').removeClass('hide');
    	})
    	layui.use('table', function () {//属性表
            var table = layui.table;
            table.render({
                elem: '#shuxing',
                data: shuxingJson,
                page: true, //开启分页
                size: 'sm', //小尺寸的表格
                cols: [
                        [
                         { field: 'CMC', title: "所属村", minWidth: 100, align: "center",rowspan: 1 },
                         { field: 'SQMC', title: "所属社区", minWidth: 100, align: "center",rowspan: 1 },
                         { field: 'MPH', title: "门牌号", minWidth: 100, align: "center",rowspan: 1 },
                         { field: 'CS', title: "层数", minWidth: 100, align: "center",rowspan: 1 },
                         { field: 'TZLX', title: "土地类型", minWidth: 100, align: "center",rowspan: 1 },
                         { field: 'YT', title: "类型", minWidth: 100, align: "center",rowspan: 1 },
                         { field: 'JZMJ', title: "建筑面积", minWidth: 100, align: "center",rowspan: 1 },
                         { field: 'ZDMJ', title: "占地面积", minWidth: 100, align: "center",rowspan: 1 },
						 { field: 'BZ', title: "备注", minWidth: 100, align: "center",rowspan: 1 }
                        ]
					]
            });
        });
        layui.use('table', function () {//统计表
            var table = layui.table;
            table.render({
                elem: '#tongji',
                data: dataId,
                page: true, //开启分页
                size: 'sm', //小尺寸的表格
                totalRow: true,
                cols: [
                        [
                             {field: 'tdtype', rowspan: 2, "title": "类型", minWidth: 100, align: "center",totalRowText: '总面积'},
                             { colspan: 2, "title": "国有", align: "center" },
                             { colspan: 2, "title": "集体", align: "center" },
                             { field: 'total',rowspan: 2, "title": "总面积",minWidth: 100,totalRow: true }
                        ],
                        [                      
                            { field: 'gyjzmj', title: "建筑面积", minWidth: 100, align: "center" ,totalRow: true},
                            {  field: 'gyzdmj',title: "占地面积", minWidth: 100, align: "center" ,totalRow: true},
                            { field: 'jtjzmj', title: "建筑面积", minWidth: 100, align: "center" ,totalRow: true},
                            { field: 'jtzdmj', title: "占地面积", minWidth: 100, align: "center" ,totalRow: true},
                        ]
					]
            });
        });
        $('.sxtj .layui-form:nth-of-type(2)').addClass('hide');
        $('.chartBoxFrame2 .chartBoxMain').on({//信息窗口拖拽
			mousedown: function(e){
			                var el=$(this);
			                var os = el.offset(); dx = e.pageX-os.left, dy = e.pageY-os.top;
			                $(document).on('mousemove.drag', function(e){ el.offset({top: e.pageY-dy, left: e.pageX-dx}); });
			            },
			mouseup: function(e){ $(document).off('mousemove.drag');}
	    })
    }
	//房屋/用途筛选表单
    function fwYtInfo(fwdata1,fwdata2,fwdata){   	
    	$(".chartBoxClose3").click(function(){$(".chartBoxFrame3").addClass("hide");});
    	$("#clickfw1").click(function(){
			$('.sxtjFw .layui-form:first-of-type').removeClass('hide');
			$('.sxtjFw .layui-form:nth-of-type(2)').addClass('hide');
    	});
    	$("#clickfw2").click(function(){
			$('.sxtjFw .layui-form:first-of-type').addClass('hide');
			$('.sxtjFw .layui-form:nth-of-type(2)').removeClass('hide');
    	})
    	layui.use('table', function (header) {//统计表用途
            var table = layui.table;
            var colsListsTb=new Array(),colsListsTh=new Array();
            let colslistX=fwdata1[0];
            let fwdataArr=fwdata.split(',');
            colsListsTh=[{ field:"用途",rowspan: 2, title: "用途", minWidth: 100, align: "center"}]
            for( let x in fwdataArr){
        		colsListsTh.push({title:fwdataArr[x], align:'center', minWidth: 100,colspan: 2});
        	}
            colsListsTh.push({ field:"总计",rowspan: 1, title: "总计", minWidth: 100, align: "center",colspan: 2})
        	for( let x in colslistX){
        		if(x!=="用途" && x!=="总计"){colsListsTb.push({field:x, title:x, align:'center', minWidth: 100});}
        	}				
            table.render({
                elem: '#fwyt1',
                data: fwdata1,
//              page: true, //开启分页
                size: 'sm', //小尺寸的表格
                limit:40,
                cols: [
                        colsListsTh,
                        colsListsTb
                        
					]
            });
        });
        layui.use('table', function () {//统计表地块
            var table = layui.table;
            var colsListsTb=new Array(),colsListsTh=new Array();
            let colslistX=fwdata2[0];
            let fwdataArr=fwdata.split(',');
            colsListsTh=[{ field:"地类名称",rowspan: 2, title: "地类名称", minWidth: 100, align: "center"}]
        	for( let x in fwdataArr){
        		colsListsTh.push({title:fwdataArr[x], align:'center', minWidth: 100,colspan: 2});
        	}
        	colsListsTh.push({ field:"总计",rowspan: 1, title: "总计", minWidth: 100, align: "center",colspan: 2})
        	for( let x in colslistX){
        		if(x!=="地类名称" && x!=="总计"){colsListsTb.push({field:x, title:x, align:'center', minWidth: 100});}
        	}
            table.render({
                elem: '#fwyt2',
                data: fwdata2,
//              page: true, //开启分页
                size: 'sm', //小尺寸的表格
                limit:40,
                cols: [
                        colsListsTh,
                        colsListsTb
					]
            });
        });
        $('.sxtjFw .layui-form:nth-of-type(2)').addClass('hide');
        $('.chartBoxFrame3 .chartBoxMain').on({//信息窗口拖拽
			mousedown: function(e){
			                var el=$(this);
			                var os = el.offset(); dx = e.pageX-os.left, dy = e.pageY-os.top;
			                $(document).on('mousemove.drag', function(e){ el.offset({top: e.pageY-dy, left: e.pageX-dx}); });
			            },
			mouseup: function(e){ $(document).off('mousemove.drag');}
	    })

    }
    function fwYtInfo2(ytData){   	
    	$(".chartBoxClose4").click(function(){$(".chartBoxFrame4").addClass("hide");});    	
    	layui.use('table', function () {
            var table = layui.table;
            table.render({
                elem: '#fwyt3',
                data: ytData,
//              page: true, //开启分页
                size: 'sm', //小尺寸的表格
                limit:30,
                cols: [
                        [
                         { field: 'DLMC', title: "地块名称", minWidth: 100, align: "center",rowspan: 1 },
                         { field: 'ZDMJ', title: "占地面积", minWidth: 100, align: "center",rowspan: 1 }
                        ]
					]
            });
       });
//      $('.sxtjYt .layui-form:nth-of-type(2)').addClass('hide');debugger        
        $('.chartBoxFrame4 .chartBoxMain').on({//信息窗口拖拽
			mousedown: function(e){
			                var el=$(this);
			                var os = el.offset(); dx = e.pageX-os.left, dy = e.pageY-os.top;
			                $(document).on('mousemove.drag', function(e){ el.offset({top: e.pageY-dy, left: e.pageX-dx}); });
			            },
			mouseup: function(e){ $(document).off('mousemove.drag');}
	    })

    }
