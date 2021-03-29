/*
Surge：
WeiXin = type=http-response,pattern=^https?:\/\/weixin110\.qq\.com\/cgi-bin\/mmspamsupport-bin\/newredirectconfirmcgi,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Scripts/WeiXin.js

QuanX：
^https?:\/\/weixin110\.qq\.com\/cgi-bin\/mmspamsupport-bin\/newredirectconfirmcgi url script-response-body https://raw.githubusercontent.com/Wangsc1/All/master/Scripts/WeiXin.js

hostname= weixin110.qq.com
*/

var str = ($response.body);

str = str.match(/:&#x2f;&#x2f;(\S*)"}/)[1].replace(/&#x2f;/g, '/').replace(/&amp;/g, '&').split("\"")[0]
let opener = str.indexOf("m.tb.cn") != -1 ? "taobao://" + str: ($response.body)
//console.log(str);

const $ = new cmp()

if (str.indexOf("m.tb.cn") != -1) {
    $.notify(``, "", "👉 点击进行跳转", opener)
} else if (str.indexOf("如需浏览")) {
    $.notify(``,"", "👉 点击进行跳转", "https://"+str)
}

$done({body: $response.body});

function cmp() {
    _isQuanX = typeof $task != "undefined"
    _isLoon = typeof $loon != "undefined"
    _isSurge = typeof $httpClient != "undefined" && !_isLoon
    this.notify = (title, subtitle, message, url) => {
        if (_isLoon) $notification.post(title, subtitle, message, url)
        if (_isQuanX) $notify(title, subtitle, message, { "open-url": url })
        if (_isSurge) $notification.post(title, subtitle, message, { url: url })
    }
}