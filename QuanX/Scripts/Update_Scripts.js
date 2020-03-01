/**
 * 远程脚本管理（QuanX 举例）
 * 
 * 1.设置定时任务更新添加的远程脚本，第一次运行需要手动执行一下更新脚本（Qanx 普通调试模式容易更新失败，使用最新 TF 红色按钮调试），例如设置每天凌晨更新脚本：
 * [task_local]
 * 0 0 * * * eval_script.js
 * 
 * 2.__conf 配置说明：
 * 参考下面 __conf 示例，格式为：远程脚本的链接 url 匹配脚本对应的正则1,匹配脚本对应的正则2
 * 
 * 
 * 3.修改配置文件的本地脚本为此脚本，例如之前京东 jd_price.js 改为 eval_script.js 即可：
 * [rewrite_local]
 * # ^https?://api\.m\.jd\.com/client\.action\?functionId=(wareBusiness|serverConfig) url script-response-body jd_price.js
 * ^https?://api\.m\.jd\.com/client\.action\?functionId=(wareBusiness|serverConfig) url script-response-body eval_script.js
 * [mitm]
 * hostname = api.m.jd.com
 */

//远程配置
const __remoteConf = "https://raw.githubusercontent.com/Wangsc1/All/master/QuanX/Filter/Js_Update.conf"

//本地配置
const __conf = String.raw`

`
const __tool = new ____Tool()
const __isTask = __tool.isTask

if (__isTask) {
    const downloadScript = (url) => {
        return new Promise((resolve) => {
            __tool.get(url, (error, response, body) => {
                let filename = url.match(/.*\/(.*?)$/)[1]
                if (!error) {
                    if (response.statusCode == 200) {
                        __tool.write(body, url)
                        resolve({ body, msg: `🎉 ${filename} - update success` })
                        console.log(`Update success: ${url}`)
                    } else {
                        resolve({ body, msg: `‼️ ${filename} - update fail` })
                        console.log(`Update fail ${response.statusCode}: ${url}`)
                    }
                } else {
                    resolve({ body: null, msg: `‼️ ${filename} - update fail` })
                    console.log(`Update fail ${error}: ${url}`)
                }
            })
        })
    }

    const getConf = (() => {
        return new Promise((resolve) => {
            if (__remoteConf.length > 0) {
                downloadScript(__remoteConf).then((data) => {
                    let content = __conf
                    if (data.body) {
                        content = `${__conf}\n${____parseRemoteConf(data.body)}`
                    }
                    resolve({ content, msg: data.msg })
                })
            } else {
                resolve({ content: __conf, msg: "" })
            }
        })
    })

    getConf()
        .then((conf) => {
            console.log(conf.content);
            const parseConf = ____parseConf(conf.content)
            console.log(parseConf);
            
            const promises = (() => {
                let all = []
                Object.keys(parseConf).forEach((url) => {
                    all.push(downloadScript(url))
                })
                return all
            })()
            console.log("Start updating...")
            Promise.all(promises).then(result => {
                console.log("Stop updating.")
                const notifyMsg = (() => {
                    let msg = conf.msg
                    result.forEach(data => {
                        msg += msg.length > 0 ? "\n" + data.msg : data.msg
                    });
                    return msg
                })()
                console.log(notifyMsg)
                let lastDate = __tool.read("ScriptLastUpdateDate")
                lastDate = lastDate ? lastDate : new Date().Format("yyyy-MM-dd HH:mm:ss")
                __tool.notify("Scripts Updated.", `${lastDate} last update.`, `${notifyMsg}`)
                __tool.write(JSON.stringify(parseConf), "ScriptConfObject")
                __tool.write(new Date().Format("yyyy-MM-dd HH:mm:ss"), "ScriptLastUpdateDate")
                $done()
            })
        })
}

if (!__isTask) {
    const __url = $request.url
    const __confObj = JSON.parse(__tool.read("ScriptConfObject"))
    const __script = (() => {
        let s = null
        for (let key in __confObj) {
            let value = __confObj[key]
            if (!Array.isArray(value)) value = value.split(",")
            value.some((url) => {
                if (__url.match(url)) {
                    s = { url: key, content: __tool.read(key), match: url }
                    return true
                }
            })
        }
        return s
    })()
    if (__script) {
        if (__script.content) {
            eval(__script.content)
            console.log(`Request url: ${__url}\nMatch url: ${__script.match}\nExecute script: ${__script.url}`)
        } else {
            $done({})
            console.log(`Request url: ${__url}\nMatch url: ${__script.match}\nScript not executed. Script not found: ${__script.url}`)
        }
    } else {
        $done({})
        console.log(`No match url: ${__url}`)
    }
}

function ____parseRemoteConf(conf) {
    const lines = conf.split("\n")
    let newLines = []
    lines.forEach((line) => {
        line = line.replace(/^\s*/, "")
        if (line.length > 0 && line.substring(0, 3) == "###") {
            line = line.replace("###", "")
            line = line.replace(/^\s*/, "")
            newLines.push(line)
        }
    })
    return newLines.join("\n")
}

function ____parseConf(conf) {
    const lines = conf.split("\n")
    let confObj = {}
    lines.forEach((line) => {
        line = line.replace(/^\s*/, "")
        if (line.length > 0 && line.substring(0, 2) != "//") {
            const avaliable = (() => {
                const format = /^https?:\/\/.*\s+url\s+.*/
                return format.test(line)
            })()
            if (avaliable) {
                console.log("line: " + line);
                const value = line.split("url")
                const remote = value[0].replace(/\s/g, "")
                console.log("remote:  " + remote);
                const match = value[1].replace(/\s/g, "")
                console.log("match:  " + match);
                confObj[remote] = match
                console.log("confObj[remote]:  " + confObj[remote])
            } else {
                __tool.notify("Configuration error", "", line)
                throw "Configuration error:" + line
            }
        }
    })
    console.log(`Configuration information:  ${JSON.stringify(confObj)}`)
    return confObj
}

function ____Tool() {
    _node = (() => {
        if (typeof require == "function") {
            const request = require('request')
            return ({ request })
        } else {
            return (null)
        }
    })()
    _isSurge = typeof $httpClient != "undefined"
    _isQuanX = typeof $task != "undefined"
    _isTask = typeof $request == "undefined"
    this.isSurge = _isSurge
    this.isQuanX = _isQuanX
    this.isTask = _isTask
    this.isResponse = typeof $response != "undefined"
    this.notify = (title, subtitle, message) => {
        if (_isQuanX) $notify(title, subtitle, message)
        if (_isSurge) $notification.post(title, subtitle, message)
        if (_node) console.log(JSON.stringify({ title, subtitle, message }));
    }
    this.write = (value, key) => {
        if (_isQuanX) return $prefs.setValueForKey(value, key)
        if (_isSurge) return $persistentStore.write(value, key)
        if (_node) console.log(`${key} write success`);
    }
    this.read = (key) => {
        if (_isQuanX) return $prefs.valueForKey(key)
        if (_isSurge) return $persistentStore.read(key)
        if (_node) console.log(`${key} read success`);
    }
    this.get = (options, callback) => {
        if (_isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "GET"
            $task.fetch(options).then(response => { callback(null, _status(response), response.body) }, reason => callback(reason.error, null, null))
        }
        if (_isSurge) $httpClient.get(options, (error, response, body) => { callback(error, _status(response), body) })
        if (_node) _node.request(options, (error, response, body) => { callback(error, _status(response), body) })
    }
    this.post = (options, callback) => {
        if (_isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "POST"
            $task.fetch(options).then(response => { callback(null, _status(response), response.body) }, reason => callback(reason.error, null, null))
        }
        if (_isSurge) $httpClient.post(options, (error, response, body) => { callback(error, _status(response), body) })
        if (_node) _node.request.post(options, (error, response, body) => { callback(error, _status(response), body) })
    }
    _status = (response) => {
        if (response) {
            if (response.status) {
                response["statusCode"] = response.status
            } else if (response.statusCode) {
                response["status"] = response.statusCode
            }
        }
        return response
    }
}

if (!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]'
    }
}

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "H+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}