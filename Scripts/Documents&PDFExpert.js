/*
Surge：
Documents&PDFExpert = type=http-response,pattern=https:\/\/license\.pdfexpert\.com\/api\/.*\/(documents|pdfexpert6)\/subscription\/(refresh$|check$),requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Documents&PDFExpert.js

QuanX：
^https:\/\/license\.pdfexpert\.com\/api\/.*\/(documents|pdfexpert6)\/subscription\/(refresh$|check$) url script-response-body https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Documents&PDFExpert.js

hostname = license.pdfexpert.com
*/

var obj = JSON.parse($response.body);

obj["isInGracePeriod"] = false;
obj["isEligibleForIntroPeriod"] = false;

obj["subscriptionState"] = "active";
obj["subscriptionExpirationDate"] = "23:59 31/12/2029";
obj["subscriptionAutoRenewStatus"] = "autoRenewOff";

$done({body: JSON.stringify(obj)});