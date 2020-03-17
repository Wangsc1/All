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

console.log("APP监控运行")
let
apps=["1435195637","904237743","541164041","1447768809","1439731526","363590051","544007664","526831380","1199564834","947792507","414478124","983337376","1436650069","1314212521","1347998487","1443988620","1449412357","1164801111","1495946973","333710667","961390574","373311252","673907758","1423330822","945993620","393670998","1154746981","390017969","1312014438","989565871","440488550","1134218562","1373567447","1261944766","1049254261","1067198688","1371929193","1489780246","697927927","718043190","360593530","284666222","1490527415","1455832781","469338840","1355476695"]
let reg = "us"
let config = {
    url: 'https://itunes.apple.com/lookup?id=' + apps + "&country=" + reg,
    method: "post"
}
$task.fetch(config).then((res) => {
    let results = JSON.parse(res.body).results
    if (results.length > 0) {
        let app_monitor = $prefs.valueForKey("app_monitor"); //取出app_monitor
        if (app_monitor == "" || app_monitor == undefined) {
            console.log('app_monitor是空的或undefined')
            app_monitor = {}
        } else {
            console.log('app_monitor有值')
            app_monitor = JSON.parse(app_monitor)  //从json字符串转换成json对象
        }
        let notifys = "" //需要展示的字符串
        let infos = {} //获取到的新信息

        // console.log('这个发给我：', app_monitor)

        //循环 去匹配结果中的信息
        results.forEach((x => {
            infos[x.trackId] = {
                n: x.trackName,
                v: x.version,
                p: x.formattedPrice
            }
            
            //老数据(app_monitor对象)中有此trackId原型
            if (app_monitor.hasOwnProperty(x.trackId)) {
                console.log('有此trackId原型')
                //2个对象都转成json字符串去判断是否相同 不相同则是更换了app
                if (JSON.stringify(app_monitor[x.trackId]) != JSON.stringify(infos[x.trackId])) {
                    console.log('更换了app')
                    let oldTrackName = app_monitor[x.trackId].n //定义老名字
                    let oldVersion = app_monitor[x.trackId].v //定义老版本
                    let oldFormattedPrice = app_monitor[x.trackId].p //定义老价格 

                    //版本有变化时
                    if (oldVersion != x.version) {
                        console.log('版本变化了')
                        notifys = ` 📲 ${x.trackName}：
🏷 版本升级：${oldVersion} → ${x.version}`
                    }else{  
                        console.log('版本没变化')
                    }
                    //价格有变化时
                    if (oldFormattedPrice != x.formattedPrice) {
                        console.log('价格变化了')
                        notifys = ` 📲 ${x.trackName}：
〽️ 价格变化：${oldFormattedPrice} → ${x.formattedPrice}`
                    }else{
                        console.log('价格没变化')
                    }
                }
            } else {
                console.log('无此trackId原型')
                notifys = ` 📲 ${x.trackName}：
🏷 版本：${x.version}  /  〽️ 价格：${x.formattedPrice}`
            }
        }))

       
        infos = JSON.stringify(infos) //把当前的infos 从json对象转成json字符串 
        $prefs.setValueForKey(infos, "app_monitor")  //存进app_monitor 下次请求的时候取出app_monitor

        if (notifys != "") {
            notify(notifys)
        } else {
            console.log("AppMonitor：无变化")
        }
    }
})

function notify(notifys) {
    notifys = notifys.join("\n")
    console.log(notifys)
    $notify("AppMonitor", "", notifys)
}