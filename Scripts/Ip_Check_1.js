 const { wifi, v4 } = $network;
 const v4IP = v4.primaryAddress;
 let url = "http://ip-api.com/json"

 ;(async () => {
    let result ={
        title: "网络信息",
        content: "尚未连接网络\n请检查网络设置后重试",
        icon: "wifi.exclamationmark",
        'icon-color': "#CB1B45"
    }
    // No network connection
    if (!v4IP) {
        result['title'] = "网络信息"
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
        result['content'] = (wifi.ssid ? `路由 IP：  ${router}\n` : "")
                            + (wifi.ssid ? `本机 IP：  ${ip} \n` : `本机 IP：  ${ip} \n`)
                            + (wifi.ssid ? `节点 IP：  ${externalIP}\n` : `节点 IP：  ${externalIP}\n`)
                            + (wifi.ssid ? `节点 ISP :  ${isp}\n` : `节点 ISP :  ${isp}\n`)
                            + (wifi.ssid ? `节点LOC : ${country} - ${city}` : `节点LOC : ${country} - ${city}`)
        result['icon'] = wifi.ssid ? "wifi.circle.fill" : "antenna.radiowaves.left.and.right.circle.fill"
        result['icon-color'] = wifi.ssid ? "#3478F6" : "#65C466"
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