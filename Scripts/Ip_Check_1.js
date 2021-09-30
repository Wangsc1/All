 const { wifi, v4 } = $network;
 const v4IP = v4.primaryAddress;
 let url = "http://ip-api.com/json"

 ;(async () => {
    let result ={
        title: "Network Info Panel",
        content: "尚未连接网络\n请检查网络设置后重试",
        icon: "wifi.exclamationmark",
        'icon-color': "#CB1B45"
    }
    // No network connection
    if (!v4IP) {
        result['title'] = "Network Info Panel"
        result['content'] = "尚未连接网络\n请检查网络设置后重试"
        result['icon'] = "wifi.exclamationmark"
        result['icon-color'] = "#CB1B45"
        $done(result)
        return
    }
    const ip = v4IP;
    const router = wifi.ssid ? v4.primaryRouter : undefined;
    
    $httpClient.get(url, function(error, response, data){
        let jsonData = JSON.parse(data)
        let externalIP = jsonData.query
        let country = jsonData.country
        let emoji = getFlagEmoji(jsonData.countryCode)
        let city = jsonData.city
        let isp = jsonData.isp
        result['title'] =  wifi.ssid ? wifi.ssid : "蜂窝网络  |  中国联通"
        result['content'] = (wifi.ssid ? `路由 IP：${router}\n` : "")
                            + (wifi.ssid ? `內部 IP：${ip} \n` : `內部 IP：${ip} \n`)
                            + (wifi.ssid ? `外部 IP：${externalIP}\n` : `外部 IP：${externalIP}\n`)
                            + (wifi.ssid ? `节点 ISP : ${isp}\n` : `节点 ISP : ${isp}\n`)
                            + (wifi.ssid ? `节点LOC : ${emoji} ${country} | ${city}` : `节点位置 : ${emoji} ${country} | ${city}`)
        result['icon'] = wifi.ssid ? "wifi.circle.fill" : "antenna.radiowaves.left.and.right.circle.fill"
        result['icon-color'] = wifi.ssid ? "#56A4D8" : "#65C466"
        $done(result)
        return
    })
 })()
 
 function getFlagEmoji(countryCode) {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char =>  127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}
 // OpenAPI
 // prettier-ignore
 function ENV() { const e = "undefined" != typeof $task, t = "undefined" != typeof $loon, s = "undefined" != typeof $httpClient && !t, n = "function" == typeof require && "undefined" != typeof $jsbox, i = "function" == typeof require && !n, o = "undefined" != typeof $request, r = "undefined" != typeof importModule; return { isQX: e, isLoon: t, isSurge: s, isNode: i, isJSBox: n, isRequest: o, isScriptable: r } } function HTTP(e = { baseURL: "" }) { function t(t, u) { u = "string" == typeof u ? { url: u } : u; const c = e.baseURL; c && !a.test(u.url || "") && (u.url = c ? c + u.url : u.url), u.body && u.headers && !u.headers["Content-Type"] && (u.headers["Content-Type"] = "application/x-www-form-urlencoded"), u = { ...e, ...u }; const h = u.timeout, l = { onRequest: () => { }, onResponse: e => e, onTimeout: () => { }, ...u.events }; let f, d; if (l.onRequest(t, u), s) f = $task.fetch({ method: t, ...u }); else if (n || i || r) f = new Promise((e, s) => { const n = r ? require("request") : $httpClient; n[t.toLowerCase()](u, (t, n, i) => { t ? s(t) : e({ statusCode: n.status || n.statusCode, headers: n.headers, body: i }) }) }); else if (o) { const e = new Request(u.url); e.method = t, e.headers = u.headers, e.body = u.body, f = new Promise((t, s) => { e.loadString().then(s => { t({ statusCode: e.response.statusCode, headers: e.response.headers, body: s }) }).catch(e => s(e)) }) } const p = h ? new Promise((e, s) => { d = setTimeout(() => (l.onTimeout(), s(`${t} URL: ${u.url} exceeds the timeout ${h} ms`)), h) }) : null; return (p ? Promise.race([p, f]).then(e => (clearTimeout(d), e)) : f).then(e => l.onResponse(e)) } const { isQX: s, isLoon: n, isSurge: i, isScriptable: o, isNode: r } = ENV(), u = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"], a = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, c = {}; return u.forEach(e => c[e.toLowerCase()] = (s => t(e, s))), c } function API(e = "untitled", t = !1) { const { isQX: s, isLoon: n, isSurge: i, isNode: o, isJSBox: r, isScriptable: u } = ENV(); return new class { constructor(e, t) { this.name = e, this.debug = t, this.http = HTTP(), this.env = ENV(), this.node = (() => { if (o) { const e = require("fs"); return { fs: e } } return null })(), this.initCache(); const s = (e, t) => new Promise(function (s) { setTimeout(s.bind(null, t), e) }); Promise.prototype.delay = function (e) { return this.then(function (t) { return s(e, t) }) } } initCache() { if (s && (this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}")), (n || i) && (this.cache = JSON.parse($persistentStore.read(this.name) || "{}")), o) { let e = "root.json"; this.node.fs.existsSync(e) || this.node.fs.writeFileSync(e, JSON.stringify({}), { flag: "wx" }, e => console.log(e)), this.root = {}, e = `${this.name}.json`, this.node.fs.existsSync(e) ? this.cache = JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)) : (this.node.fs.writeFileSync(e, JSON.stringify({}), { flag: "wx" }, e => console.log(e)), this.cache = {}) } } persistCache() { const e = JSON.stringify(this.cache, null, 2); s && $prefs.setValueForKey(e, this.name), (n || i) && $persistentStore.write(e, this.name), o && (this.node.fs.writeFileSync(`${this.name}.json`, e, { flag: "w" }, e => console.log(e)), this.node.fs.writeFileSync("root.json", JSON.stringify(this.root, null, 2), { flag: "w" }, e => console.log(e))) } write(e, t) { if (this.log(`SET ${t}`), -1 !== t.indexOf("#")) { if (t = t.substr(1), i || n) return $persistentStore.write(e, t); if (s) return $prefs.setValueForKey(e, t); o && (this.root[t] = e) } else this.cache[t] = e; this.persistCache() } read(e) { return this.log(`READ ${e}`), -1 === e.indexOf("#") ? this.cache[e] : (e = e.substr(1), i || n ? $persistentStore.read(e) : s ? $prefs.valueForKey(e) : o ? this.root[e] : void 0) } delete(e) { if (this.log(`DELETE ${e}`), -1 !== e.indexOf("#")) { if (e = e.substr(1), i || n) return $persistentStore.write(null, e); if (s) return $prefs.removeValueForKey(e); o && delete this.root[e] } else delete this.cache[e]; this.persistCache() } notify(e, t = "", a = "", c = {}) { const h = c["open-url"], l = c["media-url"]; if (s && $notify(e, t, a, c), i && $notification.post(e, t, a + `${l ? "\n多媒体:" + l : ""}`, { url: h }), n) { let s = {}; h && (s.openUrl = h), l && (s.mediaUrl = l), "{}" === JSON.stringify(s) ? $notification.post(e, t, a) : $notification.post(e, t, a, s) } if (o || u) { const s = a + (h ? `\n点击跳转: ${h}` : "") + (l ? `\n多媒体: ${l}` : ""); if (r) { const n = require("push"); n.schedule({ title: e, body: (t ? t + "\n" : "") + s }) } else console.log(`${e}\n${t}\n${s}\n\n`) } } log(e) { this.debug && console.log(`[${this.name}] LOG: ${this.stringify(e)}`) } info(e) { console.log(`[${this.name}] INFO: ${this.stringify(e)}`) } error(e) { console.log(`[${this.name}] ERROR: ${this.stringify(e)}`) } wait(e) { return new Promise(t => setTimeout(t, e)) } done(e = {}) { s || n || i ? $done(e) : o && !r && "undefined" != typeof $context && ($context.headers = e.headers, $context.statusCode = e.statusCode, $context.body = e.body) } stringify(e) { if ("string" == typeof e || e instanceof String) return e; try { return JSON.stringify(e, null, 2) } catch (e) { return "[object Object]" } } }(e, t) }