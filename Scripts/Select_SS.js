;(async () => {

let params = getParams($argument);
let group=params.group;
let proxy = await httpAPI("/v1/policy_groups");
let groupName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(group)+"")).policy;
var proxyName= [];
let arr = proxy[""+group+""];
let allGroup = [];

for (var key in proxy){
   allGroup.push(key)
    }


for (let i = 0; i < arr.length; ++i) {
proxyName.push(arr[i].name);
}

let index;

for(let i = 0;i < proxyName.length; ++i) {
	if(groupName==proxyName[i]){
index=i
	}
};

if($trigger == "button"){
index += 1;

if(index>arr.length-1){
	index = 0;
	}
$surge.setSelectGroupPolicy(group, proxyName[index]);

};

let name =proxyName[index];
let rootName = name;
if(rootName=="Master"){
	name = name + ' ➟ ' + (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(rootName)+"")).policy;
}

while(allGroup.includes(rootName)==true){
	rootName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(rootName)+"")).policy;
}

if(arr[index].isGroup==true){
name=name + ' ➟ ' + rootName;
}

    $done({
      title:group,
      content:name,
      icon: params.icon || "hand.raised.circle.fill",
      // icon: params.icon,
		"icon-color": params.color || "#C3291C"
	  // "icon-color":params.color
    });
})();


function httpAPI(path = "", method = "GET", body = null) {
    return new Promise((resolve) => {
        $httpAPI(method, path, body, (result) => {
            resolve(result);
        });
    });
};

function getParams(param) {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}