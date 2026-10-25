const api = require('../../utils/api')

function getCurrentUserId() {
  const user = wx.getStorageSync('user')
  return user && user.id ? user.id : null
}

Page({
  data: {
    targetUserId: null,
    currentUserId: null,
    isSelf: false,
    profile: null,
    posts: [],
    page: 1,
    size: 10,
    total: 0,
    hasMore: true,
    loading: false
  },

  onLoad(options) {
    const currentUserId = getCurrentUserId()
    const targetUserId = Number(options.userId) || currentUserId || null

    this.setData({
      currentUserId,
      targetUserId,
      isSelf: Boolean(targetUserId && currentUserId && targetUserId === currentUserId)
    })
  },

  onShow() {
    const currentUserId = getCurrentUserId()
    const pendingTargetUserId = Number(wx.getStorageSync('profileTargetUserId')) || null
    if (pendingTargetUserId) {
      wx.removeStorageSync('profileTargetUserId')
    }
    const targetUserId = pendingTargetUserId || this.data.targetUserId || currentUserId || null
    if (!targetUserId) {
      return
    }

    this.setData({
      currentUserId,
      targetUserId,
      isSelf: Boolean(currentUserId && targetUserId === currentUserId)
    })
    this.loadProfile(true)
  },

  onTabItemTap() {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) {
      return
    }
    this.setData({
      currentUserId,
      targetUserId: currentUserId,
      isSelf: true
    })
    this.loadProfile(true, true)
  },

  onPullDownRefresh() {
    this.loadProfile(true).finally(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadProfile(false)
    }
  },

  async loadProfile(reset, force = false) {
    if ((this.data.loading && !force) || !this.data.targetUserId) {
      return
    }

    const page = reset ? 1 : this.data.page + 1
    const targetUserId = this.data.targetUserId
    const requestId = (this._requestId || 0) + 1
    this._requestId = requestId
    this.setData({ loading: true })

    try {
      const profile = await api.getUserProfile(
        targetUserId,
        this.data.currentUserId,
        page,
        this.data.size
      )
      if (requestId !== this._requestId) {
        return
      }
      const records = (profile.posts && profile.posts.records) || []
      const total = Number((profile.posts && profile.posts.total) || 0)
      const posts = reset ? records : this.data.posts.concat(records)

      this.setData({
        profile,
        posts,
        page,
        total,
        hasMore: posts.length < total,
        loading: false
      })
    } catch (error) {
      if (requestId === this._requestId) {
        this.setData({ loading: false })
      }
    }
  },

  async toggleFollow() {
    const userId = this.data.currentUserId || getCurrentUserId()
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }

    const profile = this.data.profile
    if (!profile || this.data.isSelf) {
      return
    }

    const following = !profile.following
    try {
      const data = following
        ? await api.followUser(userId, profile.user.id)
        : await api.unfollowUser(userId, profile.user.id)
      const followerCount = Number(profile.followerCount || 0)

      this.setData({
        'profile.following': Boolean(data.following),
        'profile.followerCount': following
          ? followerCount + 1
          : Math.max(followerCount - 1, 0)
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

  goPetEdit() {
    if (!this.data.isSelf) {
      return
    }
    wx.navigateTo({ url: '/pages/pet-edit/pet-edit' })
  },

  goPublish() {
    if (!this.data.isSelf) {
      return
    }
    wx.switchTab({ url: '/pages/publish/publish' })
  },

  previewImage(event) {
    const current = event.currentTarget.dataset.url
    const urls = event.currentTarget.dataset.urls || [current]
    wx.previewImage({ current, urls })
  },

  onShareAppMessage() {
    const profile = this.data.profile
    return {
      title: profile && profile.user ? profile.user.nickname : 'PetTalk',
      path: `/pages/profile/profile?userId=${this.data.targetUserId || ''}`
    }
  }
})
