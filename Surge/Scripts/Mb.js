var obj = JSON.parse($response.body);
 obj={
 "code": 0,
 "msg": null,
 "data": {
  "level": 1,
  "phone": null,
  "encryptPassword": null,
  "id": 4960640,
  "passSecure": false,
  "vipEndDate": "20291121"
 }
};
$done({body: JSON.stringify(obj)});
//
