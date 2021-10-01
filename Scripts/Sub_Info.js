(async () => {
  let params = getUrlParams($argument)
  let resetDay = parseInt(params["reset_day"]);
  let resetLeft = getRmainingDays(resetDay);
  let usage = await getDataUsage(params.url);
  let used = usage.download + usage.upload;
  let total = usage.total;
  let expire = usage.expire || params.expire;
  let infoList = [`流量：${bytesToSize(used)} | ${bytesToSize(total)}`];

  if (resetLeft) {
    infoList.push(`重置：剩余${resetLeft}天`);
  }
  if (expire) {
    if (/^[\d]+$/.test(expire)) expire *= 1000;
    infoList.push(`到期：${formatTime(expire)}`);
  }

  let body = infoList.join("\n");
  $done({
		title: `Exflux`,
		content: body,
               icon : params.icon || "airplane.circle.fill",
               "icon-color": params.color || "#C3291C",
	});
})();

function getUrlParams(url) {
  return Object.fromEntries(
    url
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}

function getUserInfo(url) {
  let request = { headers: { "User-Agent": "Quantumult%20X" }, url };
  return new Promise((resolve) =>
        $httpClient.head(request, (err, resp) => {
          if (err) $done();
          resolve(
            resp.headers[
              Object.keys(resp.headers).find(
                (key) => key.toLowerCase() === "subscription-userinfo"
              )
            ]
          );
        }),
  );
}

async function getDataUsage(url) {
  let info = await getUserInfo(url);
  if (!info) {
    $notification.post("SubInfo", "", "链接响应头不带有流量信息");
    $done();
  }
  return Object.fromEntries(
    info
      .match(/\w+=\d+/g)
      .map((item) => item.split("="))
      .map(([k, v]) => [k, parseInt(v)])
  );
}

function getRmainingDays(resetDay) {
  let now = new Date();
  let today = now.getDate();
  let month = now.getMonth();
  let year = now.getFullYear();
  if (!resetDay) return 0;
  let daysInMonth = new Date(year, month + 1, 0).getDate();
  
  if (resetDay > today) daysInMonth = 0;

  return daysInMonth - today + resetDay;
}

function bytesToSize(bytes) {
  if (bytes === 0) return "0B";
  let k = 1024;
  sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}

function formatTime(time) {
  let dateObj = new Date(time);
  let year = dateObj.getFullYear();
  let month = dateObj.getMonth() + 1;
  month = month < 10 ? '0' + month : month
  let day = dateObj.getDate();
  day = day < 10 ? '0' + day : day
  return year + "-" + month + "-" + day + "";
}