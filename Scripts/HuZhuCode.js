let isQuantumultX = $task !== undefined;
let isSurge = $httpClient !== undefined;

var $task = isQuantumultX ? $task : {};
var $httpClient = isSurge ? $httpClient : {};

var $prefs = isQuantumultX ? $prefs : {};
var $persistentStore = isSurge ? $persistentStore : {};

var $notify = isQuantumultX ? $notify : {};
var $notification = isSurge ? $notification : {};

if (isQuantumultX) {
    var errorInfo = {
        error: ''
    };
    $httpClient = {
        get: (url, cb) => {
            var urlObj;
            if (typeof (url) == 'string') {
                urlObj = {
                    url: url
                }
            } else {
                urlObj = url;
            }
            $task.fetch(urlObj).then(response => {
                cb(undefined, response, response.body)
            }, reason => {
                errorInfo.error = reason.error;
                cb(errorInfo, response, '')
            })
        },
        post: (url, cb) => {
            var urlObj;
            if (typeof (url) == 'string') {
                urlObj = {
                    url: url
                }
            } else {
                urlObj = url;
            }
            url.method = 'POST';
            $task.fetch(urlObj).then(response => {
                cb(undefined, response, response.body)
            }, reason => {
                errorInfo.error = reason.error;
                cb(errorInfo, response, '')
            })
        }
    }
}
if (isSurge) {
    $task = {
        fetch: url => {
            return new Promise((resolve, reject) => {
                if (url.method == 'POST') {
                    $httpClient.post(url, (error, response, data) => {
                        response.body = data;
                        resolve(response, {
                            error: error
                        });
                    })
                } else {
                    $httpClient.get(url, (error, response, data) => {
                        response.body = data;
                        resolve(response, {
                            error: error
                        });
                    })
                }
            })

        }
    }
}

if (isQuantumultX) {
    $persistentStore = {
        read: key => {
            return $prefs.valueForKey(key);
        },
        write: (val, key) => {
            return $prefs.setValueForKey(val, key);
        }
    }
}
if (isSurge) {
    $prefs = {
        valueForKey: key => {
            return $persistentStore.read(key);
        },
        setValueForKey: (val, key) => {
            return $persistentStore.write(val, key);
        }
    }
}

if (isQuantumultX) {
    $notification = {
        post: (title, subTitle, detail) => {
            $notify(title, subTitle, detail);
        }
    }
}
if (isSurge) {
    $notify = function (title, subTitle, detail) {
        $notification.post(title, subTitle, detail);
    }
}

const urlbean = `http://api.turinglabs.net/api/v1/jd/bean/create/i7puu7zw7db5xrlm2qlglc5k3btnhjk5d5ae7pi/`;

const urlfarm = `http://api.turinglabs.net/api/v1/jd/farm/create/55ddb354f2b54a50a35af9267e6a9582/`;

const urlpet = `http://api.turinglabs.net/api/v1/jd/pet/create/MTAxODc2NTEzMDAwMDAwMDAyODcwMzIyOQ==/`;

const urlddfac = `http://api.turinglabs.net/api/v1/jd/ddfactory/create/P04z54XCjVWnYaS5mZXVjergiIdQnwWVswlkq4N/`;

const urljxfac = `http://api.turinglabs.net/api/v1/jd/jxfactory/create/hUF7NMdl5xMngQwU-s29_h7CJ9BXzu1aH3bp9pFXl68=/`;

const method = `GET`;
const headers = {
'Accept-Encoding' : `gzip, deflate`,
'Accept' : `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`,
'Connection' : `keep-alive`,
'Host' : `api.turinglabs.net`,
'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Mobile/15E148 Safari/604.1`,
'Upgrade-Insecure-Requests' : `1`,
'Accept-Language' : `zh-cn`
};
const body = ``;

var msg = "";
var name = {"bean":"种豆：","farm":"农场：","pet":"萌宠：","ddfactory"："京喜:","jxfactory":"东东："}

function Task(url) {
    const myRequest = {
        url: url,
        method: method,
        headers: headers,
        body: body
    };
$task.fetch(myRequest).then(response => {
    console.log(response.statusCode + "\n\n" + response.body);
    var obj = JSON.parse(response.body);
    msg = msg + "" +name[url.split("jd/")[1].split("/")[0]]+ obj.message+"\n";
    //return msg
}, reason => {
    console.log(reason.error);
    $done();
});
}
function DoIt(){
    let msg1= Task(urlbean)
    let msg2= Task(urlfarm)
    let msg3= Task(urlpet)
    let msg4= Task(urlddfac)
    let msg5= Task(urljxfac)
    setTimeout(function(){
        $notify("🚗  互助上车",``,msg)
        $done()
    },5000)
    
}

DoIt()