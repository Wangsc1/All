/*
Surge：
Noto = type=http-response,pattern=^https:\/\/api\.revenuecat\.com\/.+\/(receipts$|subscribers\/[a-zA-Z0-9_-]*$),requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Noto.js

QuanX：
^https:\/\/api\.revenuecat\.com\/.+\/(receipts$|subscribers\/[a-zA-Z0-9_-]*$) url script-response-body https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Noto.js

hostname = api.revenuecat.com
*/

let obj = JSON.parse($response.body);
obj["subscriber"]["subscriptions"]= {
      "revenuecat.pro.yearly": {
        "is_sandbox": false,
        "period_type": "active",
        "billing_issues_detected_at": null,
        "unsubscribe_detected_at": null,
        "expires_date": "2059-12-01T03:51:32Z",
        "original_purchase_date": "2019-10-31T02:51:33Z",
        "purchase_date": "2019-10-31T02:51:32Z",
        "store": "app_store"
      }
    };
obj["subscriber"]["entitlements"]= {
      "pro": {
        "expires_date": "2059-12-01T03:51:32Z",
        "product_identifier": "revenuecat.pro.yearly",
        "purchase_date": "2019-10-31T02:51:32Z"
      }
    };
$done({body: JSON.stringify(obj)});
