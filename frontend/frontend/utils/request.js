const BASE_URL = 'http://localhost:8080'

function request(options) {
  return new Promise((resolve, reject) => {
    // 从本地缓存读取 token 和 userId（1号登录后会存进去）
    const token = wx.getStorageSync('token') || ''
    const userId = wx.getStorageSync('userId') || 1

    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? ('Bearer ' + token) : '',
        'X-User-Id': String(userId) // 临时测试用，1号做好JWT后后端会改
      },
      success(res) {
        if (res.statusCode !== 200) {
          wx.showToast({ title: '网络错误 ' + res.statusCode, icon: 'none' })
          return reject(res)
        }
        const body = res.data
        // 统一判断后端返回的 code 是否为 0
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
  get(url, data) {
    return request({ url, method: 'GET', data })
  },
  post(url, data) {
    return request({ url, method: 'POST', data })
  }
}