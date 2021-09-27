const BASE_URL = 'https://www.youtube.com/premium'

;(async () => {
  let result = {
    title: 'YouTube Premium 解锁检测',
    style: 'error',
    content: '检测失败，请刷新',
  }

  await test()
    .then((code) => {
      if (code === 'Not Available') {
        result['style'] = 'alert'
        result['content'] = '😭 不支持解锁Premium'
        return
      }

      result['style'] = 'good'
      result['content'] = '🎉 支持解锁Premium,解锁区域:' + code
    })
    .finally(() => {
      $done(result)
    })
})()

function test() {
  return new Promise((resolve, reject) => {
    let option = {
      url: BASE_URL,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
        'Accept-Language': 'en',
      },
    }
    $httpClient.get(option, function (error, response, data) {
      if (error != null || response.status !== 200) {
        reject('Error')
        return
      }

      if (data.indexOf('Premium is not available in your country') !== -1) {
        resolve('Not Available')
        return
      }

      let region = ''
      let re = new RegExp('"countryCode":"(.*?)"', 'gm')
      let result = re.exec(data)
      if (result != null && result.length === 2) {
        region = result[1]
      } else if (data.indexOf('www.google.cn') !== -1) {
        region = 'CN'
      } else {
        region = 'US'
      }
      resolve(region)
    })
  })
}