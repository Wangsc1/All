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
var $httpClient = isSurge ? $httpClient : {};
// cookie读写
var $persistentStore = isSurge ? $persistentStore : {};
// 消息通知
var $notification = isSurge ? $notification : {};
// #endregion 固定头部

// #region 网络请求专用转换
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
if (isSurge) {
    $notify = function (title, subTitle, detail) {
        $notification.post(title, subTitle, detail);
    }
}
// #endregion

console.log("AppMonitor")
let
apps=["300704847","602660809","1239397626","504631398","1188080269","992210239","1063183999","424598114","1436429074","1062022008","882914841","1481018071","406239138","1312014438","990591885","1141312799","1073473333","432850144","896694807","1434207799","924695435","680469088","869346854","935754064","1035331258","904237743","946930094","1373567447","916366645","1382419586","1299735217","1460078746","333710667","1049254261","1489780246","1407367202","436577167","1481018071","1315744137","1436650069","980368562","1007355333","1126386264","492648096","950519698","317107309","539397400","1444671526","1416894836","1117998129","1462386180","558818638","691121579","1474856599","436577167","641613694","1312014438","1416894836","1117998129","1462386180","558818638","691121579","1474856599","436577167","641613694","1312014438","444934666","997102246","951937596","951610982","1435195637","904237743","541164041","1447768809","1439731526","363590051","544007664","526831380","1199564834","947792507","414478124","983337376","1436650069","1314212521","1347998487","1443988620","1449412357","1164801111","1495946973","333710667","961390574","373311252","673907758","1423330822","945993620","393670998","1154746981","390017969","1312014438","989565871","440488550","1134218562","1373567447","1261944766","1049254261","1067198688","1371929193","1489780246","697927927","718043190","360593530","284666222","1490527415","1455832781","469338840","1355476695"]
let reg = "us"
let config = {
    url: 'https://itunes.apple.com/lookup?id=' + apps + "&country=" + reg,
    method: "post"
}
$task.fetch(config).then((res) => {
    let results = JSON.parse(res.body).results
    if (results.length > 0) {
        let app_monitor = $prefs.valueForKey("app_monitor"); //取出app_monitor的key
        if (app_monitor == "" || app_monitor == undefined) {
            app_monitor = {}
        } else {
            app_monitor = JSON.parse(app_monitor) //从json字符串转换成json对象
        }

        let infos = {} //获取到的新信息

        //循环 去匹配结果中的信息
        results.forEach((x => {
            infos[x.trackId] = {
                i: x.trackId,
                n: x.trackName,
                v: x.version,
                p: x.formattedPrice
            }
            let notifys = [] //需要展示的字符串

            //老数据(app_monitor对象)中有此trackId原型  新增
            if (app_monitor.hasOwnProperty(x.trackId)) {
                //2个对象都转成json字符串去判断是否相同 不相同则是更换了app
                if (JSON.stringify(app_monitor[x.trackId]) != JSON.stringify(infos[x.trackId])) {
                    console.log('更换了app执行')
                    let oldid = app_monitor[x.trackId].i //老id
                    let oldTrackName = app_monitor[x.trackId].n //定义老名字
                    let oldVersion = app_monitor[x.trackId].v //定义老版本
                    let oldFormattedPrice = app_monitor[x.trackId].p //定义老价格 

                    if (oldVersion != x.version || oldFormattedPrice != x.formattedPrice) {
                        notifys.push(`${x.trackName}：
                        `)
                    }
                    //版本有变化时
                    if (oldVersion != x.version) {
                        console.log('id:', oldid, oldTrackName, '的版本从', oldVersion, '更新到了:', x.version)
                        notifys.push(`📲 ${x.trackName}：
🏷 版本升级：${oldVersion} → ${x.version}
                         `)
                    }
                    //价格有变化时
                    if (oldFormattedPrice != x.formattedPrice) {
                        console.log('id:', oldid, oldTrackName, '的价格从', oldFormattedPrice, '更新到了:', x.formattedPrice)
                        notifys.push(`📲 ${x.trackName}：
〽️ 价格变化：${oldFormattedPrice} → ${x.formattedPrice} `)
                    }
                    senddata(infos, notifys)
                }
            } else {
                console.log(notifys,app_monitor[x.trackId])


                
                notifys.push(`📲 ${x.trackName}：
🏷 版本：${x.version}  /  〽️ 价格：${x.formattedPrice}`)
                senddata(infos, notifys)
            }

        }))
    }
})

function senddata(infos, notifys) {
    infos = JSON.stringify(infos) //把当前的infos 从json对象转成json字符串 
    $prefs.setValueForKey(infos, "app_monitor") //存进app_monitor value和key

    if (notifys.length != 0) {
        notify(notifys)
    } else {
        console.log("AppMonitor：无变化")
    }
}

function notify(notifys) {
    //notifys = notifys.join("\n")
    console.log(notifys)
    $notify("AppMonitor", "", notifys)
}