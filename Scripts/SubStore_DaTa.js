/******************************

Sub-Store外置流量查询脚本

该脚本基于Sub-Store, 可解决APP使用Sub-Store链接后, 没有流量通知的问题. 使用前需确认您的机场订阅是否支持流量信息.
Sub-Store订阅管理器: https://github.com/Peng-YM/Sub-Store

测试兼容: QuantumultX, Surge, Loon. 
使用方法: 打开Sub-Store => 订阅 => 编辑 => 节点操作+ => 脚本操作 => 填入脚本链接或粘贴脚本 => 保存

您的APP更新Sub-Store订阅链接时, 将自动发送流量通知.

脚本链接: https://raw.githubusercontent.com/Wangsc1/All/master/Scripts/SubStore_DaTa.js

******************************/

function operator(proxies) {
  try {
    if ($request.headers["User-Agent"].match(/Quant|Surge|Loon|Decar/)) {
      function AllSubs(subsUrl, subsName) {
        $.http.get(subsUrl).then(resp => {
          try { //reference to https://github.com/KOP-XIAO/QuantumultX/blob/master/Scripts/resource-parser.js
            var sinfo = JSON.stringify(resp.headers).replace(/ /g, "").toLowerCase();
            var total = (parseFloat(sinfo.split("total=")[1].split(",")[0]) / (1024 ** 3)).toFixed(0);
            var usd = ((parseFloat(sinfo.indexOf("upload") != -1 ? sinfo.split("upload=")[1].split(",")[0] : "0") + parseFloat(sinfo.split("download=")[1].split(",")[0])) / (1024 ** 3)).toFixed(2);
            var left = ((parseFloat(sinfo.split("total=")[1].split(",")[0]) / (1024 ** 3)) - ((parseFloat(sinfo.indexOf("upload") != -1 ? sinfo.split("upload=")[1].split(",")[0] : "0") + parseFloat(sinfo.split("download=")[1].split(",")[0])) / (1024 ** 3))).toFixed(2);
            if (sinfo.indexOf("expire=") != -1) {
              var epr = new Date(parseFloat(sinfo.split("expire=")[1].split(",")[0]) * 1000);
              var year = epr.getFullYear();
              var mth = epr.getMonth() + 1 < 10 ? '0' + (epr.getMonth() + 1) : (epr.getMonth() + 1);
              var day = epr.getDate() < 10 ? "0" + (epr.getDate()) : epr.getDate();
              var epr = `🕒 过期时间:「 ${year}-${mth}-${day} 」`
            } else {
              var epr = "";
            }
            $.notify(`✈️ 订阅机场:「 ${subsName} 」`, epr, `⌛️ 已用流量:「 ${usd} GB 」\n⏳ 剩余流量:「 ${left} GB 」`)
          } catch (errInfo) {
            console.log(`\n✈️ 订阅机场:「 ${subsName} 」\n‼️ 查询失败: ${errInfo}`)
          }
        }, er => $.notify(`✈️ 订阅机场:「 ${subsName} 」`, ``, `‼️ 查询失败: ${er}`))
      }
      const subtag = $request.url.match(/download\/(collection\/)?([\w-_]*)/)[2]
      const rawInfo = $.read('subs')
      if ($request.url.match(/\/collection\//)) {
        const readName = $.read('collections')
        for (var i = 0; i < readName[subtag].subscriptions.length; i++) {
          const rawUrl = rawInfo[readName[subtag].subscriptions[i]].url;
          const rawName = readName[subtag].subscriptions[i];
          AllSubs(rawUrl, rawName);
        }
      } else {
        AllSubs(rawInfo[subtag].url, rawInfo[subtag].name);
      }
    }
  } catch (err) {
    console.log(`\n‼️ 查询失败: \n${err.message}`)
  } finally {
    return proxies
  }
}