/*
"滴滴出行" app 自动签到，支持 Quantumult X（理论上也支持 Surge、Loon，未尝试）。
请先按下述方法进行配置，进入"滴滴出行"，若弹出"首次写入滴滴出行 Token 成功"即可正常食用，先手动运行一次脚本，弹出成功后回到"滴滴出行"，点击右上角"天天领福利"查看福利金是否到账，其他提示或无提示请发送日志信息至 issue。
到 cron 设定时间自动签到时，若弹出"滴滴出行 - 签到成功"即完成签到，其他提示或无提示请发送日志信息至 issue。

⚠️免责声明：
1. 此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2. 由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3. 请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4. 此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5. 本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6. 如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7. 所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。

Author：zZPiglet

----------
版本记录：
- 2020/06/09：
测试阶段，可能会出现各种问题，希望因脚本出现问题可及时反馈。
增加自动签到领取福利金。
脚本中使用了我的邀请打卡 aff（每日最多 5 次，每次 60 福利金。），若不希望使用，可将 aff 改为 false。
代办：增加自动领取打车后未领取的福利金/打车金。
常见错误：
1. 若是 Token 获取问题请先自行排查重写及主机名是否正确，若均正确且日志无报错的情况下无法获取，请反馈，并最好能提供抓包记录（打开抓包软件，然后再进入滴滴，进入打车的界面之后关闭抓包的软件，导出这个包私发给我就行）。
2. 提示"签到失败‼️ 详情请见日志。"，可将日志信息私发给我。若日志信息含有"500 Server internal error"，且着急签到，可尝试将 aff 改为 false 后运行一次脚本，并反馈是否还存在问题。
----------

Quantumult X (App Store:1.0.5+, TestFlight 190+):
[task_local]
1 0 * * * DiDi.js, tag=滴滴出行
or remote
1 0 * * * https://raw.githubusercontent.com/zZPiglet/Task/master/DiDi/DiDi.js, tag=滴滴出行

[rewrite_local]
^https:\/\/as\.xiaojukeji\.com\/ep\/as\/toggles\? url script-request-header DiDi.js
or remote
^https:\/\/as\.xiaojukeji\.com\/ep\/as\/toggles\? url script-request-header https://raw.githubusercontent.com/zZPiglet/Task/master/DiDi/DiDi.js


Surge 4.0+ & Loon:
[Script]
cron "1 0 * * *" script-path=https://raw.githubusercontent.com/zZPiglet/Task/master/DiDi/DiDi.js
http-request ^https:\/\/as\.xiaojukeji\.com\/ep\/as\/toggles\? script-path=https://raw.githubusercontent.com/zZPiglet/Task/master/DiDi/DiDi.js

All app:
[mitm]
hostname = as.xiaojukeji.com

获取完 Token 后可不注释 rewrite / hostname，Token 更新时会弹窗。若因 MitM 导致该软件或小程序网络不稳定，可注释掉 hostname。
*/

const aff = true //若不想提供 aff 请改为 false。
const mainURL = 'https://bosp-api.xiaojukeji.com/wechat/benefit/public/index?'
const TokenName = '滴滴出行'
const TokenKey = 'DiDi'
const CityKey = 'DiDi_city'
const reg = /^https:\/\/as\.xiaojukeji\.com\/ep\/as\/toggles\?.*city=(\d*)&.*ticket=(.*)&/
const source_id = ['WTZs7tfSPrADJ8uLRVMOKA%253D%253D', 'DRKV%252BEcE4Gqn%252BH1mKz2HQg%253D%253D']
const today = new Date().getFullYear() + "-" + ("00" + Number(new Date().getMonth() + 1)).substr(-2) + "-" + ("00" + new Date().getDate()).substr(-2)
const $cmp = compatibility()

if ($cmp.isRequest) {
    GetToken()
    $cmp.done()
} else {
    Checkin()
    $cmp.done()
}

function GetToken() {
    if ($request) {
        const requrl = $request.url
        let TokenValue = decodeURIComponent(reg.exec(requrl)[2])
        let CityValue = reg.exec(requrl)[1]
        $cmp.write(CityValue, CityKey)
        if ($cmp.read(TokenKey) != (undefined || null)) {
            if ($cmp.read(TokenKey) != TokenValue) {
                let token = $cmp.write(TokenValue, TokenKey)
                if (!token) {
                    $cmp.notify("更新" + TokenName + " Token 失败‼️", "", "")
                } else {
                    $cmp.notify("更新" + TokenName + " Token 成功 🎉", "", "")
                }
            }
        } else {
            let token = $cmp.write(TokenValue, TokenKey)
            if (!token) {
                $cmp.notify("首次写入" + TokenName + " Token 失败‼️", "", "")
            } else {
                $cmp.notify("首次写入" + TokenName + " Token 成功 🎉", "", "")
            }
        }
    } else {
        $cmp.notify("写入" + TokenName + "Token 失败‼️", "", "配置错误, 无法读取请求头, ")
    }
}

function Choose(v) {
    let r = Math.floor(Math.random() * Math.floor(2))
    return v[r]
}

function isJSON(str) {
    if (typeof str == 'string') {
        try {
            let obj = JSON.parse(str)
            if (typeof obj == 'object' && obj) {
                return obj
            } else {
                return false
            }
        } catch (e) {
            return false
        }
    }
    return false
}

function Checkin() {
    let subTitle = ''
    let detail = ''
    let CheckinURL = mainURL + 'city_id=' + $cmp.read("DiDi_city")
    if (aff) {
        let s_i = Choose(source_id)
        $cmp.log("DiDi aff : \n" + s_i)
        CheckinURL += '&share_source_id=' + s_i + '&share_date=' + today
    }
    const didi = {
        url: CheckinURL,
        headers: {
            "Didi-Ticket": $cmp.read("DiDi"),
        }
    }
    $cmp.get(didi, function(error, response, data) {
        if (!error) {
            if (response.statusCode == 403) {
                subTitle += 'Token 未获取或失效❗'
                detail += '请按脚本开头注释完成配置并首次或重新获取 Token。'
            } else {
                const result = isJSON(data)
                if (result && result.errno == 0) {
                    if(result.data.sign.sign) {
                        subTitle += '签到成功！🚕'
                        let todayearn = Number(result.data.sign.sign.subsidy_state.subsidy_amount + result.data.sign.sign.subsidy_state.extra_subsidy_amount)
                        detail += '签到获得 ' + todayearn + ' 福利金，'
                    } else {
                        subTitle += '重复签到！🚖'
                    }
                    let total = result.data.welfare.balance
                    detail += '账户共有 ' + total + ' 福利金，可抵扣 ' + total/100 + ' 元。'
                    for (let message of result.data.notification.reverse()) {
                        detail += '\n' + message
                    }
                    $cmp.log("DiDi source_id : \n" + result.data.share.source_id)
                } else if (result && result.errno == 101) {
                    subTitle += '签到失败‼️ 城市代码错误。'
                    detail += '请重新获取 Token。\n' + result.errmsg
                } else {
                    subTitle += '签到失败‼️ 详情请见日志。'
                    detail += data
                    $cmp.log("DiDi failed response : \n" + data)
                }
            }
        } else {
            subTitle += '签到接口请求失败，详情请见日志。'
            detail += error
            $cmp.log("DiDi failed response : \n" + error)
        }
        $cmp.notify(TokenName, subTitle, detail)
    })
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,o)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=e&&e.timeout?e.timeout:o;const[r,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":r,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),o=JSON.stringify(this.data);s?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(e,o):this.fs.writeFileSync(t,o)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return s;return o}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),o=s?this.getval(s):"";if(o)try{const t=JSON.parse(o);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(e),r=this.getval(i),h=i?"null"===r?null:r||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,o,t),s=this.setval(JSON.stringify(e),i)}catch(e){const r={};this.lodash_set(r,o,t),s=this.setval(JSON.stringify(r),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:o,body:r}=t;e(null,{status:s,statusCode:i,headers:o,body:r},r)},t=>e(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:o,body:r}=t;e(null,{status:s,statusCode:i,headers:o,body:r},r)},t=>e(t)))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:o,body:r}=t;e(null,{status:s,statusCode:i,headers:o,body:r},r)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:o,body:r}=t;e(null,{status:s,statusCode:i,headers:o,body:r},r)},t=>e(t))}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",o){const r=t=>{if(!t||!this.isLoon()&&this.isSurge())return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,r(o)):this.isQuanX()&&$notify(e,s,i,r(o)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}