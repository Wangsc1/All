// #region 固定头部
let isQuantumultX = $task != undefined; //判断当前运行环境是否是qx
let isSurge = $httpClient != undefined; //判断当前运行环境是否是surge
// 判断request还是respons
// down方法重写
var $done = (obj={}) => {
    var isRequest = typeof $request != "undefined";
    if (isQuantumultX) {
        return isRequest ? $done({}) : ""
    }
    if (isSurge) {
        return isRequest ? $done({}) : $done()
    }
}
// http请求
var $task = isQuantumultX ? $task : {};
var $httpClient = isSurge ? $httpClient : {};
// cookie读写
var $prefs = isQuantumultX ? $prefs : {};
var $persistentStore = isSurge ? $persistentStore : {};
// 消息通知
var $notify = isQuantumultX ? $notify : {};
var $notification = isSurge ? $notification : {};
// #endregion 固定头部

// #region 网络请求专用转换
if (isQuantumultX) {
    var errorInfo = {
        error: ''
    };
    $httpClient = {
        get: (url, cb) => {
            var urlObj;
            if (typeof (url) == 'string') {
                urlObj = {
                    url: url
                }
            } else {
                urlObj = url;
            }
            $task.fetch(urlObj).then(response => {
                cb(undefined, response, response.body)
            }, reason => {
                errorInfo.error = reason.error;
                cb(errorInfo, response, '')
            })
        },
        post: (url, cb) => {
            var urlObj;
            if (typeof (url) == 'string') {
                urlObj = {
                    url: url
                }
            } else {
                urlObj = url;
            }
            url.method = 'POST';
            $task.fetch(urlObj).then(response => {
                cb(undefined, response, response.body)
            }, reason => {
                errorInfo.error = reason.error;
                cb(errorInfo, response, '')
            })
        }
    }
}
if (isSurge) {
    $task = {
        fetch: url => {
            //为了兼容qx中fetch的写法,所以永不reject
            return new Promise((resolve, reject) => {
                if (url.method == 'POST') {
                    $httpClient.post(url, (error, response, data) => {
                        if (response) {
                            response.body = data;
                            resolve(response, {
                                error: error
                            });
                        } else {
                            resolve(null, {
                                error: error
                            })
                        }
                    })
                } else {
                    $httpClient.get(url, (error, response, data) => {
                        if (response) {
                            response.body = data;
                            resolve(response, {
                                error: error
                            });
                        } else {
                            resolve(null, {
                                error: error
                            })
                        }
                    })
                }
            })

        }
    }
}
// #endregion 网络请求专用转换

// #region cookie操作
if (isQuantumultX) {
    $persistentStore = {
        read: key => {
            return $prefs.valueForKey(key);
        },
        write: (val, key) => {
            return $prefs.setValueForKey(val, key);
        }
    }
}
if (isSurge) {
    $prefs = {
        valueForKey: key => {
            return $persistentStore.read(key);
        },
        setValueForKey: (val, key) => {
            return $persistentStore.write(val, key);
        }
    }
}
// #endregion

// #region 消息通知
if (isQuantumultX) {
    $notification = {
        post: (title, subTitle, detail) => {
            $notify(title, subTitle, detail);
        }
    }
}
if (isSurge) {
    $notify = function (title, subTitle, detail) {
        $notification.post(title, subTitle, detail);
    }
}
// #endregion

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