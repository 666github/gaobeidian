//全站配置文件
window.WebConfig = {
    //websocket地址
    websocketUrl: "ws://" + window.location.hostname + ":7777",
    //ajax登录地址
    ajaxLoginUrl: "",
    uploadFileUrl: window.location.hostname,
    loginUrl: (function () {
        var hostName, item = document.querySelectorAll("script");
        if (item.length) {
            var selfUrl = item[item.length - 1].src; //脚本路径
            selfUrl = selfUrl.replace("javascript/public/webpublic.js", "");
            selfUrl += "pages/selectModule/index.html";
            return selfUrl;
        }
        return "/pages/selectModule/index.html";
    })()
};
//所有模块数据列表
window.ModuleList = [
	{id: "shahe", title: "沙河地块房屋管理", link: "/pages/shahe/shahefw.html", enable: true, loginMode: "WebSocket" }
];
//协议对象
window.Agreement = {
    //检测数据合法性
    check: function (_json, _onErrorCallback) {
        if (!_json || !(typeof (_json) === "object") || !("status" in _json)) {
            if (typeof (_onErrorCallback) === "function") {
                _onErrorCallback("错误的数据格式");
            }
            return false;
        }
        if (_json.status === "success") {
            return true;
        } else if (_json.status === "login") {
            return !!Agreement.toLogin();
        } else if (_json.status === "error") {
            if (typeof (_onErrorCallback) === "function") { _onErrorCallback(_json.message); }
            return false;
        } else {
            if (typeof (_onErrorCallback) === "function") { _onErrorCallback("无错误的协议格式"); }
            return false;
        }
        return true;
    },
    //执行登录操作
    toLogin: function () {
        document.close();
        document.location.replace(WebConfig.loginUrl + "?backModule=" + (typeof (currentModule) !== "undefined" ? currentModule : "") + "&backUrl=" + encodeURIComponent(document.location)); //登录跳转
    },
    //获取模块链接
    getModuleLink: function (_name) {
        for (var i = 0; i < ModuleList.length; i++) {
            if (ModuleList[i].id === _name) {
                return ModuleList[i].link;
            }
        }
        return "";
    },
    getWebsocket: function (_loginStartCallback, _loginCompleteCallback) {
        if (typeof (MyWebSocket) === "undefined") { throw "未引入脚本MyWebSocket.js"; }
        if (typeof (store) === "undefined") { throw "未引入脚本store.js"; }
        var websocket = new MyWebSocket(WebConfig.websocketUrl, '_DCFWPLATFORM_');
        var userData = store.get("userInfo");
        websocket.onopen = function () {
            //登录
            websocket.send("JsonValidTokenRequest", { usertoken: userData.usertoken, loginsystem: "0" }, function (_json) {
                Agreement.check(_json, function (_message) {
                    return !!Agreement.toLogin(); //错误就到登录页
                });
                websocket.onerror = function () { };

                if (typeof (_loginCompleteCallback) === "function") {
                    _loginCompleteCallback.call(websocket, { sessionid: _json.data.sessionid });
                }
            });
        }
        websocket.onclose = function () {//当断开连接后重新连接
            if (typeof (_loginStartCallback) === "function") {
                _loginStartCallback.call(websocket);
            }
            websocket.onclose = function () {
                return !!Agreement.toLogin();
            }
            websocket.onerror = function () {
                return !!Agreement.toLogin();
            }
            if (typeof (userData) === "object" && userData.username && userData.pwd) {
                websocket.connect();
            } else {
                return !!Agreement.toLogin();
            }
        }
        websocket.onclose(); //执行重新连接
    }
};
