/*
App Pricer for Surge by Neurogram

 - App 价格监控
 
使用说明：https://www.notion.so/neurogram/App-Pricer-bb7f6877caa24e8584cc63bddf6e555a

关于作者
Telegram: Neurogram
GitHub: Neurogram-R
*/

const region = "us"
const appIds = ["447188370","373311252","673907758","1423330822","945993620","393670998","1154746981","390017969","1312014438","989565871","440488550","1134218562","1373567447","1261944766","1049254261","1067198688","1371929193","1489780246","697927927","718043190","360593530","284666222","1490527415","1455832781","469338840","1355476695"]

var cacheData = $persistentStore.read()
if (!cacheData) {
    cacheData = {}
} else {
    cacheData = JSON.parse(cacheData)
}

$httpClient.post('https://itunes.apple.com/lookup?id=' + appIds + "&country=" + region, function (error, response, data) {
    if (error) {
        console.log(error);
        $notification.post("App Pricer", "获取价格失败")
        $done()
    } else {
        let appData = JSON.parse(data).results
        let priceChanged = ""
        let newAppAdded = ""
        for (var i = 0; i < appData.length; i++) {
            if (cacheData[appData[i].trackId]) {
                if (appData[i].formattedPrice != cacheData[appData[i].trackId].price) {
                    priceChanged = priceChanged + "🏷 " + appData[i].trackName + "  " + cacheData[appData[i].trackId].price + " 〽️ " + appData[i].formattedPrice + "\n"
                    cacheData[appData[i].trackId].price = appData[i].formattedPrice
                }
            } else {
                newAppAdded = newAppAdded + "🏷 " + appData[i].trackName + "  " + appData[i].formattedPrice + "\n"
                cacheData[appData[i].trackId] = {
                    name: appData[i].trackName,
                    price: appData[i].formattedPrice
                }
            }
        }
        if (priceChanged) {
            $notification.post("价格有变化", "", priceChanged)
        }
        if (newAppAdded) {
            $notification.post("新添加应用", "", newAppAdded)
        }
        $persistentStore.write(JSON.stringify(cacheData))
        $done()
    }
})
