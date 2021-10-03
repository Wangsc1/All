const FILM_ID = 81215567
const AREA_TEST_FILM_ID = 80018499
let params = getParams($argument)

;(async () => {
let Group = params.Group
let proxy = await httpAPI("/v1/policy_groups");
let groupName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(Group)+"")).policy;
let first = groupName;
var proxyName= [];//netflix节点组名称
let arr = proxy[""+Group+""];
for (let i = 0; i < arr.length; ++i) {
proxyName.push(arr[i].name);
}
let allGroup = [];
for (var key in proxy){
   allGroup.push(key)
    }


/**
   * 遍历测试节点组
   */

var fullUnlock=[];
var onlyOriginal=[];


//仅自动更新时遍历

if($trigger == "auto-interval"){

for (let i = 0; i < proxyName.length; ++i) {
//切换节点
$surge.setSelectGroupPolicy(Group, proxyName[i]);
//等待
await timeout(1000).catch(() => {})
//执行测试

let { status, regionCode, policyName } = await testPolicy(proxyName[i]);

//填充数据
if(status===2){
	if(fullUnlock.includes(proxyName[i])==false){
	fullUnlock.push(proxyName[i])
	console.log("全解锁: "+proxyName[i]+" | "+status)
		}
	}else if(status===1){
		if(onlyOriginal.includes(proxyName[i])==false){
		onlyOriginal.push(proxyName[i])
		console.log("仅自制: "+proxyName[i]+" | "+status)
		}
	}
  }

//去除杂项
for (let i = 0; i < fullUnlock.length; ++i){
	if(onlyOriginal.includes(fullUnlock[i])==true){
	fullUnlock.splice(fullUnlock.indexOf(fullUnlock[i]), 1)
	}
}

for (let i = 0; i < onlyOriginal.length; ++i){
	if(fullUnlock.includes(onlyOriginal[i])==true){
	onlyOriginal.splice(onlyOriginal.indexOf(onlyOriginal[i]), 1)
	}
}

// 创建持久化数据
$persistentStore.write(fullUnlock.toString(),"fullUnlockNetflix");
$persistentStore.write(onlyOriginal.toString(),"onlyOriginalNetflix")
}

//读取持久化数据
fullUnlock = $persistentStore.read("fullUnlockNetflix").split(",");
onlyOriginal= $persistentStore.read("onlyOriginalNetflix").split(",");

//打印测试结果
console.log("全解锁:"+fullUnlock.sort())
console.log("仅自制:"+onlyOriginal.sort())


/**
   * 切换节点
   */

//删除策略组外节点并更新持久化数据
var select=[];
if(fullUnlock.length>0){
	for (let i = 0; i < fullUnlock.length; ++i) {
	if(proxyName.includes(fullUnlock[i])==false){
		fullUnlock.splice(fullUnlock.indexOf(fullUnlock[i]), 1)
		}
	}
	select = fullUnlock
	$persistentStore.write(select.sort().toString(),"fullUnlockNetflix");
}else if(fullUnlock.length==0&&onlyOriginal.length>0){
	for (let i = 0; i < onlyOriginal.length; ++i) {
	if(proxyName.includes(onlyOriginal[i])==false){
		onlyOriginal.splice(onlyOriginal.indexOf(onlyOriginal[i]), 1)
		}
	}
	select = onlyOriginal
	$persistentStore.write(select.sort().toString(),"onlyOriginalNetflix")
}

console.log("选择列表:"+select.sort())



//当前节点
groupName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(Group)+"")).policy;
console.log("当前节点:"+groupName)


//轮循切换
let index = select.indexOf(groupName)+1;

if(index>=select.length){
	index=0
}
console.log("目标节点:"+ select[index])

$surge.setSelectGroupPolicy(Group, select[index]);

//测试当前选择

await timeout(1000).catch(() => {})

let { status, regionCode, policyName } = await testPolicy(select[index]);

console.log("节点状态:"+status)

//获取根节点名
let rootName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(Group)+"")).policy;
while(allGroup.includes(rootName)==true){
	rootName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(rootName)+"")).policy;
}

/**
   * 面板显示
   */

let title = "Netflix ➟ " + rootName;

let panel = {
  title: `${title}`,
}

  // 完整解锁
  if (status==2) {
    panel['content'] = `完整解锁 Netflix`
    panel['icon'] = 'checkmark.circle.fill'
	 panel['icon-color'] = '36CE66'
  } else if (status==1) {
      panel['content'] = `解锁 Netflix 自制剧`
      panel['icon'] = 'exclamationmark.circle.fill'
	   panel['icon-color'] = 'FFDE00'
    }else {
 		$surge.setSelectGroupPolicy(Group, first);
  		panel['content'] = `不支持解锁 Netflix`
  		panel['icon'] = 'multiply.circle.fill'
	 	panel['icon-color'] = 'F52900'
		return
	}



console.log(panel)

    $done(panel)


})();





function httpAPI(path = "", method = "GET", body = null) {
    return new Promise((resolve) => {
        $httpAPI(method, path, body, (result) => {
            resolve(result);
        });
    });
};

async function testPolicy(policyName) {
  try {
    const regionCode = await Promise.race([testFilm(FILM_ID), timeout(3000)])
    return { status: 2, regionCode, policyName }
  } catch (error) {
    if (error === 'Not Found') {
      return { status: 1, policyName }
    }
    if (error === 'Not Available') {
      return { status: 0, policyName }
    }
    console.log(error)
    return { status: -1, policyName }
  }
}

/**
 * 测试是否解锁
 */
function testFilm(filmId) {
  return new Promise((resolve, reject) => {
    let option = {
      url: `https://www.netflix.com/title/${filmId}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
      },
    }
    $httpClient.get(option, function (error, response, data) {
      if (error != null) {
        reject(error)
        return
      }

      if (response.status === 403) {
        reject('Not Available')
        return
      }

      if (response.status === 404) {
        reject('Not Found')
        return
      }

      if (response.status === 200) {
        let url = response.headers['x-originating-url']
        let region = url.split('/')[3]
        region = region.split('-')[0]
        if (region == 'title') {
          region = 'us'
        }
        resolve(region.toUpperCase())
        return
      }

      reject('Error')
    })
  })
}

function timeout(delay = 5000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Timeout')
    }, delay)
  })
}

function getParams(param) {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}