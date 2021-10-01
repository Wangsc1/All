/*
 * 支持使用脚本使用 argument 参数自定义配置，如：argument=key1=URLEncode(value1)&key2=URLEncode(value2)，具体参数如下所示，
 * title: 面板标题
 * availableContent: 解锁时展示的的文本内容，支持两个区域占位符 #REGION_FLAG# 和 #REGION_CODE#，用来展示解锁区域国旗 emoji 和解锁区域编码
 * availableIcon: 解锁时展示的图标，内容为任意有效的 SF Symbol Name
 * availableIconColor:  解锁时展示的图标颜色，内容为颜色的 HEX 编码
 * availableStyle: 解锁时展示的图标样式，参数可选值有 good, info, alert, error
 * notAvailableContent: 不支持解锁时展示的文本内容
 * notAvailableIcon: 不支持解锁时展示的图标
 * notAvailableIconColor: 不支持解锁时展示的图标颜色
 * notAvailableStyle: 不支持解锁时展示的图标样式
 * errorContent: 检测异常时展示的文本内容
 * errorIcon: 检测异常时展示的图标
 * errorIconColor: 检测异常时展示的图标颜色
 * errorStyle: 检测异常时展示的图标样式
 */

const BASE_URL = 'https://www.youtube.com/premium'

const DEFAULT_OPTIONS = {
  title: 'YouTube Premium 解锁检测',
  availableContent: '🎉 支持解锁 Premium ➟ #REGION_FLAG# #REGION_CODE#',
  availableIcon: 'checkmark.circle.fill',
  availableIconColor: '36CE66',
  availableStyle: 'good',
  notAvailableContent: '😭 不支持解锁 Premium',
  notAvailableIcon: 'multiply.circle.fill',
  notAvailableIconColor: 'F52900',
  notAvailableStyle: 'alert',
  errorContent: '😳 检测失败，请重试',
  errorIcon: 'multiply.circle.fill',
  errorIconColor: 'F52900',
  errorStyle: 'error',
}

let options = getOptions()
let panel = {
  title: options.title,
}

;(async () => {
  await test()
    .then(region => {
      if (options.availableIcon) {
        panel['icon'] = options.availableIcon
        panel['icon-color'] = options.availableIconColor ? options.availableIconColor : undefined
      } else {
        panel['style'] = options.availableStyle
      }
      panel['content'] = options.availableContent.replaceAll('#REGION_FLAG#', getCountryFlagEmoji(region)).replaceAll('#REGION_CODE#', region)
    })
    .catch(error => {
      if (error !== 'Not Available') {
        return Promise.reject(error)
      }

      if (options.notAvailableIcon) {
        panel['icon'] = options.notAvailableIcon
        panel['icon-color'] = options.notAvailableIconColor ? options.notAvailableIconColor : undefined
      } else {
        panel['style'] = options.notAvailableStyle
      }
      panel['content'] = options.notAvailableContent
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

function test() {
  return new Promise((resolve, reject) => {
    let option = {
      url: BASE_URL,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
        'Accept-Language': 'en',
      },
    }
    $httpClient.get(option, function (error, response, data) {
      if (error != null || response.status !== 200) {
        reject('Error')
        return
      }

      if (data.indexOf('Premium is not available in your country') !== -1) {
        reject('Not Available')
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
      resolve(region.toUpperCase())
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