const { wifi, v4 } = $network;

// No network connection
if (!v4.primaryAddress) {
    $done({
      title: "网络信息",
        content: "尚未连接网络\n请检查网络设置后重试",
      icon: 'wifi.exclamationmark',
      'icon-color': '#CB1B45',
    });
  }
else{
  $httpClient.get('http://ip-api.com/json', function (error, response, data) {
    const jsonData = JSON.parse(data);
    $done({
      title: wifi.ssid ? wifi.ssid : '蜂窝网络',
      content:
(v4.primaryRouter && wifi.ssid ? `路由IP : ${v4.primaryRouter}\n` : '') +
        (v4.primaryAddress ? `本机IP : ${v4.primaryAddress} \n` : '') +
        `节点IP : ${jsonData.query}\n` +
        `节点ISP : ${jsonData.isp}\n` +
        `节点LOC : ${jsonData.country} - ${jsonData.city}`,
      icon: wifi.ssid ? 'wifi.circle.fill' : 'antenna.radiowaves.left.and.right.circle.fill',
      'icon-color': wifi.ssid ? '#3478F6' : '#65C466',
    });
  });
};

function getFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}