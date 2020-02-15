var obj = JSON.parse($response.body);
 obj={
 "data": {
  "level": 2,
  "status": 1,
  "openTime": "2019-11-21",
  "startTime": "2019-11-21",
  "endTime": "2029-11-20",
  "shareToken": ""
 },
 "code": 0,
 "msg": "返回成功"
};
$done({body: JSON.stringify(obj)});
//
