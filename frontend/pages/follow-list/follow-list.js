const api = require('../../utils/api')
const { resolveCloudImagesBatch } = require('../../utils/cloud')

function getCurrentUserId() {
  const user = wx.getStorageSync('user')
  return user && user.id ? user.id : null
}

function firstChar(value) {
  const text = String(value || '').trim()
  return text ? text.charAt(0) : '宠'
}

Page({
  data: {
    currentTab: 0,
    targetUserId: null,
    currentUserId: null,
    list: [],
    page: 1,
    size: 10,
    hasMore: true,
    loading: false
  },

  onLoad(options) {
    const currentUserId = getCurrentUserId()
    const targetUserId = Number(options.userId) || currentUserId || null
    const currentTab = options.type === 'followers' ? 1 : 0
    this.setData({ currentUserId, targetUserId, currentTab })
    if (targetUserId) {
      this.loadList(true)
    }
  },

  switchTab(event) {
    const index = Number(event.currentTarget.dataset.index)
    if (index === this.data.currentTab) {
      return
    }
    this.setData({ currentTab: index, list: [], page: 1, hasMore: true })
    this.loadList(true)
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadList(false)
    }
  },

  onPullDownRefresh() {
    this.loadList(true).finally(() => wx.stopPullDownRefresh())
  },

  async loadList(reset) {
    const targetUserId = this.data.targetUserId
    if (!targetUserId) {
      return
    }
    if (!reset && this.data.loading) {
      return
    }

    const page = reset ? 1 : this.data.page + 1
    const requestId = (this._requestId || 0) + 1
    this._requestId = requestId
    this.setData({ loading: true })

    try {
      const params = {
        currentUserId: this.data.currentUserId,
        page,
        size: this.data.size
      }
      const result = this.data.currentTab === 0
        ? await api.getFollowingList(targetUserId, params)
        : await api.getFollowersList(targetUserId, params)
      if (requestId !== this._requestId) {
        return
      }

      const records = Array.isArray(result) ? result : (result && result.list) || []
      const avatars = await resolveCloudImagesBatch(records.map((user) => (
        user.avatar ? [user.avatar] : []
      )))
      if (requestId !== this._requestId) {
        return
      }

      const items = records.map((user, index) => ({
        ...user,
        avatarUrl: (avatars[index] && avatars[index][0]) || '',
        avatarText: firstChar(user.nickname),
        following: Boolean(user.following)
      }))
      const hasMore = result && result.hasMore !== undefined
        ? Boolean(result.hasMore)
        : items.length >= this.data.size

      this.setData({
        list: reset ? items : this.data.list.concat(items),
        page,
        hasMore,
        loading: false
      })
    } catch (error) {
      if (requestId === this._requestId) {
        this.setData({ loading: false, hasMore: false })
      }
    }
  },

  async toggleFollow(event) {
    const index = Number(event.currentTarget.dataset.index)
    const item = this.data.list[index]
    const currentUserId = this.data.currentUserId
    if (!item) {
      return
    }
    if (!currentUserId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    if (item.id === currentUserId) {
      return
    }

    try {
      const data = item.following
        ? await api.unfollowUser(currentUserId, item.id)
        : await api.followUser(currentUserId, item.id)
      this.setData({
        [`list[${index}].following`]: Boolean(data.following)
      })
    } catch (error) {
      // 请求层已统一提示错误
    }
  },

  goUser(event) {
    const userId = Number(event.currentTarget.dataset.id)
    if (!userId) {
      return
    }
    wx.setStorageSync('profileTargetUserId', userId)
    wx.switchTab({ url: '/pages/profile/profile' })
  }
})
