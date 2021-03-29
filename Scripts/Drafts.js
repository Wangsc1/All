/*
Surge：
Drafts = type=http-response,requires-body=1,max-size=0,pattern=https:\/\/backend\.getdrafts\.com\/api\/.*\/verification*,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Drafts.js

QuanX：
https:\/\/backend\.getdrafts\.com\/api\/.*\/verification* url script-response-body https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Drafts.js

hostname = backend.getdrafts.com
*/

var obj = JSON.parse($response.body);

obj= {
  "active_expires_at" : "2099-01-01T00:00:00Z",
  "is_subscription_active" : true,
  "active_subscription_type" : "premium",
  "is_blocked" : false
};

$done({body: JSON.stringify(obj)});

// Descriptions
