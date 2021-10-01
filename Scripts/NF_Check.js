/*
 * 支持使用脚本使用 argument 参数自定义配置，如：argument=key1=URLEncode(value1)&key2=URLEncode(value2)，具体参数如下所示，
 * title: 面板标题
 * fullContent: 完整解锁时展示的的文本内容，支持两个区域占位符 #REGION_FLAG# 和 #REGION_CODE#，用来展示解锁区域国旗 emoji 和解锁区域编码
 * fullIcon: 完整解锁时展示的图标，内容为任意有效的 SF Symbol Name
 * fullIconColor：完整解锁时展示的图标颜色，内容为颜色的 HEX 编码
 * fullStyle: 完整解锁时展示的图标样式，参数可选值有 good, info, alert, error
 * onlyOriginalContent：仅解锁自制剧时展示的文本内容，支持两个区域占位符 #REGION_FLAG# 和 #REGION_CODE#，用来展示解锁区域国旗 emoji 和解锁区域编码
 * onlyOriginalIcon: 仅解锁自制剧时展示的图标
 * onlyOriginalIconColor: 仅解锁自制剧时展示的图标颜色
 * onlyOriginalStyle: 仅解锁自制剧时展示的图标样式
 * notAvailableContent: 不支持解锁时展示的文本内容
 * notAvailableIcon: 不支持解锁时展示的图标
 * notAvailableIconColor: 不支持解锁时展示的图标颜色
 * notAvailableStyle: 不支持解锁时展示的图标样式
 * errorContent: 检测异常时展示的文本内容
 * errorIcon: 检测异常时展示的图标
 * errorIconColor: 检测异常时展示的图标颜色
 * errorStyle: 检测异常时展示的图标样式
 */

const BASE_URL = 'https://www.netflix.com/title/'
const FILM_ID = 81215567
const AREA_TEST_FILM_ID = 80018499
const DEFAULT_OPTIONS = {
  title: 'Netflix 解锁检测',
  fullContent: '🎉 完整解锁 Netflix ➟ #REGION_FLAG# #REGION_CODE#',
  fullIcon: 'checkmark.circle.fill',
  fullIconColor: '36CE66',
  fullStyle: 'good',
  onlyOriginalContent: '🥲 解锁 Netflix 自制剧 ➟ #REGION_FLAG# #REGION_CODE#',
  onlyOriginalIcon: 'exclamationmark.circle.fill',
  onlyOriginalIconColor: 'F7DE00',
  onlyOriginalStyle: 'info',
  notAvailableContent: '😭 不支持解锁 Netflix',
  notAvailableIcon: 'multiply.circle.fill',
  notAvailableIconColor: 'F52900',
  notAvailableStyle: 'alert',
  errorContent: '检测失败，请重试',
  errorIcon: 'multiply.circle.fill',
  errorIconColor: 'F52900',
  errorStyle: 'error',
}

let options = getOptions()
let panel = {
  title: options.title,
}

;(async () => {
  await test(FILM_ID)
    .then(async region => {
      if (options.fullIcon) {
        panel['icon'] = options.fullIcon
        panel['icon-color'] = options.fullIconColor ? options.fullIconColor : undefined
      } else {
        panel['style'] = options.fullStyle
      }
      panel['content'] = options.fullContent.replaceAll('#REGION_FLAG#', getCountryFlagEmoji(region)).replaceAll('#REGION_CODE#', region)
    })
    .catch(async error => {
      if (error !== 'Not Found') {
        return Promise.reject(error)
      }

      if (options.onlyOriginalIcon) {
        panel['icon'] = options.onlyOriginalIcon
        panel['icon-color'] = options.onlyOriginalIconColor ? options.onlyOriginalIconColor : undefined
      } else {
        panel['style'] = options.onlyOriginalStyle
      }

      if (options.onlyOriginalContent.indexOf('#REGION_FLAG#') === -1 && options.onlyOriginalContent.indexOf('#REGION_CODE#') === -1) {
        panel['content'] = options.onlyOriginalContent
        return
      }

      let region = await test(AREA_TEST_FILM_ID)
      panel['content'] = options.onlyOriginalContent.replaceAll('#REGION_FLAG#', getCountryFlagEmoji(region)).replaceAll('#REGION_CODE#', region)
    })
    .catch(error => {
      if (error !== 'Not Available') {
        return Promise.reject(error)
      }

      panel['content'] = options.notAvailableContent
      if (options.notAvailableIcon) {
        panel['icon'] = options.notAvailableIcon
        panel['icon-color'] = options.notAvailableIconColor ? options.notAvailableIconColor : undefined
      } else {
        panel['style'] = options.notAvailableStyle
      }
    })
})()
  .catch(error => {
    console.log(error)
    if (options.errorIcon) {
      panel['icon'] = options.errorIcon
      panel['icon-color'] = options.errorIconColor ? options.errorIconColor : undefined
    } else {
      panel['style'] = options.errorStyle
    }
    panel['content'] = options.errorContent
  })
  .finally(() => {
    $done(panel)
  })

function test(filmId) {
  return new Promise((resolve, reject) => {
    let option = {
      url: BASE_URL + filmId,
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

function getCountryFlagEmoji(countryCode) {
  if (countryCode.toUpperCase() == 'TW') {
    countryCode = 'CN'
  }
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt())
  return String.fromCodePoint(...codePoints)
}

function getOptions() {
  let options = Object.assign({}, DEFAULT_OPTIONS)
  if (typeof $argument != 'undefined') {
    try {
      let params = Object.fromEntries(
        $argument
          .split('&')
          .map(item => item.split('='))
          .map(([k, v]) => [k, decodeURIComponent(v)])
      )
      Object.assign(options, params)
    } catch (error) {
      console.error(`$argument 解析失败，$argument: + ${argument}`)
    }
  }

  return options
}