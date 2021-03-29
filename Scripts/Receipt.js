/*
Surge：
Receipt = type=http-response,pattern=^https:\/\/buy\.itunes\.apple\.com\/verifyReceipt$,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Receipt.js

QuanX：
^https:\/\/buy\.itunes\.apple\.com\/verifyReceipt$ url script-response-body https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Receipt.js

hostname=buy.itunes.apple.com
*/

let body= $response.body;
var obj = JSON.parse(body);
if (body.indexOf("expires") !=-1) {
  obj["receipt"]["in_app"][0]["expires_date"] = "2099-10-19 05:14:18 Etc/GMT";
  obj["receipt"]["in_app"][0]["expires_date_pst"] = "2099-10-18 22:14:18 America/Los_Angeles";
  obj["receipt"]["in_app"][0]["expires_date_ms"] = "4096019658000";
  obj["latest_receipt_info"][0]["expires_date"] = "2099-10-19 05:14:18 Etc/GMT";
  obj["latest_receipt_info"][0]["expires_date_pst"] = "2099-10-18 22:14:18 America/Los_Angeles";
  obj["latest_receipt_info"][0]["expires_date_ms"] = "4096019658000";
  }
$done({body: JSON.stringify(obj)});