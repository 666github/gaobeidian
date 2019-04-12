var zttsetting = null;
var dklegendsetting = [];
var fwlegendsetting = [];var fwlegendsetting2 = [];var fwlegendsettingJttd = [];var fwlegendsettingFwsj = [];
function addref(type, src) {
    if (type == "js") {
        var oHead = document.getElementsByTagName('HEAD').item(0);
        var scriptDom = document.createElement("script");
        scriptDom.src = src;
        scriptDom.type = "application/javascript";
        document.documentElement.appendChild(scriptDom);
    }
    else if (type == "css") {
        var container = document.getElementsByTagName("head")[0];
        var scriptDom = document.createElement("link");
        scriptDom.href = src;
        scriptDom.rel = "stylesheet";
        scriptDom.type = "text/css";
        document.documentElement.appendChild(scriptDom);
    }
}

function initWebPageBefore() {
    //页面初始化之前执行
    $('.topMenuCheckFrame').css('display', 'none');
}

function initWebPageAfter() {
    //页面初始化之后执行
    //地图容器ID是  mapContent
    //$("#mapContent").append(DomElement);这个地方放地图Dom元素
    websocket.send("JsonGetAllZTTSettingRequest", userData, function (response1) {
        zttsetting = response1.data;
        websocket.send("JsonGetAllTileSettingRequest", userData, function (response) {
            tilesetting = {};
            for (var index in response.data) {
                var tile = response.data[index];
                tilesetting[tile.name] = tile;
            }
            initMap();
        });
    });
}

//影像地图
function CallbackPicPattern() {
    showImgLayer("影像地图");
}
//规划整合图
function CallbackGHZHPattern() {
//  showImgLayer("规划整合图");
showImgLayer("电子地图");
}
//土地利用总体规划图
function CallbackTDLYPattern() {
//  showImgLayer("土地利用总体规划图");
showImgLayer("qdr");
}
//4-3街区规划调整图
function CallbackJQGHPattern() {
    showImgLayer("4-3街区规划调整图");
}

function CallbackForLegend() {
//  if (dklayer.visible) {
//      if (sqlayer.visible) return dklegendsetting.concat(fwlegendsetting).concat(fwlegendsetting2).concat(fwlegendsettingJttd).concat(fwlegendsettingFwsj);
//      else return dklegendsetting;
//  }
//  else if (sqlayer.visible) return fwlegendsetting;
return dklegendsetting.concat(fwlegendsetting).concat(fwlegendsetting2).concat(fwlegendsettingJttd).concat(fwlegendsettingFwsj);
}
//左边搜索
//function CallbackForLeftSearchValue(_id) {
//  if (_id.type == "dk") {
//      locateDK(_id);
//  }
//  else if (_id.type == "poi") {
//      locatePOI(_id);
//  }
//  else if (_id.type == "fw") {
//      locateFW(_id);
//  }
//}
function CallbackForLeftSearchValue(_id) {
	var selectType=_id.CID==undefined?(_id.SQID!=undefined?"SQ":"FW"):"CUN";
    if (selectType == "CUN") {
        locateCUN(_id);
    }
//  else if (selectType == "poi") {
//      locatePOI(_id);
//  }
    else if (selectType == "SQ") {
        locateSQ(_id);
    }else{debugger
    	locateFW(_id);
    }
}
//全屏按钮
function CallbackFullscreen() {
    fullScreen();
}
//清除按钮
function CallbackClear() {
    clearAllGraphics();
}
//专题渲染
function CallbackForDKZTT_Normal() {
    renderDKLayerShow('地块');
}
function CallbackForDKZTT_FL() {
    renderDKLayerShow("地块分类");
}
function CallbackForDKZTT_SQ() {
    renderDKLayerShow("地块所属村");
}
function CallbackForFWZTT_Normal() {
    renderFWLayerShow("房屋");
}
function CallbackForFWZTT_BuildYear() {
    renderFWLayerShow("房屋建筑年代");
}
function CallbackForFWZTT_SQ() {
    renderFWLayerShow("房屋所属村");
}
//区域查询
function CallbackAreaSearch() {
    queryByExtent();
}