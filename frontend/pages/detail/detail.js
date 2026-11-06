const { getPostDetail } = require('../../api/post')
const getTempUrls = require('../../utils/getTempUrls')

Page({
  data: {
    post: {},
    comments: [] // 等3号提供接口
  },

  onLoad(options) {
    if (options.id) {
      this.fetchDetail(options.id)
    }
  },

  async fetchDetail(id) {
    wx.showLoading({ title: '加载中' })
    try {
      const data = await getPostDetail(id)
      
      // 直接在这里调云函数，不用公共文件了！
      if (data.images && data.images.length > 0) {
        const cloudRes = await wx.cloud.callFunction({
          name: 'getTempUrls',
          data: { fileIDs: data.images }
        })
        const tempUrls = cloudRes.result || []
        data.images = data.images.map((_, index) => tempUrls[index] || '')
      }
      
      this.setData({ post: data })
    } catch (e) {
      wx.showToast({ title: '获取详情失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  previewImage(e) {
    const urls = e.currentTarget.dataset.urls
    const current = e.currentTarget.dataset.current
    wx.previewImage({ urls, current })
  }
})