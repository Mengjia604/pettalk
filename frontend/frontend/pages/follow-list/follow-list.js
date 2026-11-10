const { get } = require('../../utils/request')

Page({
  data: {
    currentTab: 0, // 0:关注, 1:粉丝
    list: [],
    page: 1,
    size: 10,
    hasMore: true,
    loading: false
  },

  onLoad(options) {
    if (options.type === 'followers') {
      this.setData({ currentTab: 1 })
    }
    this.loadList(true)
  },

  switchTab(e) {
    const index = Number(e.currentTarget.dataset.index)
    if (index === this.data.currentTab) return
    this.setData({ currentTab: index })
    this.loadList(true)
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadList(false)
    }
  },

  async loadList(reset) {
    if (this.data.loading) return
    this.setData({ loading: true })
    const page = reset ? 1 : this.data.page + 1

    try {
      // 获取当前用户 ID
      const userId = wx.getStorageSync('userId') || 1
      // 判断调哪个接口（等 3 号队友提供接口，这里先写好路径）
      const apiUrl = this.data.currentTab === 0 
        ? `/user/${userId}/following` 
        : `/user/${userId}/followers`
      
      // 目前接口未通，先用 try-catch 兜底，或者先用假数据占位
      /* 
      const res = await get(apiUrl, { page, size: this.data.size })
      */
      
      // 👇 假数据占位（等队友好了之后删掉这段，用上面的 res）
      const res = {
        list: this.data.currentTab === 0 
          ? [{ userId: 2, nickname: '测试关注1' }, { userId: 3, nickname: '测试关注2' }]
          : [{ userId: 4, nickname: '测试粉丝1' }],
        hasMore: false
      }
      // 👆 假数据结束

      this.setData({
        list: reset ? res.list : this.data.list.concat(res.list),
        page,
        hasMore: res.hasMore
      })
    } catch (e) {
      console.error("加载列表失败", e)
    } finally {
      this.setData({ loading: false })
    }
  },

  onPullDownRefresh() {
    // 重置为第一页重新加载
    this.loadList(true).finally(() => {
      wx.stopPullDownRefresh()
    })
  }
})