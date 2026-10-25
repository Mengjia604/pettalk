const { getFeed } = require('../../api/post')

Page({
  data: {
    list: [],
    page: 1,
    size: 10,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.refreshFeed()
  },

  onShow() {
    // 从发布页返回时，如果没数据，刷新一下
    if (this.data.list.length === 0) {
      this.refreshFeed()
    }
  },

  onPullDownRefresh() {
    this.refreshFeed().finally(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore()
    }
  },

  refreshFeed() {
    return this.loadFeed(true)
  },

  loadMore() {
    return this.loadFeed(false)
  },

  async loadFeed(reset) {
    if (this.data.loading) return
    this.setData({ loading: true })

    const page = reset ? 1 : this.data.page + 1
    try {
      const data = await getFeed(page, this.data.size)

      console.log("1. 后端返回的原始列表:", data.list) 

      // 把所有动态里的图片 fileID 收集起来
      let allFileIDs = []
      data.list.forEach(item => {
        if (item.images && item.images.length > 0) {
          allFileIDs = allFileIDs.concat(item.images)
        }
      })

      // 如果有图片，调用云函数换取临时链接
      if (allFileIDs.length > 0) {
        const cloudRes = await wx.cloud.callFunction({
          name: 'getTempUrls',
          data: { fileIDs: allFileIDs }
        })

        console.log("2. 云函数返回的临时链接:", cloudRes.result) 

        const tempUrls = cloudRes.result || []
        
        // 把换回来的临时链接替换掉原本的 fileID
        let urlIndex = 0
        data.list.forEach(item => {
          if (item.images && item.images.length > 0) {
            item.images = item.images.map(() => {
              return tempUrls[urlIndex++] || ''
            })
          }
        })
      }

      console.log("3. 替换后的最终列表:", data.list)

      this.setData({
        list: reset ? data.list : this.data.list.concat(data.list),
        page: page,
        hasMore: data.hasMore
      })
    } catch (e) {
      console.error("加载失败", e)
    } finally {
      this.setData({ loading: false })
    }
  },

  previewImage(e) {
    const urls = e.currentTarget.dataset.urls
    const current = e.currentTarget.dataset.current
    wx.previewImage({ urls, current })
  },

  goPublish() {
    wx.switchTab({ url: '/pages/publish/publish' })
  }
})