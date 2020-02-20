var obj = JSON.parse($response.body);
 obj={
 "code": 0,
 "msg": null,
 "data": {
  "level": 2,
  "phone": null,
  "encryptPassword": null,
  "id": 4960640,
  "passSecure": false,
  "vipEndDate": "20291121"
 }
};
$done({body: JSON.stringify(obj)});
//
