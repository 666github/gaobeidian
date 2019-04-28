var websocket, userData = {};
var webSearchBox = null, webSearchResult = null, topMenuBar = null
    , rightMenuBar = null, chartBox = null, topBarTool = null
    , houseMessageWindow = null, kjwindow = null, xgwindow = null
    , bottomMenuBox = null;
var legendInfo = null;
function initWebPage() {
    (function ($) {
        $.each(['show', 'hide'], function (i, val) {
            var _org = $.fn[val];
            $.fn[val] = function () {
                this.trigger(val);
                return _org.apply(this, arguments);
            };
        });
    })(jQuery);

    Agreement.getWebsocket(function () {
        document.documentElement.className = document.documentElement.className + " HtmlGif";
    }, function (_userdata) {
        if (typeof (initWebPageBefore) === "function") { initWebPageBefore(this); } //扩展方法
        document.documentElement.className = String(document.documentElement.className).replace(/HtmlGif/g, "");
        userData = _userdata;
        //this指向websocket；_userdata指向用户信息{username,password,usertoken}
        websocket = this; //接下来的websocket就用它
        initWebData();
        if (typeof (initWebPageAfter) === "function") { initWebPageAfter(this); }
        topBarTool = new TopBarTool();
        chartBox = new ChartBox();
        websocket.send('JsonGetUnderspaceAllUseageOptions', $.extend({}, userData), function (response) {
            if (response.status == 'success') {
                usetypes = response.data;
            }
        });

        websocket.send('JsonGetUnderSpaceAllSteetsRequest', $.extend({}, userData), function (response) {
            if (response.status == 'success') {
                allstreets = response.data;
                var options = '';
                for (var i = 0; i < allstreets.length; i++) {
                    options += '<option>' + allstreets[i].STREETNAME + '</option>';
                }
                $('#STREET_NAME').html(options);
            }
        });

        websocket.send('JsonGetUserDataRequest', $.extend({}, userData), function (response) {
            if (response.status == 'success') {
                user = response.data;
            }
        });
    });
}
$(initWebPage);
//初始化
function initWebData() {
    //全局搜索
    webSearchBox = new WebSearchBox();
    webSearchResult = new WebSearchResult();
    //顶部对象
    topMenuBar = new TopMenuBar();
    //底部对象
    bottomMenuBox = new BottomMenuBox();
    //右部导航
    rightMenuBar = new RightMenuBar();
    //图例对象
    legendInfo = new LegendInfo();
    //初始化图例
    $(".legendBtn").bind("click", function () {
        if (typeof (CallbackForLegend) === "function") {
            var dataList = CallbackForLegend();
            legendInfo.setData(dataList);
            legendInfo.show();
        }
    });
    //切换效果
    $("#onoffswitch_dk").bind("change", function () {
        if (typeof (setDkLayerVisible) === "function") { setDkLayerVisible($(this).is(":checked")); }
    });
    $("#onoffswitch_fw").bind("change", function () {
        if (typeof (setFwLayerVisible) === "function") { setFwLayerVisible($(this).is(":checked")); }
    });
    //---图层控制
    var nodeLc=this.nodeLc=$(".layerControl");
    nodeLc.find("input[type='checkbox']").bind("change",function(){//---图层树控制
    	var othis=$(this);
    	var thisData=othis.attr("data");
    	var input3=$("input[data='3']"),input4=$("input[data='4']"),input5=$("input[data='5']"),
    	input6=$("input[data='6']"),input8=$("input[data='8']")
		switch (thisData){
    		case "1":
    			if (typeof (setDkLayerVisible) === "function") { 
    				setDkLayerVisible($(this).is(":checked"));
    			}
    			break;
			case "2":
			if (typeof (setFwLayerVisible) === "function") {
				setFwLayerVisible($(this).is(":checked"));
			}
			break;
			case "3": 			
			if(othis.is(":checked")){
				input4.prop('checked', true);
				input5.prop('checked', true);
			}else{
				input4.removeProp('checked');
				input5.removeProp('checked');
			}  
//			if (typeof (setFwLayerVisible2) === "function") {
				setFwLayerVisible2($(this).is(":checked")); 
				setFwLayerVisibleJttd($(this).is(":checked"));
//			}
			break;
			case "4":
			if (typeof (setFwLayerVisible2) === "function") { setFwLayerVisible2($(this).is(":checked")); }
//			if (typeof (setFwLayerVisible) === "function") { setDkLayerVisible2(dklayer2,dkTxtLayer2,$(this).is(":checked")); }
			break;
			case "5":
			if (typeof (setFwLayerVisibleJttd) === "function") { setFwLayerVisibleJttd($(this).is(":checked"));}
			break;
    		case "6":
			if (typeof (setFwLayerVisibleFwsj) === "function") {
				setFwLayerVisibleFwsj($(this).is(":checked"));
			}
			break;
			case "8":
			if (typeof (setFwLayerVisibleDlfb) === "function") {
				setFwLayerVisibleDlfb($(this).is(":checked"));
			}
			break;
    	}    	
    	if(!input4.is(":checked") || !input5.is(":checked")){input3.prop('checked', false);}else{input3.prop('checked', true);};
    })
    //用户管理
    initUserBox();
}

function TopBarTool() {
    var content = this;
    var node = this.node = $(".bodyTopbar");

    function chartBtClick() {
        chartBox.show();
        initSelectDefuatMessage();//添加图标 村和社区筛选
        $(".btnf_0").click();
    }
    function initEvent() {
        node.find(".chartBt").bind("click", chartBtClick);
        $(".rightMenuBar").find(".toolsButtonFrame .iconToolsNode.stat").bind("click", chartBtClick);

        node.find('.linktitletip').titletip({
            className: 'titletip', liveEvents: true, showTimeout: 1, alignTo: 'target', alignX: 'center', alignY: 'bottom', offsetY: 10, allowTipHover: false
        });
    }
    initEvent();
}
function ChartBox() {
    var content = this;
    var node = this.node = $(".chartBoxFrame");
    var showEd = false; //是否显示过
    this.width = function (_width) {
        var left = $(window).width() / 2 - _width / 2;
        node.find(".chartBoxMain").width(_width).css("left", left);
        return this;
    };
    this.height = function (_height) {
        var top = $(window).height() / 2 - _height / 2;
        node.find(".chartBoxMain").height(_height).css("top", top < 0 ? 0 : top);
        return this;
    };
    this.border = function (_value) {
        node.find(".chartBoxMain").css("borderRadius", _value);
        return this;
    };
    this.show = function () {
        node.fadeIn(100);
        if (!showEd) { showEd = true; chartBox.showNav(); }
    };
    this.showNav = function () {
        node.find(".chartBoxMain").removeClass().addClass("chartBoxMain staticMenu");
        node.find(".chartNavBoxMain").removeClass("animated flipInX zoomOut").addClass("animated flipInX");
        node.find(".iconNode").removeClass("animated bounceInUp bounceOutUp").addClass("animated bounceInUp");
    };
    this.showIframe = function (_src) {
        node.find(".chartBoxMain").removeClass().addClass("chartBoxMain staticIframe");
        node.find(".statisticIframe").attr((_src ? "src" : "data-link"), _src).show(0);
    };
    this.hide = function () {
        node.fadeOut(300);
    };
    this.hideNav = function () {
        node.find(".chartNavBoxMain").removeClass("animated flipInX zoomOut").addClass("animated zoomOut");
    };
    this.hideIframe = function () {
        node.find(".statisticIframe").hide(0).attr("src", "");
    };
    function chartBoxCloseClick() {
        content.hide();
    }
    function iconNodeClick(event) {
        var targetNode = $(this);
        if (targetNode.hasClass("subMenu")) {
            node.find(".statisticIframe").attr("src", targetNode.attr("src") + (targetNode.attr("src").indexOf("?") < 0 ? "?" : "&") + "random=" + Math.random()).show(0);
            node.find(".chartBoxMain").removeClass().addClass("chartBoxMain staticIframe");
            content.hideNav();
        }
    }
    function closeStatisticFrame() {
        node.find(".statisticIframe").hide(0).attr("src", "");
        content.showNav();
    }
    function initEvent() {
        node.find(".chartBoxClose,.chartBoxBg").bind("click", chartBoxCloseClick);
        node.find(".iconNode").bind("click", iconNodeClick);
        window.closeStatisticFrame = closeStatisticFrame;
    }
    initEvent();
}
//搜索对象
function WebSearchBox() {
    var content = this;
    var node = this.node = $(".searchBoxFrame");
    this.searchValue = "";
    //点击搜索
    function searchEvent(_searchValue) {debugger
    	var layerSelect=$(".layerselect option:selected").val();
        content.showSearchData();
        var submitData = {};
        submitData.searchtable=layerSelect;
        submitData.currentPage = 1;
        submitData.pageSize = webSearchResult.pageSize;
        submitData.searchcontent = _searchValue;
        webSearchResult.load(submitData);
    }
    //显示搜索结果
    this.showSearchData = function () {
        $(".webFrameAutoWidth").addClass("openSearchBox");
    };
    //隐藏搜索结果
    this.hideSearchData = function () {
        $(".webFrameAutoWidth").removeClass("openSearchBox");
        node.find(".searchData").val("");
    };
    //初始化事件
    function initEvent() {
        node.find(".searchData").keypress(function (event) {
            if (event.charCode == "13") {
                node.find(".searchButton").click();
            }
        });
        node.find(".searchButton").click(function () {
            var searchData = $.trim(node.find(".searchData").val());
            if (!searchData) {
                node.find(".searchData").focus();
                return;
            }
            content.searchValue = searchData;
            searchEvent(searchData);
        });
        node.find(".searchData").bind("input propertychange change", function () {
            //node.find(".searchButton").triggerHandler("click");
        });
        node.find(".searchData").bind("blur", function () {
            if ($.trim(this.value) === "") {
                content.hideSearchData();
            }
        });
        node.find(".searchClose").bind("click", function () {
            content.hideSearchData();
        });
    }
    initEvent();
}
//搜索结果
function WebSearchResult(_configData) {
    var content = this;
    var node = this.node = $(".webSearchContentBox");
    var searchListTemp = node.find(".searchValueNodeTempelte").html();
    this.nodeList = [];
    this.pageSize = 10;
    //node.find(".webSearchResult").divScroll({ gap: 70 });
    var SearchNode = function (_data) {
        var NodeContent = this;
        var node = this.node = $("<div>").addClass("searchValueNode").append(searchListTemp);
        var callback = null;
        var type, reportId;
        var data = _data;
        this.remove = function () {
            node.remove();
        };
        this.setBgColor = function (_color) {
            node.addClass();
        };
        this.setConfig = function (_config) {
            if (!_config) { return; }
//          ONLYID = _config.ONLYID;
//          type = _config.type;
//          node.find(".searchValueNodeTitle").text("[" + _config.VALUE3 + "]" + _config.VALUE1).attr("title", _config.VALUE1);
//          node.find(".searchValueNodeTip").text(_config.VALUE2);
			ONLYID = _config.SQID ||_config.CID || _config.FWID;debugger
            type = _config.CID==undefined?(_config.SQID!=undefined?"SQ":"FW"):"CUN";
            var searchValueNodeTitle=node.find(".searchValueNodeTitle")
            _config.SQC==undefined?(_config.MPH!=undefined?(searchValueNodeTitle.text("[" + _config.MPH + "]").attr("title", _config.MPH)):(searchValueNodeTitle.text("[" + _config.NAME + "]").attr("title", _config.NAME))):(searchValueNodeTitle.text("[" + _config.NAME + "]" + _config.SQC).attr("title", _config.NAME));
        };
        this.appendTo = function (_target) {
            $(_target).append(node.get(0));
        };
        this.setCallback = function (_callback) {
            callback = _callback;
        };
        node.click(function () {
            if (callback) { callback(data); }
        });
        this.setConfig(_data);
        node.find('.linktitletip').titletip({
            className: 'titletip', liveEvents: true, showTimeout: 1, alignTo: 'target', alignX: 'center', alignY: 'bottom', offsetY: 10, allowTipHover: false
        });
    };
    this.addInfo = function (_data) {
        var searchNode = new SearchNode(_data);
        searchNode.setCallback(nodeClickCallback);
        searchNode.appendTo(node.find(".resultsBox").get(0));
        this.nodeList.push(searchNode);
    };
    function nodeClickCallback(_data) {
        if (typeof (CallbackForLeftSearchValue) === "function") {
            CallbackForLeftSearchValue(_data);
        }
    }
    this.empty = function () {
        node.find(".resultsBox").empty();
        this.nodeList = [];
        //node.find(".webSearchResult").divScroll("update");
    };
    //加载数据
    this.load = function (_subData) {//JsonSHAHELeftSearchRequest查询结果JsonGBDSearchRequest
        var loadingBox = LoadingView({ target: content.node.get(0) });debugger
        websocket.send("JsonGBDSearchRequest", $.extend({}, userData, _subData), function (_json) {
            loadingBox.remove();
            if (!Agreement.check(_json, function (_message) { AlertView(_message); })) { return false; }
            var _data = _json.data.resultlist;
            var pageConfig = _json.data.pageConfig;
            content.pageSize = (pageConfig.pageSize ? pageConfig.pageSize : 10);
            content.empty();
            for (var i = 0; i < _data.length; i++) {
                content.addInfo(_data[i]);
            }
            node.find(".webSearchResult")[_data.length ? "removeClass" : "addClass"]("empty"); //标记是不是没有数据
            node.find(".searchValueBoxPage").empty().hide(0); //隐藏分页
            if (pageConfig.totalPage > 1) {
            	var layerSelect=$(".layerselect option:selected").val();
                node.find(".searchValueBoxPage").show(0).jqPaginator({
                    wrapper: '<div class="pagination"></div>',
                    totalPages: pageConfig.totalPage,
                    visiblePages: 5,
                    currentPage: pageConfig.currentPage,
                    first: '<a class="first" href="javascript:;">首页</a>',
                    page: '<a class="page" href="javascript:;">{{page}}</a>',
                    last: '<a class="last" href="javascript:;">尾页</a>',
                    onPageChange: function (num, type) {
                        if (type == "change") {debugger
                            content.load({ currentPage: num, pageSize: content.pageSize, searchcontent: webSearchBox.searchValue,searchtable:layerSelect });
                        }
                        return true;
                    }
                });
            }
            //$(window).triggerHandler("resize"); //更改内容区域最大高度
            //node.find(".webSearchResult").divScroll("update");
        });
    };
    function initEvent() {
        $(window).bind("resize", function () {
            //node.find(".webSearchResult").css("max-height", $(".webSearchContentBox").height() - 120 - (node.find(".searchValueBoxPage").is(":hidden") ? 0 : 46));
        });
        content.node.find(".closeWebSearch").bind("click", function () {
            webSearchBox.hideSearchData();
        });
        //$(window).triggerHandler("resize");
    }
    initEvent();
}
//顶部导航对象
function TopMenuBar() {
    var content = this;
    var node = this.node = $(".topMenuBar");
    function initEvent() {
        //影像地图
        node.find(".tabMapPicButtonFrame .picButtonTab").bind("click", function (event) {
            $(".tabMapPicButtonFrame").find("dd").removeClass("selected");
            $(this).addClass("selected");
            if (typeof (CallbackPicPattern) === "function") {
                CallbackPicPattern();
            }
        });
        //规划整合图
        node.find(".tabMapPicButtonFrame .ghzhButtonTab").bind("click", function (event) {
            $(".tabMapPicButtonFrame").find("dd").removeClass("selected");
            $(this).addClass("selected");
            if (typeof (CallbackGHZHPattern) === "function") {
                CallbackGHZHPattern();
            }
        });
        //土地利用总体规划图
        node.find(".tabMapPicButtonFrame .tdlyButtonTab").bind("click", function (event) {
            $(".tabMapPicButtonFrame").find("dd").removeClass("selected");
            $(this).addClass("selected");
            if (typeof (CallbackTDLYPattern) === "function") {
                CallbackTDLYPattern();
            }
        });
        //4-3街区规划调整图
        node.find(".tabMapPicButtonFrame .jqghButtonTab").bind("click", function (event) {
            $(".tabMapPicButtonFrame").find("dd").removeClass("selected");
            $(this).addClass("selected");
            if (typeof (CallbackTDLYPattern) === "function") {
                CallbackJQGHPattern();
            }
        });
        node.find('.linktitletip').titletip({
            className: 'titletip', liveEvents: true, showTimeout: 1, alignTo: 'target', alignX: 'center', alignY: 'bottom', offsetY: 10, allowTipHover: false
        });
    }
    initEvent();
}
//右部导航
function RightMenuBar() {
    var content = this;
    var node = this.node = $(".rightMenuBar");
    var nodefwsx=this.nodefwsx=$(".fwshaixuan");//房屋筛选
    function initEvent() {
    	//------房屋筛选    	
//  	nodefwsx.find("input[type='checkbox']").bind("change",function(){//---房屋筛选控制
//  	var othis=$(this);
//  	var thisData=othis.attr("data");
//  	var inputsq=$("input[data='sq']"),inputcun=$("input[data='cun']"),inputgy=$("input[data='gy']"),
//  	inputjt=$("input[data='jt']");
//		switch (thisData){
//  		case "sq":
//  			if (typeof (setFwLayerVisibleFwsx) === "function") { 
//  				setFwLayerVisibleFwsx(fwLayerSq,$(this).is(":checked"));
//  			}
//websocket.send("JsonGetAllGBDFWRequest", { sessionid: userData.sessionid }, function (response) {//房屋数据 JsonGetAllGBDFWRequest
//      if (response.status == "success") {
//          require(["esri/geometry/Extent", "esri/SpatialReference"], function (Extent, SpatialReference) {
//              var data = response.data;
//              fwIDMapFwsj = {};
//              fwlayerFwsj.clear();
//              for (var index = 0; index < data.length; index++) {
//                  var item = data[index];
//                  if(item.)
//                  var geometry = new Polygon(item.polygon);
//                  //坐标系id转换成数字，原来是字符串
//                  var extent = geometry.getExtent();
//                  if (extent) {
//                      extent = new Extent(extent.xmin, extent.ymin, extent.xmax, extent.ymax, new SpatialReference({ wkid: 2436 }));
//                      geometry.extent = extent;
//                      geometry.setSpatialReference(new SpatialReference({ wkid: 2436 }));
//                      geometry.setCacheValue("_extent", extent);
//                      var graphic = new Graphic(geometry);
//                      graphic.setAttributes(item.fw);
//						fwIDMapFwsj[item.OBJECTID] = graphic;
//                      fwlayerFwsj.add(graphic);
//                  }
//              }
//              renderFWLayerShowFwsj("房屋数据");//房屋图例
//          });
//      }
//  });
//  			break;
//			case "cun":
//				if (typeof (setFwLayerVisibleFwsx) === "function") {
//					setFwLayerVisibleFwsx(fwLayerCun,$(this).is(":checked"));
//				}
//			break;
//			case "gy":
//				if (typeof (setFwLayerVisibleFwsx) === "function") { 
//					setFwLayerVisibleFwsx(fwLayerGy,$(this).is(":checked"));
//				}
//				break;
//  		case "jt":
//				if (typeof (setFwLayerVisibleFwsx) === "function") {
//					setFwLayerVisibleFwsx(fwLayerJt,$(this).is(":checked"));
//				}
//				break;
//			default:
//				setFwLayerVisibleFwsx(fwLayerSq,false);
//				setFwLayerVisibleFwsx(fwLayerCun,false);
//				setFwLayerVisibleFwsx(fwLayerGy,false);
//				setFwLayerVisibleFwsx(fwLayerJt,false);
//  	}    	
//  })
    	
    	//------
        //展开收起效果
        node.find(".spreadBtnBox").bind("click", function () {
            $(".rightMenuBar2").toggle();
        });
//      node.find(".toolsButtonFrame .iconToolsNode.ditugongju").bind("click", function (event) {
//          if (typeof (CallbackMaptools) === "function") {
//              CallbackMaptools();
//          }
//      });
        node.find(".toolsButtonFrame .dituTools .lengthcesuan").bind("click", function (event) {
        	$(".esriPopup").addClass('hide');//隐藏信息弹框
            if (typeof (CallbackLengthcesuantools) === "function") {       	
                CallbackLengthcesuantools();
                return false;
            }
        });
        node.find(".toolsButtonFrame .dituTools .areacesuan").bind("click", function (event) {debugger     
        	$(".esriPopup").addClass('hide');//隐藏信息弹框
            if (typeof (CallbackAreacesuantools) === "function") {           	
                CallbackAreacesuantools();
                return false;
            }
        });
        node.find(".toolsButtonFrame .iconToolsNode.quyuchaxun").bind("click", function (event) {
            if (typeof (CallbackAreaSearch) === "function") {
                $(".esriPopup").addClass('hide');//隐藏信息弹框
                CallbackAreaSearch();
            }
        });
        node.find(".toolsButtonFrame .iconToolsNode.delete").bind("click", function (event) {
            if (typeof (CallbackClear) === "function") {
                CallbackClear();
            }
        });
        node.find(".toolsButtonFrame .iconToolsNode.fuulScreen").bind("click", function (event) {
            if (typeof (CallbackFullscreen) === "function") {
                CallbackFullscreen();
            }
        });
// 		node.find(".toolsButtonFrame .deleteScreenTools .delete").bind("click", function (event) {
//          if (typeof (CallbackClear) === "function") {
//              CallbackClear();
//          }
//      });
//      node.find(".toolsButtonFrame .deleteScreenTools .fuulScreen").bind("click", function (event) {
//          if (typeof (CallbackFullscreen) === "function") {
//              CallbackFullscreen();
//          }
//      });
        var userInfo = store.get("userInfo");
//      node.find(".toolsButtonFrame .iconToolsNode.usermgr").hide();
//      if (userInfo.username == "admin") {
//          node.find(".toolsButtonFrame .iconToolsNode.usermgr").show();
//          node.find(".toolsButtonFrame .iconToolsNode.usermgr").bind("click", function (event) {
//              $(".userBoxFram").fadeIn(100);
//          });
//      }
        node.find(".toolsButtonFrame .iconToolsNode.loginout").bind("click", function (event) {
            var confirmDiv = document.createElement("div");
            $(confirmDiv).addClass("confirmDiv");
            document.body.appendChild(confirmDiv);
            var confirmContent = document.createElement("div")
            $(confirmContent).addClass("alertContent");
            var alertMsg = document.createElement("div");
            $(alertMsg).addClass("alertMsg");
            $(alertMsg).html("确定退出登录？");
            confirmContent.appendChild(alertMsg);
            var btnOk = document.createElement("input");
            btnOk.setAttribute("type", "button");
            btnOk.setAttribute("value", "确定");
            $(btnOk).bind("click", function () {
                var userInfo = store.get("userInfo");
                websocket.send("JsonLogoutRequest", { undertoken: userInfo.usertoken, usertoken: userInfo.usertoken, loginsystem: "0" }, function (_json) { });
            });
            confirmContent.appendChild(btnOk);
            var btnCancle = document.createElement("input");
            btnCancle.setAttribute("type", "button");
            btnCancle.setAttribute("value", "取消");
            $(btnCancle).bind("click", function () {
                document.body.removeChild($(".confirmDiv")[0]);
                document.body.removeChild($(".alertContent")[0]);
            });
            confirmContent.appendChild(btnCancle);
            document.body.appendChild(confirmContent);
        });
    }
    initEvent();
}
//图例对象
function LegendInfo() {
    var content = this;
    this.node = $(".legendInfo");
    //显示
    this.show = function () {
//      this.node.removeClass("animated bounceOutDown bounceUp").addClass("animated bounceUp").removeClass("hide");
		this.node.removeClass("animated bounceOutDown bounceUp").addClass("animated bounceUp");
    };
    //隐藏
    this.hide = function () {
        this.node.removeClass("animated bounceOutDown bounceUp").addClass("animated bounceOutDown");
    };
    var LegendData = function (_config) {
        var node = $("<div>").append('<span class="color"></span><span class="name"></span>').addClass("legendList");
        this.color = function (_value) {
            var color = _value.toString();
            node.find(".color").css("background-color", "rgba(" + color + ")");
        };
        this.border = function (_value) {
            if (_value != null) {
                var border = _value.toString();
                node.find(".color").css("border", border);
            }
        };
        this.name = function (_value) {
            node.find(".name").text(_value);
        };
        this.setConfig = function (_data) {
            this.color(_data.color);
            this.name(_data.name);
            this.border(_data.border);
        };
        this.appendTo = function (_jq) {
            $(_jq).append(node.get(0));
        };
        this.setConfig(_config);
    };
    //添加图例
    this.setData = function (_dataList) {
        if (_dataList && _dataList instanceof Array) {
            this.node.find(".legendListBox").empty();
            for (var i = 0; i < _dataList.length; i++) {
                var legendData = new LegendData(_dataList[i]);
                legendData.appendTo(this.node.find(".legendListBox"));
            }
        }
    };
    function initEvent() {
        content.node.find(".closeSpreadBox").bind("click", function () {
            content.hide();
            $(".legendShow").removeClass('hide');
        });
        $(".legendShow").bind("click", function () {
            content.show();
            $(".legendShow").addClass('hide');
        });
    }
    initEvent();
}
//用户管理
function initUserBox() {
    var node = $(".userBoxFram");
    node.find(".userBoxBg").bind("click", function () { $(".userBoxFram").hide(); });
    node.find(".iconNode").bind("click", function (event) {
        var targetNode = $(this);
        if (targetNode.hasClass("subMenu")) {
            node.find(".userIframe").attr("src", targetNode.attr("src") + (targetNode.attr("src").indexOf("?") < 0 ? "?" : "&") + "random=" + Math.random()).show(0);
            node.find(".chartBoxMain").removeClass().addClass("chartBoxMain userIfram");
            node.find(".chartNavBoxMain").removeClass("animated flipInX zoomOut").addClass("animated zoomOut");
        }
    });
    node.find(".chartBoxClose,.chartBoxBg").bind("click", function () {
        node.hide();
    });
}
//隐藏用户管理
function closeUserFrame() {
    $(".userBoxFram").find(".userIframe").hide(0).attr("src", "");
    $(".userBoxFram").find(".chartBoxMain").removeClass().addClass("chartBoxMain userMenu");
    $(".userBoxFram").find(".chartNavBoxMain").removeClass("animated flipInX zoomOut").addClass("animated flipInX");
    $(".userBoxFram").find(".iconNode").removeClass("animated bounceInUp bounceOutUp").addClass("animated bounceInUp");
}
//底部对象——地块专题渲染
function BottomMenuBox() {
    var content = this;
    var node = this.node = $(".bottomMenuBar.bar1");
    function initEvent() {
        $('.bottomMenuBar .linktitletip').titletip({
            className: 'titletip', liveEvents: true, showTimeout: 1, alignTo: 'target', alignX: 'center', offsetY: 10, allowTipHover: false
        });
        node.find(".iconDK_Normal").click(function () {debugger
            node.find(".iconDK_FL").removeClass("active");
            node.find(".iconDK_SQ").removeClass("active");
            $(this).addClass("active");
            if (typeof (CallbackForDKZTT_Normal) === "function") { CallbackForDKZTT_Normal(!$(this).hasClass("active")); };
        });
        node.find(".iconDK_FL").click(function () {
            node.find(".iconDK_Normal").removeClass("active");
            node.find(".iconDK_SQ").removeClass("active");
            $(this).addClass("active");
            if (typeof (CallbackForDKZTT_FL) === "function") { CallbackForDKZTT_FL(!$(this).hasClass("active")); }
        });

        node.find(".iconDK_SQ").click(function () {
            node.find(".iconDK_Normal").removeClass("active");
            node.find(".iconDK_FL").removeClass("active");
            $(this).addClass("active");
            if (typeof (CallbackForDKZTT_SQ) === "function") { CallbackForDKZTT_SQ(!$(this).hasClass("active")); }
        });
        node.find(".iconFW_Normal").click(function () {
            node.find(".iconFW_BuildYear").removeClass("active");
            node.find(".iconFW_SQ").removeClass("active");
            $(this).addClass("active");
            if (typeof (CallbackForFWZTT_Normal) === "function") { CallbackForFWZTT_Normal(!$(this).hasClass("active")); }
        });
        node.find(".iconFW_BuildYear").click(function () {
            node.find(".iconFW_Normal").removeClass("active");
            node.find(".iconFW_SQ").removeClass("active");
            $(this).addClass("active");
            if (typeof (CallbackForFWZTT_BuildYear) === "function") { CallbackForFWZTT_BuildYear(!$(this).hasClass("active")); }
        });
        node.find(".iconFW_SQ").click(function () {
            node.find(".iconFW_Normal").removeClass("active");
            node.find(".iconFW_FL").removeClass("active");
            $(this).addClass("active");
            if (typeof (CallbackForFWZTT_SQ) === "function") { CallbackForFWZTT_SQ(!$(this).hasClass("active")); }
        });
    }
    initEvent();
}