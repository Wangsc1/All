const AUTHORIZATION = 'Bearer ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'

// 即将登陆
const STATUS_COMING = 2
// 支持解锁
const STATUS_AVAILABLE = 1
// 不支持解锁
const STATUS_NOT_AVAILABLE = 0
// 检测超时
const STATUS_TIMEOUT = -1
// 检测异常
const STATUS_ERROR = -2

;(async () => {
let params = getParams($argument)
let Group = params.Group
//将策略组名称创建为持久化数据
$persistentStore.write(Group,"DISNEYGROUP");

let proxy = await httpAPI("/v1/policy_groups");
let groupName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(Group)+"")).policy;
let first = groupName;
var proxyName= [];//Disney节点组名称
let arr = proxy[""+Group+""];
for (let i = 0; i < arr.length; ++i) {
proxyName.push(arr[i].name);
}
let allGroup = [];
for (var key in proxy){
   allGroup.push(key)
    }

var unlocked = [];
/* 读取持久化数据 */
unlocked = $persistentStore.read("unlockedDisney").split(",");

//打印数据结果
console.log("可解锁: " + unlocked.sort())

/**
   * 过滤选择列表
   */

var select=[];
//清除空值
if(unlocked.toString().length==0){
	unlocked.splice(unlocked.indexOf(unlocked[0]), 1)
	}
//删除策略组外节点并更新持久化数据
if(unlocked.length>0){
	for (let i = 0; i < unlocked.length; ++i) {
	if(proxyName.includes(unlocked[i])==true){
		select.push(unlocked[i])
		}
	}
	
	$persistentStore.write(select.sort().toString(),"unlockedDisney");
}

console.log("选择列表:"+select.sort())

/* 手动切换 */

if($trigger == "button"){

//当前节点
groupName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(Group)+"")).policy;
console.log("当前节点:"+groupName)

let index;
if(select.includes(groupName)==true){
	index = select.indexOf(groupName)+1;
}else{
index = 0
}

if(index>=select.length){
	index=0
}
console.log("目标节点:"+ select[index])
if(select.length>0){
$surge.setSelectGroupPolicy(Group, select[index]);
}
await timeout(1000).catch(() => {})
}

/**
   * 自动刷新
   */

/* 检查选择列表 */
console.log(select.length)
if(select.length==0){
	$notification.post("节点列表获取失败", "请手动运行一次DisneyChecker脚本", "")
}
//测试当前选择

//当前节点
groupName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(Group)+"")).policy;
console.log("当前节点:"+groupName)

let { region, status } = await testDisneyPlus()
let newStatus=status
let reg = region
console.log("节点状态:"+status)
/* 检测超时 再测一次 */
if(status <0) {
	console.log(groupName+": 连接超时了，再测一次")
	await timeout(1000).catch(() => {})
	let { region, status } = await testDisneyPlus()
	newStatus=status
	reg = region
	console.log("当前节点:"+groupName)
	console.log("节点状态:"+newStatus)
}

status = newStatus
region = reg 


/* 当前节点不可解锁时，执行自动切换，若列表为空，仅执行测试 */
if(status!= 1){
	if(select.length>0){
	//遍历选择列表，找到第一个更优节点
		for (let i = 0; i < select.length; ++i) {
		console.log("在找新节点了，稍等一下")
		$surge.setSelectGroupPolicy(Group, select[i]);
		await timeout(1000).catch(() => {})
		groupName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(Group)+"")).policy;
		console.log("当前节点:"+groupName)
		let { region, status } = await testDisneyPlus()
		console.log("节点状态:"+status)
		if(status==1){
			newStatus=status
			reg = region
			break;
			}
		}
	}else {
	groupName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(Group)+"")).policy;
	console.log("当前节点:"+groupName)
	let { region, status } = await testDisneyPlus()
	console.log("节点状态:"+status)
	newStatus = status
	reg = region
	}
}

	status= newStatus
	region =reg
	
	
//获取根节点名
let rootName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(Group)+"")).policy;
while(allGroup.includes(rootName)==true){
	rootName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(rootName)+"")).policy;
}

/**
   * 面板显示
   */



let title = "Disney+";

let panel = {
  title: `${title}`,
}
  
  if (status==1) {
    panel['content'] = `${rootName} | 支持解锁 ➟ ${region}`
    panel['icon'] = 'checkmark.circle.fill'
	 panel['icon-color'] = '#36CE66'
  } else if (status==2) {
      panel['content'] = `${rootName} | 即将登陆 ➟ ${region}`
      panel['icon'] = 'exclamationmark.circle.fill'
	   panel['icon-color'] = '#FFDE00'
    }else {
 		$surge.setSelectGroupPolicy(Group, first);
  		panel['content'] = `${rootName} | 不支持解锁`
  		panel['icon'] = 'multiply.circle.fill'
	 	panel['icon-color'] = '#F52900'
		return
	}

console.log(panel)

    $done(panel)


})()

async function testDisneyPlus() {
  try {
    let { region, cnbl } = await Promise.race([testHomePage(), timeout(3000)])

    // 即将登陆
    if (cnbl == 2) {
      return { region, status: STATUS_COMING }
    }

    let { refresh_token } = await Promise.race([getToken(), timeout(1000)])
    let { countryCode, inSupportedLocation } = await Promise.race([getLocationInfo(refresh_token), timeout(1000)])

    region = countryCode
    // 即将登陆
    if (inSupportedLocation === false || inSupportedLocation === 'false') {
      return { region, status: STATUS_COMING }
    }

    // 支持解锁
    return { region, status: STATUS_AVAILABLE }
  } catch (error) {
    console.log(error)

    // 不支持解锁
    if (error === 'Not Available') {
      return { status: STATUS_NOT_AVAILABLE }
    }

    // 检测超时
    if (error === 'Timeout') {
      return { status: STATUS_TIMEOUT }
    }

    return { status: STATUS_ERROR }
  }
}

function getToken() {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://global.edge.bamgrid.com/token',
      headers: {
        'Accept-Language': 'en',
        Authorization: AUTHORIZATION,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': UA,
      },
      body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Atoken-exchange&latitude=0&longitude=0&platform=browser&subject_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhMmM3MmZiNS1kOGI1LTQ0ZDItYjJmNi0zMWRkMWFiN2Y1N2QiLCJhdWQiOiJ1cm46YmFtdGVjaDpzZXJ2aWNlOnRva2VuIiwibmJmIjoxNjMzMzU4MzE1LCJpc3MiOiJ1cm46YmFtdGVjaDpzZXJ2aWNlOmRldmljZSIsImV4cCI6MjQ5NzM1ODMxNSwiaWF0IjoxNjMzMzU4MzE1LCJqdGkiOiJkYmNiZjUzYS1lZDEwLTRjOGItYjU2My01ZDJkNTc1ZDFlMDEifQ.xGII2Ud7xHWELrpW_OSnunFGlfJ6EFWQ2PzSYJGsMLY13u5iUR6QKCcBkUaEPMcHaVTTwQypc9hP9q7-52kgHQ&subject_token_type=urn%3Abamtech%3Aparams%3Aoauth%3Atoken-type%3Adevice',
    }

    $httpClient.post(opts, function (error, response, data) {
      if (error) {
        reject('Error')
        return
      }
      if (response.status !== 200) {
        reject('Not Available')
        return
      }

      resolve(JSON.parse(data))
    })
  })
}

function getLocationInfo(refreshToken) {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
      headers: {
        'Accept-Language': 'en',
        Authorization: AUTHORIZATION,
        'Content-Type': 'application/json',
        'User-Agent': UA,
      },
      body: JSON.stringify({
        query: 'mutation refreshToken($input: RefreshTokenInput!) { refreshToken(refreshToken: $input) { activeSession { sessionId } } }',
        variables: {
          input: {
            refreshToken,
          },
        },
      }),
    }

    $httpClient.post(opts, function (error, response, data) {
      if (error) {
        reject('Error')
        return
      }

      if (response.status !== 200) {
        reject('Not Available')
        return
      }

      let {
        inSupportedLocation,
        location: { countryCode },
      } = JSON.parse(data)?.extensions?.sdk?.session
      resolve({ inSupportedLocation, countryCode })
    })
  })
}

function testHomePage() {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://www.disneyplus.com/',
      headers: {
        'Accept-Language': 'en',
        'User-Agent': UA,
      },
    }

    $httpClient.get(opts, function (error, response, data) {
      if (error) {
        reject('Error')
        return
      }
      if (response.status !== 200 || data.indexOf('unavailable') !== -1) {
        reject('Not Available')
        return
      }

      let match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/)
      if (!match) {
        resolve({ region: '', cnbl: '' })
        return
      }

      let region = match[1]
      let cnbl = match[2]
      resolve({ region, cnbl })
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


function replaceRegionPlaceholder(content, region) {
  let result = content

  if (result.indexOf('#REGION_CODE#') !== -1) {
    result = result.replaceAll('#REGION_CODE#', region.toUpperCase())
  }
  if (result.indexOf('#REGION_FLAG#') !== -1) {
    result = result.replaceAll('#REGION_FLAG#', getCountryFlagEmoji(region.toUpperCase()))
  }

  if (result.indexOf('#REGION_NAME#') !== -1) {
    result = result.replaceAll('#REGION_NAME#', RESION_NAMES?.[region.toUpperCase()]?.chinese ?? '')
  }

  if (result.indexOf('#REGION_NAME_EN#') !== -1) {
    result = result.replaceAll('#REGION_NAME_EN#', RESION_NAMES?.[region.toUpperCase()]?.english ?? '')
  }

  return result
}

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