Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/index/index', text: '首页' },
      { pagePath: '/pages/publish/publish', text: '发布+' },
      { pagePath: '/pages/profile/profile', text: '我的' }
    ]
  },

  methods: {
    switchTab(event) {
      const index = Number(event.currentTarget.dataset.index)
      const path = event.currentTarget.dataset.path
      if (index === this.data.selected) {
        if (path === '/pages/profile/profile') {
          const pages = getCurrentPages()
          const page = pages[pages.length - 1]
          if (page && page.route === 'pages/profile/profile' && typeof page.onTabItemTap === 'function') {
            page.onTabItemTap()
          }
        }
        return
      }
      if (path === '/pages/profile/profile') {
        wx.setStorageSync('profileTabReset', true)
      }
      this.setData({ selected: index })
      wx.switchTab({ url: path })
    }
  }
})
