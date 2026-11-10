const api = require('../../utils/api')
const { resolveCloudImages } = require('../../utils/cloud')

function getCurrentUserId() {
  const user = wx.getStorageSync('user')
  return user && user.id ? user.id : null
}

Page({
  data: {
    channelId: null,
    channel: {},
    list: [],
    page: 1,
    size: 10,
    total: 0,
    hasMore: true,
    loading: false,
    joinLoading: false,
    currentUserId: null
  },

  onLoad(options) {
    const channelId = Number(options.channelId)
    if (!channelId) {
      wx.showToast({ title: '频道不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 500)
      return
    }
    let name = options.name || ''
    try {
      name = decodeURIComponent(name)
    } catch (error) {
      name = options.name || ''
    }
    if (name) {
      wx.setNavigationBarTitle({ title: name })
    }
    this.setData({
      channelId,
      currentUserId: getCurrentUserId()
    })
    if (wx.showShareMenu) {
      wx.showShareMenu({ menus: ['shareAppMessage'] })
    }
    this.loadChannel()
    this.loadPosts(true)
  },

  onShow() {
    const currentUserId = getCurrentUserId()
    if (this.data.channelId && currentUserId !== this.data.currentUserId) {
      this.setData({ currentUserId })
      this.loadChannel()
    }
  },

  onPullDownRefresh() {
    Promise.all([this.loadChannel(), this.loadPosts(true)])
      .finally(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPosts(false)
    }
  },

  async loadChannel() {
    try {
      const channel = await api.getChannel(this.data.channelId, this.data.currentUserId)
      this.setData({ channel: channel || {} })
      if (channel && channel.name) {
        wx.setNavigationBarTitle({ title: channel.name })
      }
    } catch (error) {
      // 请求层已统一提示错误
    }
  },

  async loadPosts(reset) {
    if (this.data.loading && !reset) {
      return
    }
    const page = reset ? 1 : this.data.page + 1
    const requestId = (this._requestId || 0) + 1
    this._requestId = requestId
    this.setData({ loading: true })

    try {
      const data = await api.getChannelPosts(
        this.data.channelId,
        page,
        this.data.size,
        this.data.currentUserId
      )
      if (requestId !== this._requestId) {
        return
      }
      const items = await Promise.all((data.list || []).map(async (post) => ({
        ...post,
        images: await resolveCloudImages(post.images || []),
        liked: Boolean(post.liked)
      })))
      if (requestId !== this._requestId) {
        return
      }
      this.setData({
        list: reset ? items : this.data.list.concat(items),
        page,
        total: data.total || 0,
        hasMore: Boolean(data.hasMore),
        loading: false
      })
    } catch (error) {
      if (requestId === this._requestId) {
        this.setData({ loading: false })
      }
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
    const liked = !this.data.list[index].liked
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

  toggleJoin() {
    const userId = this.data.currentUserId || getCurrentUserId()
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    if (this.data.joinLoading) {
      return
    }
    if (this.data.channel.joined) {
      wx.showModal({
        title: '退出频道',
        content: '退出后将不能在该频道发帖，确定退出吗？',
        success: (result) => {
          if (result.confirm) {
            this.updateMembership(false)
          }
        }
      })
      return
    }
    this.updateMembership(true)
  },

  async updateMembership(join) {
    this.setData({ joinLoading: true })
    try {
      const channel = join
        ? await api.joinChannel(this.data.channelId)
        : await api.leaveChannel(this.data.channelId)
      this.setData({ channel: channel || this.data.channel, joinLoading: false })
      wx.showToast({
        title: join ? '已加入频道' : '已退出频道',
        icon: 'success'
      })
    } catch (error) {
      this.setData({ joinLoading: false })
    }
  },

  previewImage(event) {
    const current = event.currentTarget.dataset.current
    const urls = event.currentTarget.dataset.urls || [current]
    wx.previewImage({ current, urls })
  },

  goDetail(event) {
    const postId = event.currentTarget.dataset.id
    if (postId) {
      wx.navigateTo({ url: `/pages/detail/detail?postId=${postId}` })
    }
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
    if (!this.data.channel.joined) {
      wx.showToast({ title: '请先加入频道', icon: 'none' })
      return
    }
    const app = getApp()
    if (app && app.globalData) {
      app.globalData.publishChannelId = this.data.channelId
    }
    wx.switchTab({ url: '/pages/publish/publish' })
  },

  onShareAppMessage(res) {
    const postId = Number(res && res.target && res.target.dataset && res.target.dataset.postId)
    const post = postId ? this.data.list.find((item) => item.id === postId) : null
    if (postId && post) {
      const share = {
        title: (post.content || `${post.nickname || '宠物'}的帖子`).replace(/\s+/g, ' ').slice(0, 30),
        path: `/pages/detail/detail?postId=${post.id}`
      }
      if (post.images && post.images[0]) {
        share.imageUrl = post.images[0]
      }
      return share
    }
    const channel = this.data.channel || {}
    return {
      title: `${channel.name || '宠物'}频道 - PetTalk`,
      path: `/pages/channel/channel?channelId=${this.data.channelId}&name=${encodeURIComponent(channel.name || '')}`
    }
  }
})
