const BASE_URL = 'https://www.netflix.com/title/'

const FILM_ID = 81215567

;(async () => {
  let result = {
    title: 'Netflix 解锁检测',
    style: 'error',
    content: '检测失败，请重试',
  }

  await test(FILM_ID)
    .then((code) => {
      if (code === 'Not Available') {
        result['style'] = 'error'
        result['content'] = '您的 IP 不能解锁 Netflix 😭'
        return
      }

      if (code === 'Not Found') {
        result['style'] = 'info'
        result['content'] = '您的 IP 只解锁自制剧 🥲'
        return
      }

      result['style'] = 'good'
      result['content'] = '您的 IP 完整解锁 Netflix 🎉'
    })
    .finally(() => {
      $done(result)
    })
})()

function test(filmId) {
  return new Promise((resolve, reject) => {
    let option = {
      url: BASE_URL + filmId,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
      },
    }
    $httpClient.get(option, function (error, response, data) {
      if (error != null) {
        reject('Error')
        return
      }

      if (response.status === 404) {
        resolve('Not Found')
        return
      }

      if (response.status === 403) {
        resolve('Not Available')
        return
      }

      if (response.status === 200) {
        let url = response.headers['x-originating-url']
        let region = url.split('/')[3]
        region = region.split('-')[0]
        if (region == 'title') {
          region = 'us'
        }
        resolve(region)
        return
      }

      reject('Error')
    })
  })
}