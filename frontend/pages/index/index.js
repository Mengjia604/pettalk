const api = require('../../utils/api')
const { resolveCloudImages } = require('../../utils/cloud')

function getCurrentUserId() {
  const user = wx.getStorageSync('user')
  return user && user.id ? user.id : null
}

Page({
  data: {
    list: [],
    page: 1,
    size: 10,
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
      const data = await api.getFeed(page, this.data.size, this.data.currentUserId)
      const items = await Promise.all((data.list || []).map(async (post) => ({
        ...post,
        images: await resolveCloudImages(post.images || []),
        liked: Boolean(post.liked)
      })))
      const list = reset ? items : this.data.list.concat(items)

      this.setData({
        list,
        page,
        hasMore: Boolean(data.hasMore),
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

    const index = this.data.list.findIndex((post) => post.id === postId)
    if (index < 0) {
      return
    }

    const post = this.data.list[index]
    const liked = !post.liked

    try {
      const data = liked
        ? await api.likePost(postId, userId)
        : await api.unlikePost(postId, userId)

      this.setData({
        [`list[${index}].liked`]: Boolean(data.liked),
        [`list[${index}].likeCount`]: data.likeCount
      })
    } catch (error) {
      // 请求层已统一提示错误
    }
  },

  previewImage(event) {
    const current = event.currentTarget.dataset.current
    const urls = event.currentTarget.dataset.urls || [current]
    wx.previewImage({ current, urls })
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
