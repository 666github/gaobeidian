/**
 * Created by ifmap on 2017/5/1.
 */

var rand
    = (function(){  var today
    = new Date();   var seed
    = today.getTime();  function rnd(){    seed
    = ( seed * 9301 + 49297 ) % 233280;    return seed
    / ( 233280.0 );  };  return function rand(number){    return Math.ceil(rnd(seed)
    * number);  };})();

function MyWebSocket(uri,promise) {
    var _mywebSocket = this;
    this._webSocket = null;
    this._uri = uri;
    this.promise = promise;
    var tryonce = true;
    this._messageMap = {};
    this.onopen = function (evt) {
    };
    this.onclose = function (code,reason) {

    };
    this.onerror = function (evt) {

    };
    this.send = function(messageType,param,callback) {
        messageType = messageType+promise+ rand(1024*1024*1024);

        if(_mywebSocket.tryonce && (_mywebSocket._webSocket == null || _mywebSocket._webSocket.readyState == WebSocket.CLOSED)){
            _mywebSocket.tryonce = false;
            _mywebSocket.onopen = function (evt) {
                _mywebSocket.send(messageType,param, callback);
            }
            _mywebSocket.connect();
            return;
        }
        _mywebSocket.tryonce = true;
        _mywebSocket._messageMap[messageType] = callback;
        _mywebSocket._webSocket.send(JSON.stringify({
            type:messageType,
            data:param
        }));
    };
    this.close = function () {
        _mywebSocket._webSocket.close();
    };
    this.connect = function () {
        _mywebSocket._webSocket = new WebSocket(uri);
        _mywebSocket._webSocket.onclose=function (code,reason) {
            _mywebSocket.onclose(code,reason);
        };
        _mywebSocket._webSocket.onopen = function (p1) {
            _mywebSocket.onopen(p1);
        };
        _mywebSocket._webSocket.onerror = function (p1) {
            _mywebSocket.onerror(p1);
        };
        _mywebSocket._webSocket.onmessage = function (evt) {
            var responsedata = JSON.parse(evt.data);
            var callback = _mywebSocket._messageMap[responsedata.type];
            if(callback){
                delete _mywebSocket._messageMap[responsedata.type];
                callback(responsedata);
            }
        }
    };
}
