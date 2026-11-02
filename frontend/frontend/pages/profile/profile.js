const { getFeed } = require('../../api/post')

Page({
  data: {
    list: [],
    loading: false
  },

  // 每次进入页面都刷新数据
  onShow() {
    this.loadMyPosts()
  },

  async loadMyPosts() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      // 1. 获取前 50 条动态 (目前没有专门的我的动态接口，先拉全部)
      const res = await getFeed(1, 50)
      
      // 2. 过滤出当前用户的动态 (当前用户 ID 默认为 1)
      const currentUserId = wx.getStorageSync('userId') || 1
      let myList = res.list.filter(item => item.userId === currentUserId)

      // 3. 收集需要转换的图片 fileID
      let allFileIDs = []
      myList.forEach(item => {
        if (item.images && item.images.length > 0) {
          allFileIDs = allFileIDs.concat(item.images)
        }
      })

      // 4. 如果有图片，直接调用云函数换成临时链接（不折腾公共文件了）
      if (allFileIDs.length > 0) {
        const cloudRes = await wx.cloud.callFunction({
          name: 'getTempUrls',
          data: { fileIDs: allFileIDs }
        })
        const tempUrls = cloudRes.result || []
        
        let urlIndex = 0
        myList.forEach(item => {
          if (item.images && item.images.length > 0) {
            item.images = item.images.map(() => tempUrls[urlIndex++] || '')
          }
        })
      }

      // 5. 更新页面数据
      this.setData({ list: myList })

    } catch (e) {
      console.error("加载我的动态失败", e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 点击列表项跳转到详情页
  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id })
  }
})