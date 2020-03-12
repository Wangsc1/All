console.log("APP监控运行")
let
apps=["1449412357","1164801111","1495946973","333710667","961390574","373311252","673907758","1423330822","945993620","393670998","1154746981","390017969","1312014438","989565871","440488550","1134218562","1373567447","1261944766","1049254261","1067198688","1371929193","1489780246","697927927","718043190","360593530","284666222","1490527415","1455832781","469338840","1355476695"]
let reg="us"
let config={
  url:'https://itunes.apple.com/lookup?id=' + apps + "&country=" + reg,
  method:"post"
}
$task.fetch(config).then((res)=>{
  let results=JSON.parse(res.body).results
  if(results.length>0){
    let app_monitor=$prefs.valueForKey("app_monitor");
    if(app_monitor==""||app_monitor==undefined){
      app_monitor={}
    }
    else{
      app_monitor=JSON.parse(app_monitor)
    }
    let notifys=[]
    let infos={}
    results.forEach((x=>{
      infos[x.trackId]={
        n:x.trackName,
        v:x.version,
        p:x.formattedPrice
      }
      if(app_monitor.hasOwnProperty(x.trackId)){
      if(JSON.stringify(app_monitor[x.trackId])!=JSON.stringify(infos[x.trackId])){
        if(x.version!=app_monitor[x.trackId].version){
          notifys.push(`🏷️${x.trackName} - 升级：${x.version}`)
        }
        if(x.formattedPrice!=app_monitor[x.trackId].formattedPrice){
                  notifys.push(`〽️${x.trackName} - 价格：${x.formattedPrice}`)
                }
      }}
      else{
        notifys.push(`🏷️${x.trackName} - 版本：${x.version}`)
        notifys.push(`〽️${x.trackName} - 价格：${x.formattedPrice}`)
      }
    }))
    infos=JSON.stringify(infos)
    $prefs.setValueForKey(infos,"app_monitor")
    if(notifys.length>0){
      notify(notifys)
    }
    else{
      console.log("APP监控：版本及价格无变化")
    }
  }
})
function notify(notifys){
  notifys=notifys.join("\n")
  console.log(notifys)
  $notify("APP监控","",notifys)
}