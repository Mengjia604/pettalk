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

function isDevelopEnv() {
  try {
    const info = wx.getAccountInfoSync()
    return !info || !info.miniProgram || info.miniProgram.envVersion !== 'release'
  } catch (error) {
    return true
  }
}

Page({
  data: {
    loading: false,
    isDev: false
  },

  onLoad() {
    this.setData({ isDev: isDevelopEnv() })
    if (getStoredSession()) {
      this.redirectAfterLogin()
    }
  },

  async loginWithCode(code) {
    if (this.data.loading || !code) {
      return
    }

    this.setData({ loading: true })
    try {
      const data = await api.login(code)
      if (!data || !data.token || !data.user) {
        throw new Error('登录返回数据不完整')
      }

      wx.setStorageSync('token', data.token)
      wx.setStorageSync('user', data.user)
      wx.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        this.redirectAfterLogin()
      }, 500)
    } catch (error) {
      if (error && error.message === '登录返回数据不完整') {
        wx.showToast({ title: error.message, icon: 'none' })
      }
    } finally {
      this.setData({ loading: false })
    }
  },

  async handleLogin() {
    if (this.data.loading) {
      return
    }

    let code = ''
    try {
      const result = await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject })
      })
      code = result.code || ''
    } catch (error) {
      wx.showToast({ title: '微信登录失败，请重试', icon: 'none' })
      return
    }

    if (!code) {
      wx.showToast({ title: '未获取到登录 code', icon: 'none' })
      return
    }
    await this.loginWithCode(code)
  },

  handleMockLogin() {
    this.loginWithCode('mock_test_openid_123')
  },

  redirectAfterLogin() {
    let redirect = ''
    try {
      redirect = wx.getStorageSync('loginRedirect')
      wx.removeStorageSync('loginRedirect')
    } catch (error) {
      redirect = ''
    }
    wx.switchTab({
      url: redirect === 'profile' ? '/pages/profile/profile' : '/pages/index/index'
    })
  },

  login() {
    this.handleLogin()
  }
})
