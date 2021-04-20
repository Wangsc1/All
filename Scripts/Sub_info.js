/*
作者 @mieqq

Surge显示机场的流量信息，url请求头中必须带有流量信息，并且需要urlencode

[Proxy Group]
ExFlux = select, policy-path=http://t.tt?url=, update-interval=3600

[Script]
Sub_info = type=http-request,pattern=http://t\.tt,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Scripts/Sub_info.js
*/

let params = getUrlParams($request.url);
const url = params.url;

(async () => {
  let info = await getUserInfo();
  let usage = getDataUsage(info);
  let used = bytesToSize(parseInt(usage.download) + parseInt(usage.upload));
  let total = bytesToSize(usage.total);
  let expire = usage.expire == undefined ? '' : '🕒' + formatTimestamp(usage.expire * 1000)
  let body = `${used}/${total}${expire}  = ss, 1.2.3.4, 1234, encrypt-method=aes-128-gcm,password=1234`;
    $done({response: {body}});
})();

function getUrlParams(search) {
    const hashes = search.slice(search.indexOf('?') + 1).split('&')
    const params = {}
    hashes.map(hash => {
        const [key, val] = hash.split('=')
        params[key] = decodeURIComponent(val)
    })
    return params
}

function getUserInfo() {
  return new Promise(resolve => $httpClient.head(url, (err, resp) => resolve(resp.headers["subscription-userinfo"])));
}

function getDataUsage(info) {
  return Object.fromEntries(
    info.split("; ").map(item => item.split("="))
  );
}

function bytesToSize(bytes) {
    if (bytes === 0) return '0B';
    var k = 1024;
    sizes = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + sizes[i];
}

function formatTimestamp( timestamp ) {
    var dateObj = new Date( timestamp );
    var year = dateObj.getYear() + 1900;
    var month = dateObj.getMonth() + 1;
    month = month < 10 ? '0' + month : month
    var day = dateObj.getDate();
    day = day < 10 ? '0' + day : day
    return year +"-"+ month +"-" + day;      
}