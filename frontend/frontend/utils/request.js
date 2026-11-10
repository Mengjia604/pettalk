const BASE_URL = 'http://localhost:8080'

function request(options) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token') || ''
    const userId = wx.getStorageSync('userId') || 1

    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? ('Bearer ' + token) : '',
        'X-User-Id': String(userId)
      },
      success(res) {
        if (res.statusCode !== 200) {
          wx.showToast({ title: '网络错误 ' + res.statusCode, icon: 'none' })
          return reject(res)
        }
        const body = res.data
        if (!body || body.code !== 0) {
          wx.showToast({ title: (body && body.msg) || '请求失败', icon: 'none' })
          return reject(body)
        }
        resolve(body.data)
      },
      fail(err) {
        wx.showToast({ title: '无法连接服务器', icon: 'none' })
        reject(err)
      }
    })
  })
}

module.exports = {
  request, // 直接暴露 request 供特殊方法使用
  get(url, data) {
    return request({ url, method: 'GET', data })
  },
  post(url, data) {
    return request({ url, method: 'POST', data })
  },
  put(url, data) {
    return request({ url, method: 'PUT', data })
  },
  del(url, data) {
    return request({ url, method: 'DELETE', data })
  }
}