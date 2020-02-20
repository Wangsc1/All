/*
招商银行信用卡微信公众号："领积分 - 🎁签到领积分" 获取 Cookie

[task_local]
8 0 * * * cmbchina.js

[rewrite_local]
https://weclub\.ccc\.cmbchina.com/SCRMCustomActivityFront/checkin/request/get-home-data\.json\?activityCode=checkin url script-request-header cmbchina.js

[mitm]
hostname = weclub.ccc.cmbchina.com
*/

const checkinURL = 'https://weclub.ccc.cmbchina.com/SCRMCustomActivityFront/checkin/request/checkin.json';
const cookieKey = 'iNotificatioin_cmbchina_cookieKey';
const userAgentKey = 'iNotificatioin_cmbchina_userAgentKey';

let isGetCookie = typeof $request !== 'undefined';

if (isGetCookie) {
    // 获取 Cookie
    if ($request.headers['Cookie']) {
        var cookie = $request.headers['Cookie'];
        var userAgent = $request.headers['User-Agent'];
        $prefs.setValueForKey(cookie, cookieKey);
        $prefs.setValueForKey(userAgent, userAgentKey);
        $notify("成功获取招商银行信用卡Cookie 🎉", "", "请禁用该脚本")
    }
    $done({});
} else {
    // 签到
    var request = {
        url: checkinURL,
        method: 'POST',
        headers: {
            'Cookie': $prefs.valueForKey(cookieKey),
            'User-Agent': $prefs.valueForKey(userAgentKey),
            'Content-type' : 'application/json; charset=utf-8'
        },
        body: JSON.stringify({'activityCode' : 'checkin'})
    };

    $task.fetch(request).then(response => {
        const result = JSON.parse(response.body);
        if (result.respCode == 1000) {
            $notify("招商银行信用卡", "", "签到成功，获得 " + result.data.awardValue + " 积分🎁");
        } else if (result.respCode == 1452) {
            $notify("招商银行信用卡", "", "签到失败，请获取 cookie");
        } else if (result.respCode == 'custom_8500') {
            $notify("招商银行信用卡", "", "签到失败，" + result.respMsg);
        } else {
            $notify("招商银行信用卡", "", "签到失败，请查看日志");
            console.log(response.body)
        }
    }, reason => {
        $notify("招商银行信用卡", "", reason.error)
    });
}

function nobyda() {
    const isRequest = typeof $request != "undefined"
    const isSurge = typeof $httpClient != "undefined"
    const isQuanX = typeof $task != "undefined"
    const notify = (title, subtitle, message) => {
        if (isQuanX) $notify(title, subtitle, message)
        if (isSurge) $notification.post(title, subtitle, message)
    }
    const write = (value, key) => {
        if (isQuanX) return $prefs.setValueForKey(value, key)
        if (isSurge) return $persistentStore.write(value, key)
    }
    const read = (key) => {
        if (isQuanX) return $prefs.valueForKey(key)
        if (isSurge) return $persistentStore.read(key)
    }
    const post = (options, callback) => {
        if (isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "POST"
            $task.fetch(options).then(response => {
                response["status"] = response.statusCode
                callback(null, response, response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (isSurge) $httpClient.post(options, callback)
    }
    const end = () => {
        if (isQuanX) isRequest ? $done({}) : ""
        if (isSurge) isRequest ? $done({}) : $done()
    }
    return { isRequest, isQuanX, isSurge, notify, write, read, post, end }
};