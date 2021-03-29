/*
Surge：
Dayone-Pre = type=http-request,pattern=^https:\/\/dayone\.me\/api\/users$,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Scripts/DayOne-Pre.js

QuanX：
^https:\/\/dayone\.me\/api\/users$ url script-request-header https://raw.githubusercontent.com/Wangsc1/All/master/Scripts/DayOne-Pre.js

hostname = dayone.me
*/

const headers = $request.headers
delete headers["If-None-Match"]
$done({headers})