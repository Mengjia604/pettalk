const api = require('../../utils/api')

function getCurrentUserId() {
  const user = wx.getStorageSync('user')
  return user && user.id ? user.id : null
}

Page({
  data: {
    posts: [],
    page: 1,
    size: 10,
    total: 0,
    hasMore: true,
    loading: false,
    currentUserId: null
  },

  onLoad() {
    this.setData({ currentUserId: getCurrentUserId() })
  },

  onShow() {
    this.setData({ currentUserId: getCurrentUserId() })
    this.loadFeed(true)
  },

  onPullDownRefresh() {
    this.loadFeed(true).finally(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadFeed(false)
    }
  },

  async loadFeed(reset) {
    if (this.data.loading) {
      return
    }

    const page = reset ? 1 : this.data.page + 1
    this.setData({ loading: true })

    try {
      const data = await api.getFeed(page, this.data.size)
      const records = (data.records || []).map((post) => ({
        ...post,
        liked: Boolean(post.liked)
      }))
      const posts = reset ? records : this.data.posts.concat(records)
      const total = Number(data.total || 0)

      this.setData({
        posts,
        page,
        total,
        hasMore: posts.length < total,
        loading: false
      })
    } catch (error) {
      this.setData({ loading: false })
    }
  },

  async toggleLike(event) {
    const postId = Number(event.currentTarget.dataset.id)
    const userId = this.data.currentUserId || getCurrentUserId()

    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }

    const index = this.data.posts.findIndex((post) => post.id === postId)
    if (index < 0) {
      return
    }

    const post = this.data.posts[index]
    const liked = !post.liked

    try {
      const data = liked
        ? await api.likePost(postId, userId)
        : await api.unlikePost(postId, userId)

      this.setData({
        [`posts[${index}].liked`]: Boolean(data.liked),
        [`posts[${index}].likeCount`]: data.likeCount
      })
    } catch (error) {
      // 请求层已统一提示错误
    }
  },

  goDetail(event) {
    const postId = event.currentTarget.dataset.id
    if (!postId) {
      return
    }
    wx.navigateTo({ url: `/pages/detail/detail?postId=${postId}` })
  },

  goProfile(event) {
    const userId = event.currentTarget.dataset.userId
    if (!userId) {
      return
    }
    wx.setStorageSync('profileTargetUserId', userId)
    wx.switchTab({ url: '/pages/profile/profile' })
  },

  goPublish() {
    wx.switchTab({ url: '/pages/publish/publish' })
  }
})
