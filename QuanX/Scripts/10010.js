/*
    本作品用于QuantumultX和Surge之间js执行方法的转换
    您只需书写其中任一软件的js,然后在您的js最【前面】追加上此段js即可
    无需担心影响执行问题,具体原理是将QX和Surge的方法转换为互相可调用的方法
    尚未测试是否支持import的方式进行使用,因此暂未export
    如有问题或您有更好的改进方案,请前往 https://github.com/sazs34/TaskConfig/issues 提交内容,或直接进行pull request
    您也可直接在tg中联系@wechatu
*/
// #region 固定头部
let isQuantumultX = $task != undefined; //判断当前运行环境是否是qx
let isSurge = $httpClient != undefined; //判断当前运行环境是否是surge
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

const tel = "18550776549";

//上行引号内填入联通号码，使用前请登陆一次联通支付宝小程序
//有问题请通过Telegram反馈 https://t.me/Leped_Bot
var remainTime = "-";
var remainFee = "-";
var remainFlow = "-";
var queryTime = "-";
let used = [0, 0, 0];
let quota = [1, 1, 1];
let remain = [1, 1, 1];
let pieData = [[], [], [], []];
async function launch() {
    await get_basic(tel);
    $done();
}

launch()

function get_basic(tel) {
    let basic = {
        url: "https://mina.10010.com/wxapplet/bind/getIndexData/alipay/alipaymini?user_id=" + tel,
        headers: {},
    }
    $httpClient.get(basic, async function (error, response, data) {
        if (error) {
            console.log(error);
            $notification.post("10010", tel + '登录失败', error,);
        } else {
            //var remainFee = data.dataList[0].number;
            //$notification.post(remainFee);
            var obj = JSON.parse(data);
            remainFee = obj.dataList[0].number;
            remainTime = obj.dataList[2].number;
            //console.log(obj);
            //$notification.post(remainFee, remainTime);
            await get_detail(remainFee, remainTime, tel)
        }
    });
}

function get_detail(remainFee, remainTime, tel) 
{
    let data = {
        url: "https://mina.10010.com/wxapplet/bind/getCombospare/alipay/alipaymini?stoken=&user_id=" + tel,
        headers: {
        },
    }
    $httpClient.get(data, async function (error, response, data) {
        if (error) {
            console.log(error);
            $notification.post("10010", tel + '登录失败', error);
        } else {
            //var remainFee = data.dataList[0].number;
            //$notification.post(remainFee);
            var obj1 = JSON.parse(data);
            //console.log(obj1);
            queryTime = obj1.queryTime;
            let det = obj1.woFeePolicy;
            //$notification.post(queryTime);
            console.log(det);
            (used = [0, 0, 0]), (quota = [0, 0, 0]), (remain = []);
            for (const i in det) {
                if (i == "indexVf") {
                    $notification.post("error", "AOBH! Restart or Clear APP Cache!", "");
                    return;
                }
                let allVal = det[i].addUpUpper;
                if (allVal != 0) {
                    let type = det[i].elemType,
                        useVal = det[i].xUsedValue,
                        typeName = det[i].feePolicyName,
                        canUseVal = det[i].canUseResourceVal,
                        unit = det[i].totalUnitVal;
                    if (type == 3) {
                        quota[2] += parseFloat(allVal);
                        if (canUseVal != 0) {
                            if (det[i].canUseUnitVal == "GB") canUseVal = canUseVal * 1024;
                            pieData[2].push([typeName, Number(canUseVal), "MB"]);
                        }
                        if (useVal != 0) {
                            if (det[i].usedUnitVal == "GB") useVal = useVal * 1024;
                            used[2] += parseFloat(useVal);
                            pieData[2].unshift([typeName + " 已用", Number(useVal), "MB"]);
                        }
                    } else {
                        quota[type - 1] += parseInt(allVal);
                        used[type - 1] += parseInt(useVal);
                        if (canUseVal != 0)
                            pieData[type - 1].push([typeName, Number(canUseVal), unit]);
                        if (useVal != 0)
                            pieData[type - 1].unshift([
                                typeName + " 已用",
                                Number(useVal),
                                unit
                            ]);
                    }
                }
            }
            used.forEach((ele, i) => {
                remain.push(quota[i] - ele);
            });
            const setUnit = i => {
                if (i < 1024) return i.toFixed(2) + " MB";
                else return (i / 1024).toFixed(2) + " GB";
            };
            let rFlow = setUnit(remain[2]).split(" ");
            $notification.post("10010", "截止至 " + queryTime, "剩余语音 " + remainTime + "分" + "\n话费余额 " + remainFee + "元" + "\n流量剩余 " + rFlow[0] + rFlow[1]);
        }
    });
}