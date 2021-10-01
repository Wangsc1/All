 const { wifi, v4, v6 } = $network;

 let carrierName = '';
 const carrierNames = {
   '460-03': '中国电信','460-05': '中国电信','460-11': '中国电信',
   '460-01': '中国联通','460-06': '中国联通','460-09': '中国联通',
   '460-00': '中国移动','460-02': '中国移动','460-04': '中国移动','460-07': '中国移动','460-08': '中国移动',
 };
 
 if (!v4.primaryAddress && !v6.primaryAddress) {
   $done({
     title: '未连接网络',
     content: '请检查网络设置后重试',
     icon: 'wifi.exclamationmark',
     'icon-color': '#CB1B45',
   });
 } else {
   if ($network['cellular-data']) {
     const carrierId = $network['cellular-data'].carrier;
     const radio = $network['cellular-data'].radio;
     if (carrierId && radio) {
       carrierName = carrierNames[carrierId] ? ' - ' + carrierNames[carrierId] + ' ' + radio : ' - ' + radio;
     }
   }
   $httpClient.get('http://ip-api.com/json', function (error, response, data) {
     if (error) {
       $done({
         title: '发生错误',
         content: '请检查网络状态后重试',
         icon: 'wifi.exclamationmark',
         'icon-color': '#CB1B45',
       });
     }
     
     const info = JSON.parse(data);
     $done({
       title: wifi.ssid ? wifi.ssid : '蜂窝数据' + carrierName,
       content:
         (v4.primaryAddress ? `IPv4 : ${v4.primaryAddress} \n` : '') +
        // (v6.primaryAddress ? `IPv6 : ${v6.primaryAddress}\n` : '') +
         (v4.primaryRouter && wifi.ssid
           ? `Router IPv4 : ${v4.primaryRouter}\n`
           : '') +
         (v6.primaryRouter && wifi.ssid
           ? `Router IPv6 : ${v6.primaryRouter}\n`
           : '') +
         `节点 IP : ${info.query}\n` +
         `节点 ISP : ${info.isp}\n` +
         `节点LOC : ${getFlagEmoji(info.countryCode)} ${info.countryCode} - ${
           info.city
         }`,
       icon: wifi.ssid ? 'wifi.circle.fill' : 'antenna.radiowaves.left.and.right.circle.fill',
       'icon-color': wifi.ssid ? '#3478F6' : '#65C466',
     });
   });
 }
 
 function getFlagEmoji(countryCode) {
   const codePoints = countryCode
     .toUpperCase()
     .split('')
     .map((char) => 127397 + char.charCodeAt());
   return String.fromCodePoint(...codePoints);
 } 