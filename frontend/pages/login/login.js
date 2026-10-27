const api = require('../../utils/api')

function getStoredSession() {
  try {
    const token = wx.getStorageSync('token')
    const user = wx.getStorageSync('user')
    return token && user && user.id ? { token, user } : null
  } catch (error) {
    return null
  }
}

function getMockOpenid() {
  try {
    let openid = wx.getStorageSync('mockOpenid')
    if (!openid) {
      openid = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      wx.setStorageSync('mockOpenid', openid)
    }
    return openid
  } catch (error) {
    return 'test_openid_123'
  }
}

Page({
  data: {
    loading: false
  },

  onLoad() {
    if (getStoredSession()) {
      wx.switchTab({ url: '/pages/index/index' })
    }
  },

  async handleLogin() {
    if (this.data.loading) {
      return
    }

    this.setData({ loading: true })
    const openid = getMockOpenid()
    let code = ''

    try {
      const result = await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject })
      })
      code = result.code || ''
    } catch (error) {
      code = ''
    }

    try {
      const data = await api.login(openid, code)
      if (!data || !data.token || !data.user) {
        throw new Error('登录返回数据不完整')
      }

      wx.setStorageSync('token', data.token)
      wx.setStorageSync('user', data.user)
      wx.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 500)
    } catch (error) {
      if (error && error.message === '登录返回数据不完整') {
        wx.showToast({ title: error.message, icon: 'none' })
      }
    } finally {
      this.setData({ loading: false })
    }
  },

  login() {
    this.handleLogin()
  }
})
