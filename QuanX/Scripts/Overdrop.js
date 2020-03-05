let body= $response.body; 
var obj = JSON.parse(body); 
obj.active_subscriptions = true;
$done({body: JSON.stringify(obj)});