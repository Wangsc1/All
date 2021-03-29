/*
Surge：
Emby = type=http-response,pattern=^https?:\/\/mb3admin.com\/admin\/service\/registration\/validateDevice,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Scripts/Emby.js

QuanX：
^https?:\/\/mb3admin.com\/admin\/service\/registration\/validateDevice url script-response-body https://raw.githubusercontent.com/Wangsc1/All/master/Scripts/Emby.js

hostname=mb3admin.com
*/

if
($request.url.indexOf('mb3admin.com/admin/service/registration/validateDevice') != -1) {
    if($response.status!=200){
        //$notification.post("EmbyPremiere 已激活", "", "");
        $done({status: 200, headers: $response.headers, body: '{"cacheExpirationDays":999,"resultCode":"GOOD","message":"Device Valid"}' })
    }else{
        $done({})
    }
}else{
    $done({})
}