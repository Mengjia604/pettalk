const DEFAULT_TIMEOUT = 10000

function getApiBaseUrl() {
  try {
    const app = getApp()
    return (app && app.globalData && app.globalData.apiBaseUrl) || ''
  } catch (error) {
    return ''
  }
}

function buildUrl(url) {
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    throw new Error('未配置接口地址')
  }

  return `${baseUrl.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`
}

function getStorageValue(key) {
  try {
    return wx.getStorageSync(key)
  } catch (error) {
    return ''
  }
}

function request(options = {}) {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    auth = true,
    showLoading = false,
    loadingText = '加载中',
    showError = true
  } = options

  if (!url) {
    return Promise.reject(new Error('请求地址不能为空'))
  }

  let fullUrl
  try {
    fullUrl = buildUrl(url)
  } catch (error) {
    if (showError) {
      wx.showToast({ title: error.message, icon: 'none' })
    }
    return Promise.reject(error)
  }

  if (showLoading) {
    wx.showLoading({ title: loadingText, mask: true })
  }

  return new Promise((resolve, reject) => {
    let loadingVisible = showLoading

    const finishLoading = () => {
      if (loadingVisible) {
        wx.hideLoading()
        loadingVisible = false
      }
    }

    const fail = (message) => {
      finishLoading()
      if (showError) {
        wx.showToast({ title: message, icon: 'none' })
      }
      reject(new Error(message))
    }

    const requestHeader = {
      'Content-Type': 'application/json',
      ...header
    }

    if (auth) {
      const token = getStorageValue('token')
      if (token) {
        requestHeader.Authorization = `Bearer ${token}`
      }
    }

    wx.request({
      url: fullUrl,
      method: method.toUpperCase(),
      data,
      header: requestHeader,
      timeout: DEFAULT_TIMEOUT,
      success(response) {
        finishLoading()

        if (response.statusCode < 200 || response.statusCode >= 300) {
          fail(`请求失败（${response.statusCode}）`)
          return
        }

        const body = response.data
        if (!body || typeof body !== 'object') {
          fail('接口返回格式错误')
          return
        }

        if (body.code !== 200) {
          fail(body.message || '请求失败')
          return
        }

        resolve(body.data)
      },
      fail(error) {
        fail(error.errMsg || '网络请求失败')
      }
    })
  })
}

module.exports = {
  request
}
