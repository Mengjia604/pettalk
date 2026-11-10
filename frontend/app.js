const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8080'

function resolveApiBaseUrl() {
  try {
    return wx.getStorageSync('apiBaseUrl') || DEFAULT_API_BASE_URL
  } catch (error) {
    return DEFAULT_API_BASE_URL
  }
}

App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }

    wx.cloud.init({
      env: 'cloud1-d2g2g1di987d43491',
      traceUser: true
    })
  },

  globalData: {
    apiBaseUrl: resolveApiBaseUrl(),
    homeReset: false,
    homeTab: '',
    publishChannelId: null
  }
})
