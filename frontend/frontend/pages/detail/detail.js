const { getPostDetail } = require('../../api/post')
const getTempUrls = require('../../utils/getTempUrls')

Page({
  data: {
    post: {},
    comments: [], // 等3号提供接口
    isOwner: false
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
      
      // 1. 处理图片链接
      if (data.images && data.images.length > 0) {
        const cloudRes = await wx.cloud.callFunction({
          name: 'getTempUrls',
          data: { fileIDs: data.images }
        })
        const tempUrls = cloudRes.result || []
        data.images = data.images.map((_, index) => tempUrls[index] || '')
      }
      
      // 2. 获取当前用户ID（这里默认是1，因为你们还没完全做完登录）
      const currentUserId = wx.getStorageSync('userId') || 1
      
      // 3. 把数据和身份判断一起更新给页面
      this.setData({ 
        post: data,
        isOwner: data.userId === currentUserId // 如果动态的作者ID等于当前用户ID，就是 true
      })
      
    } catch (e) {
      wx.showToast({ title: '获取详情失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  handleDelete() {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定删除这条动态吗？',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中' })
          try {
            // 1. 尝试清理云图片（忽略它的报错）
            try {
              if (this.originalImages && this.originalImages.length > 0) {
                await wx.cloud.callFunction({
                  name: 'deleteCloudFiles',
                  data: { fileIDs: this.originalImages }
                })
              }
            } catch (e) {}

            // 2. 删除数据库记录
            const { deletePost } = require('../../api/post')
            await deletePost(this.data.post.id)
            
            wx.hideLoading() // 👈 提前关闭 loading，避免和 Toast 冲突
            wx.showToast({ title: '删除成功', icon: 'success' })
            
            const pages = getCurrentPages()
            const prev = pages[pages.length - 2]
            if (prev && prev.refreshFeed) prev.refreshFeed()
            
            setTimeout(() => wx.navigateBack(), 500)
          } catch (e) {
            wx.hideLoading()
            console.error("删除动态失败:", e)
            // 这里会打印出具体是 404(接口不存在) 还是 500
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  goEdit() {
    // 跳转到发布页，带上参数
    wx.navigateTo({ 
      url: `/pages/publish/publish?id=${this.data.post.id}` 
    })
  },

  previewImage(e) {
    const urls = e.currentTarget.dataset.urls
    const current = e.currentTarget.dataset.current
    wx.previewImage({ urls, current })
  }
})