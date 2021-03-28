/*
Surge：
Fantastical = requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/Wangsc1/All/master/Surge/Scripts/Fantastical.js,type=http-response,pattern=^https:\/\/api\.flexibits\.com\/v1\/(auth|account)\/(device|details|appstore-receipt)\/$

QuanX：
^https:\/\/api\.flexibits\.com\/v1\/(auth|account)\/(device|details|appstore-receipt)\/$ url script-response-body https:\/\/api\.flexibits\.com\/v1\/(auth|account)\/(device|details|appstore-receipt)\/$

hostname=api.flexibits.com
*/

let url=$request.url;
let obj=JSON.parse($response.body);

if(url.indexOf('device')!=-1){

  obj.status="success";
  obj.subscription={
	  	"autorenew": true,
		"expiration": "2099-12-31T16:49:37Z",
		"expires": "2099-12-31T16:49:37Z"
  };
  obj.scope=["notify", "weather", "keyvalue-watch", "keyvalue-verification", "schedjoules", "scheduling", "account", "keyvalue", "fantastical"];
  
}

if(url.indexOf('details')!=-1){

  obj.subscription={
		"autorenew": true,
		"expiration": "2099-12-31T16:49:37.000000Z",
		"uuid": "f1da7c78-e964-4367-915c-886edc794959",
		"subscription_type": "AppStore",
		"is_expired": false,
		"trial": false
  };
}

if(url.indexOf('appstore-receipt')!=-1){
	
	obj.autorenew=true;
	obj.expiration="2099-12-31T16:49:37.000000Z";
	obj.subscription_type="AppStore";
	obj.is_expired=false;
	obj.trial=false;
}

$done({body:JSON.stringify(obj)});