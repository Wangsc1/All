 const { wifi, v4, v6 } = $network;

 let cellularInfo = '';
 const carrierNames = {
   '460-03': '中国电信','460-05': '中国电信','460-11': '中国电信',
   '460-01': '中国联通','460-06': '中国联通','460-09': '中国联通',
   '460-00': '中国移动','460-02': '中国移动','460-04': '中国移动','460-07': '中国移动','460-08': '中国移动',
 };
 
const radioGeneration = {
   'GPRS': '2.5G',
   'CDMA1x': '2.5G',
   'EDGE': '2.75G',
   'WCDMA': '3G',
   'HSDPA': '3.5G',
   'CDMAEVDORev0': '3.5G',
   'CDMAEVDORevA': '3.5G',
   'CDMAEVDORevB': '3.75G',
   'HSUPA': '3.75G',
   'eHRPD': '3.9G',
   'LTE': '4G',
   'NRNSA': '5G',
   'NR': '5G',
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
       cellularInfo = carrierNames[carrierId] ?
         carrierNames[carrierId] + ' ' + radioGeneration[radio]:
         '蜂窝网络 - ' + radioGeneration[radio];
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
       title: wifi.ssid ? wifi.ssid : cellularInfo,
       content:
         (v4.primaryAddress ? `IPv4 : ${v4.primaryAddress} \n` : '') +
        // (v6.primaryAddress ? `IPv6 : ${v6.primaryAddress}\n` : '') +
        // (v4.primaryRouter && wifi.ssid ? `Router IPv4 : ${v4.primaryRouter}\n` : '') +
        // (v6.primaryRouter && wifi.ssid ? `Router IPv6 : ${v6.primaryRouter}\n` : '') +
         `SVR IP : ${info.query}\n` +
         `SVR ISP : ${info.isp}\n` +
         `SVR LOC : ${getFlagEmoji(info.countryCode)} ${info.countryCode} - ${
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