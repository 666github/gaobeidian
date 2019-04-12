// 作者：马腾
//脚本名称：首页选择用户模块页面脚本
//更新日期：2016年12月26日

function initWebPage() {
    if (typeof (initWebPageBefore) === "function") { initWebPageBefore(); }

    moduleBoxManager = new BgImage(); //创建动态背景
    //new ModuleBoxManager(ModuleList);
    login = new Login();
    login.show(ModuleList[0]);
    if (typeof (initWebPageAfter) === "function") { initWebPageAfter(); }
}
$(initWebPage);
var urlRequest = Request();
var login, moduleBoxManager;
var isLogin = false; //是否已经登录
function BgImage() {
    var bgImage = new Image();
    var timer = setInterval(function () {
        if (bgImage.complete) {
            clearInterval(timer);
            //$(".selectModuleBox").prepend(bgImage);
        }
    }, 50);
    bgImage.src = "images/pagebg.jpg";
}

function Login() {
    var content = this;
    var node = $(".loginFrame");
    var loading = false; //是否登录中
    var loginConfig;
    var loginMode = "";
    this.show = function (_config) {
        //_mode登录模式
        loginConfig = _config;
        loginMode = (_config.mode == "Ajax" ? "Ajax" : "WebSocket");
        $("body").addClass("showLogin");
    };
    this.hide = function () {
        $("body").removeClass("showLogin");
    };

    function initEvent() {
        node.find(".loginFrameBg").click(function () {
            if (!loading) { //content.hide(); 
            }
        });
        $(document).keydown(function (event) {
            if (event.keyCode == 13) {
                $(".loginSubmit").click();
            }
        });
        node.find(".loginSubmit").click(submitFrom);
    }
    function submitFrom() {
        var username = $.trim(node.find("#username").val());
        var password = $.trim(node.find("#password").val());
        if (!username) {
            node.find("#username").focus();
            return;
        }
        if (!password) {
            node.find("#password").focus();
            return;
        }
        loading = true;
        node.find(".loginBox").addClass("loginLoading");
        if (loginMode === "WebSocket") {
            var promise = "_DCFWPLATFORM_";
            var websocket = new MyWebSocket(WebConfig.websocketUrl, promise);
            websocket.onopen = function () {
                websocket.send("JsonValidUserNamePWDRequest", { username: username, pwd: md5(password), loginsystem: "0" }, function (_json) {
                    if (!Agreement.check(_json, function (_message) { AlertView(_message) })) {
                        node.find(".loginBox").removeClass("loginLoading");
                        return false;
                    }
                    isLogin = true; //标记已经登录
                    loading = false; //保存数据
                    //保存数据
                    store.set("userInfo", {
                        username: username,
                        pwd: md5(password),
                        usertoken: _json.data.usertoken,
                        userDataSaveTime: new Date()
                    });
                    var gotoUrl = urlRequest.getUnescape("backUrl");
                    if (!gotoUrl) {
                        gotoUrl = Agreement.getModuleLink(urlRequest.get("backModule"));
                    }
                    if (!gotoUrl) {
                        gotoUrl = loginConfig.link;
                    }
                    document.location.href = gotoUrl ? gotoUrl : "#";
                })
            }
            websocket.onclose = function () {
                node.find(".loginBox").removeClass("loginLoading");
            }
            websocket.connect();
        } else if (loginMode === "Ajax") {
            $.ajax({
                url: loginAction,
                type: "GET",
                data: { username: username, password: password },
                dataType: "json",
                success: function (_json) {
                    loading = false; //保存数据
                    isLogin = true; //标记已经登录
                    store.set("userInfo", {
                        username: username,
                        pwd: md5(password),
                        //usertoken:_json.data.usertoken,
                        userDataSaveTime: new Date()
                    })
                    window.location.href = "../safetyManagement/";
                    node.find(".loginBox").removeClass("loginLoading");
                },
                error: function (_e1, _e2, _e3) {
                    loading = false;
                    console.log(_e1, _e2, _e3);
                    node.find(".loginBox").removeClass("loginLoading");
                }
            });
        }
    }
    initEvent();
}

function ModuleBoxManager(_config) {
    var content = this;
    var node = this.node = $(".selectModuleContent");
    var config = [];
    this.setConfig = function (_config) {
        if (!_config) { return; }
        config = _config;
        for (var i = 0; i < _config.length; i++) {
            var nodebox = new ModuleBox(_config[i]);
            nodebox.appendTo(node.get(0));
        }
        initEvent();
    };

    function initEvent() {
        $(window).bind("resize", onWindowResize);
        onWindowResize();
    }

    function onWindowResize() {
        var nodeRowNumber = (node.height() < (150 * 3 + 20) ? 5 : 4); //一行几个
        var nodeRowCount = Math.ceil(config.length / nodeRowNumber);
        node.width(220 * nodeRowNumber);
        var topOffset = 150, windowHeight = $(window).height();
        if (windowHeight - 150 - 60 < nodeRowCount * 150 + 20) {
            topOffset = 150;
        } else {
            topOffset = (windowHeight - nodeRowCount * 150) / 2 + 10;
        }
        node.css("top", topOffset);
    }
    initEvent();
    this.setConfig(_config);
}

function ModuleBox(_config) {
    var content = this;
    var node = this.node = $("<div>").addClass("selectModuleNodeFrame").append($(".selectModuleNodeFrameTemplate").html());
    var link = "", enable = true;

    this.setStatus = function (_status) {
        enable = !!_status;
        if (enable) {
            node.removeClass("selectModuleNodeFrameDisable");
        } else {
            node.addClass("selectModuleNodeFrameDisable");
        }
    };
    this.setLink = function (_link) {
        link = _link;
    };
    this.setTitle = function (_title) {
        node.find(".selectModuleNodeName").text(_title);
    };
    this.setClass = function (_class) {
        node.addClass(_class);
    };
    this.setConfig = function (_config) {
        if (!_config) { return; }
        this.setClass(_config.id);
        this.setTitle(_config.title);
        this.setLink(_config.link);
        this.setStatus(_config.enable);
    };
    this.appendTo = function (_target) {
        $(_target).append(node.get(0));
    };
    function initEvent(_config) {
        node.bind("click", function () {
            if (!_config.enable) {
                TipView("此模块暂未集成！");
                return false;
            }
            if (isLogin || _config.id == "publicHouse") {//如果已经登录
                document.location.href = _config.link; //跳转到模块页面
            } else {
                login.show(_config);
            }
        });
    }
    this.setConfig(_config);
    initEvent(_config);
}
