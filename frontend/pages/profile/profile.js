const api = require('../../utils/api')
const { resolveCloudImagesBatch } = require('../../utils/cloud')

function getCurrentUserId() {
  const user = wx.getStorageSync('user')
  return user && user.id ? user.id : null
}

function getStatusBarHeight() {
  try {
    if (wx.getWindowInfo) {
      return wx.getWindowInfo().statusBarHeight || 20
    }
    return wx.getSystemInfoSync().statusBarHeight || 20
  } catch (error) {
    return 20
  }
}

function firstChar(value) {
  const text = String(value || '').trim()
  return text ? text.charAt(0) : '宠'
}

Page({
  data: {
    statusBarHeight: 20,
    navTitle: '我的',
    targetUserId: null,
    currentUserId: null,
    isSelf: false,
    profile: null,
    pets: [],
    channels: [],
    avatarUrl: '',
    coverUrl: '',
    avatarText: '宠',
    posts: [],
    page: 1,
    size: 10,
    total: 0,
    hasMore: true,
    loading: false,
    initialLoading: true,
    loadError: '',
    needLogin: false
  },

  onLoad(options) {
    const currentUserId = getCurrentUserId()
    const targetUserId = Number(options.userId) || currentUserId || null
    this.setData({
      statusBarHeight: getStatusBarHeight(),
      currentUserId,
      targetUserId,
      isSelf: Boolean(currentUserId && targetUserId === currentUserId),
      needLogin: !targetUserId
    })
    if (wx.showShareMenu) {
      wx.showShareMenu({ menus: ['shareAppMessage'] })
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }

    const currentUserId = getCurrentUserId()
    let pendingTargetUserId = null
    let shouldResetToSelf = false
    try {
      pendingTargetUserId = Number(wx.getStorageSync('profileTargetUserId')) || null
      if (pendingTargetUserId) {
        wx.removeStorageSync('profileTargetUserId')
      }
      shouldResetToSelf = Boolean(wx.getStorageSync('profileTabReset'))
      if (shouldResetToSelf) {
        wx.removeStorageSync('profileTabReset')
      }
    } catch (error) {
      pendingTargetUserId = null
      shouldResetToSelf = false
    }

    const targetUserId = pendingTargetUserId
      || (shouldResetToSelf ? currentUserId : (this.data.targetUserId || currentUserId))
      || null
    if (!targetUserId) {
      this.setData({
        currentUserId,
        targetUserId: null,
        isSelf: false,
        needLogin: true,
        initialLoading: false
      })
      return
    }

    this.setData({
      currentUserId,
      targetUserId,
      isSelf: Boolean(currentUserId && targetUserId === currentUserId),
      needLogin: false
    })
    this.loadProfile(true)
  },

  onTabItemTap() {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) {
      this.setData({ needLogin: true })
      return
    }
    this.setData({
      currentUserId,
      targetUserId: currentUserId,
      isSelf: true,
      needLogin: false
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
    const currentUserId = this.data.currentUserId
    const requestId = (this._requestId || 0) + 1
    this._requestId = requestId
    this.setData({
      loading: true,
      initialLoading: reset ? !this.data.profile : this.data.initialLoading,
      loadError: ''
    })

    if (reset) {
      this.loadChannels(targetUserId)
    }

    try {
      const profile = await api.getUserProfile(targetUserId, currentUserId, page, this.data.size)
      if (requestId !== this._requestId) {
        return
      }

      const user = profile.user || {}
      const rawPets = Array.isArray(profile.pets) ? profile.pets : []
      const rawPosts = (profile.posts && profile.posts.records) || []
      const imageLists = [
        user.cover ? [user.cover] : [],
        user.avatar ? [user.avatar] : []
      ]
      rawPets.forEach((pet) => imageLists.push(pet.avatar ? [pet.avatar] : []))
      rawPosts.forEach((post) => imageLists.push(Array.isArray(post.images) ? post.images : []))

      const resolved = await resolveCloudImagesBatch(imageLists)
      if (requestId !== this._requestId) {
        return
      }

      const coverUrl = (resolved[0] && resolved[0][0]) || ''
      const avatarUrl = (resolved[1] && resolved[1][0]) || ''
      const pets = rawPets.map((pet, index) => ({
        ...pet,
        avatarUrl: (resolved[2 + index] && resolved[2 + index][0]) || '',
        avatarText: firstChar(pet.name)
      }))
      const postStart = 2 + rawPets.length
      const records = rawPosts.map((post, index) => ({
        ...post,
        images: resolved[postStart + index] || []
      }))
      const total = Number((profile.posts && profile.posts.total) || 0)
      const posts = reset ? records : this.data.posts.concat(records)
      const isSelf = Boolean(currentUserId && targetUserId === currentUserId)

      this.setData({
        profile,
        posts,
        pets,
        coverUrl,
        avatarUrl,
        avatarText: firstChar(user.nickname),
        navTitle: isSelf ? '我的' : (user.nickname || '主页'),
        isSelf,
        page,
        total,
        hasMore: posts.length < total,
        loading: false,
        initialLoading: false,
        loadError: ''
      })
    } catch (error) {
      if (requestId !== this._requestId) {
        return
      }
      this.setData({
        loading: false,
        initialLoading: false,
        loadError: (error && error.message) || '资料加载失败，请稍后重试'
      })
    }
  },

  async loadChannels(userId) {
    const requestId = (this._channelRequestId || 0) + 1
    this._channelRequestId = requestId
    try {
      const result = await api.getMyChannels(userId)
      if (requestId !== this._channelRequestId) {
        return
      }
      this.setData({ channels: Array.isArray(result) ? result : [] })
    } catch (error) {
      if (requestId === this._channelRequestId) {
        this.setData({ channels: [] })
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
    if (!profile || this.data.isSelf || !profile.user) {
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

  goEditProfile() {
    if (!this.data.isSelf) {
      return
    }
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit' })
  },

  goFollowList(event) {
    const type = event.currentTarget.dataset.type
    const userId = this.data.targetUserId
    if (!userId || !type) {
      return
    }
    wx.navigateTo({
      url: `/pages/follow-list/follow-list?userId=${userId}&type=${type}`
    })
  },

  goPetArchive() {
    if (!this.data.isSelf) {
      return
    }
    wx.navigateTo({ url: '/pages/pet-list/pet-list' })
  },

  goPetEdit(event) {
    if (!this.data.isSelf) {
      return
    }
    const petId = Number(event.currentTarget.dataset.id)
    if (!petId) {
      return
    }
    wx.navigateTo({ url: `/pages/pet-edit/pet-edit?id=${petId}` })
  },

  goChannel(event) {
    const channelId = Number(event.currentTarget.dataset.id)
    if (!channelId) {
      return
    }
    const name = event.currentTarget.dataset.name || ''
    wx.navigateTo({
      url: `/pages/channel/channel?channelId=${channelId}&name=${encodeURIComponent(name)}`
    })
  },

  goChannelSquare() {
    const app = getApp()
    if (app && app.globalData) {
      app.globalData.homeTab = 'channel'
    }
    wx.switchTab({ url: '/pages/index/index' })
  },

  goDetail(event) {
    const postId = event.currentTarget.dataset.id
    if (!postId) {
      return
    }
    wx.navigateTo({ url: `/pages/detail/detail?postId=${postId}` })
  },

  previewImage(event) {
    const current = event.currentTarget.dataset.url
    const urls = event.currentTarget.dataset.urls || [current]
    wx.previewImage({ current, urls })
  },

  retryLoad() {
    const currentUserId = getCurrentUserId()
    const targetUserId = this.data.targetUserId || currentUserId || null
    if (!targetUserId) {
      this.setData({ currentUserId, needLogin: true, initialLoading: false })
      return
    }
    this.setData({
      currentUserId,
      targetUserId,
      isSelf: Boolean(currentUserId && targetUserId === currentUserId),
      needLogin: false,
      loadError: ''
    })
    this.loadProfile(true, true)
  },

  goLogin() {
    wx.setStorageSync('loginRedirect', 'profile')
    wx.navigateTo({ url: '/pages/login/login' })
  },

  onShareAppMessage() {
    const profile = this.data.profile
    return {
      title: profile && profile.user ? profile.user.nickname : 'PetTalk',
      path: `/pages/profile/profile?userId=${this.data.targetUserId || ''}`
    }
  }
})
