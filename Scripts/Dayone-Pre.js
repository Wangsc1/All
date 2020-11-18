/*

本脚本是 dayone.js 的附属脚本，需与主脚本配合使用。具体使用方式请查看主脚本说明

http-request ^https:\/\/dayone\.me\/api\/users$ script-path=scripts/dayone-pre.js

MitM = dayone.me

*/


const headers = $request.headers
delete headers["If-None-Match"]
$done({headers})