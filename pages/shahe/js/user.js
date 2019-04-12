
var websocket = window.parent.websocket;
var userData = window.parent.userData;
var deleteUserId;
function initEvent() {
    var node = $(".pageApp");
    //关闭窗体
    node.find(".boxClose").bind("click", function () {
        if (window.top && typeof (window.top.closeUserFrame) === "function") {
            window.top.closeUserFrame();
        }
    });
    //获取用户集合
    if (node.find(".list").length > 0) loadUserList();
    //添加用户
    node.find(".btnSubmit").bind("click", function () { addUser(); });
}
//添加用户
function addUser() {
    var node = $(".pageApp");
    var username = node.find(".username").val();
    if (username == "") {
        showAlertDiv("用户名不能为空！");
        return;
    }
    var fullname = node.find(".fullname").val();
    if (fullname == "") {
        showAlertDiv("全名不能为空！");
        return;
    }
    node.find(".loadingStatus").fadeIn();
    websocket.send("JsonCreateUserRequest", $.extend(userData, {
        inputvals: { inputUserName: username, inputUserCNName: fullname, inputPassword: md5(username) }
    }), function (response) {
        if (response.status == 'success') {
            node.find(".loadingStatus").fadeOut();
            showAlertDiv("添加成功！");
        }
        else {
            node.find(".loadingStatus").fadeOut();
            showAlertDiv(response.status);
        }
    });
}
//加载用户列表
function loadUserList() {
    var node = $(".pageApp");
    node.find(".loadingStatus").fadeIn();
    websocket.send("JsonQueryUsersRequest", $.extend(userData, {}), function (response) {
        if (response.status == 'success') {
            node.find(".loadingStatus").fadeOut();
            var userList = response.data.users;
            var table_list = node.find(".list").find("tbody");
            table_list.html("");
            var html_list = "";
            for (var i = 0; i < userList.length; i++) {
                html_list += "<tr>";
                html_list += "<td>" + userList[i].USERNAME + "</td>";
                html_list += "<td>" + userList[i].FULLNAME + "</td>";
                html_list += "<td><a href=\"javascript:deleteUser('" + userList[i].ID + "');\">删除</a></td>";
                html_list += "</tr>";
            }
            table_list.html(html_list);
        }
        else {
            node.find(".loadingStatus").fadeOut();
            new AlertBoxMessage(
					{ title: "信息提示",
					    message: "请求过程中遇到了错误",
					    showClose: false, btnCaption: ["确定"],
					    callback: [function () { document.reload(true); } ]
					});
        }
    });
}
//删除用户
function deleteUser(id) {
    deleteUserId = id;
    showConfirm("确定要删除该用户？");
}
//显示确认框
function showConfirm(msg) {
    var node = $(".pageApp");
    node.find(".confirmDiv").fadeIn().find(".alertMsg").html(msg);
}
//返回确认结果
function returnConfirm(v) {
    var node = $(".pageApp");
    $('.confirmDiv').fadeOut();
    if (v == 1) {
        node.find(".loadingStatus").fadeIn();
        websocket.send("JsonDeleteSelectedUsersRequest", $.extend(userData, { selections: [deleteUserId] }), function (response) {
            if (response.status == 'success') {
                node.find(".loadingStatus").fadeOut();
                showAlertDiv("删除成功！");
                loadUserList();
            }
            else {
                node.find(".loadingStatus").fadeOut();
                new AlertBoxMessage(
					{ title: "信息提示",
					    message: "请求过程中遇到了错误",
					    showClose: false, btnCaption: ["确定"],
					    callback: [function () { document.reload(true); } ]
					});
            }
        });
    }
}
function showAlertDiv(msg) {
    $(".pageApp").find(".alertDiv").fadeIn().find(".alertMsg").html(msg);
}
$(initEvent);