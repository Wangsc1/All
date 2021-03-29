/*
Surge：
PhotoShop = type=http-response,pattern=^^https:\/\/lcs-mobile-cops\.adobe\.io\/mobile_profile,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/PhotoShop.js

QuanX：
^https:\/\/lcs-mobile-cops\.adobe\.io\/mobile_profile url script-response-body https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/PhotoShop.js

hostname=lcs-mobile-cops.adobe.io
*/

let obj = JSON.parse($response.body)
let pro= obj["mobileProfile"];
pro["profileStatus"] = "PROFILE_AVAILABLE";
pro["legacyProfile"] = "{}";
pro["relationshipProfile"] = "[]";
$done({body: JSON.stringify(obj)})