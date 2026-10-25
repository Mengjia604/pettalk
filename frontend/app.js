App({
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // 👇👇👇 必须把下面的字符串换成你自己的环境 ID！
        env: 'cloud1-d2g2g1di987d43491', 
        traceUser: true,
      })
    }
  }
})