const api = require('../../utils/api')
const { resolveCloudImagesBatch } = require('../../utils/cloud')

function getCurrentUserId() {
  const user = wx.getStorageSync('user')
  return user && user.id ? user.id : null
}

const HOT_KEYWORDS = ['猫咪', '狗狗', '领养', '新手养宠', '宠物友好', '猫粮']

const RECOMMENDATION_BATCHES = [
  [
    { tag: '猫', keyword: '猫咪', title: '猫咪掉毛季，家里这样清理最省力', meta: '热门内容 · 2.3 万浏览' },
    { tag: '狗', keyword: '狗狗', title: '下班后陪狗狗玩的 15 分钟小游戏', meta: '热门内容 · 1.8 万浏览' }
  ],
  [
    { tag: '新', keyword: '新手养宠', title: '第一次养宠物，先准备好这几样东西', meta: '热门内容 · 1.5 万浏览' },
    { tag: '领', keyword: '领养', title: '领养代替购买，给流浪宠物一个家', meta: '热门内容 · 1.2 万浏览' }
  ]
]

function buildContentParts(content, keyword) {
  if (!content) {
    return []
  }
  if (!keyword) {
    return [{ id: 0, text: content, highlight: false }]
  }

  const parts = []
  const lowerContent = content.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()
  let start = 0
  let index = lowerContent.indexOf(lowerKeyword)

  while (index >= 0) {
    if (index > start) {
      parts.push({ id: parts.length, text: content.slice(start, index), highlight: false })
    }
    parts.push({
      id: parts.length,
      text: content.slice(index, index + keyword.length),
      highlight: true
    })
    start = index + keyword.length
    index = lowerContent.indexOf(lowerKeyword, start)
  }

  if (start < content.length) {
    parts.push({ id: parts.length, text: content.slice(start), highlight: false })
  }
  return parts
}

Page({
  data: {
    activeTab: 'hot',
    list: [],
    channels: [],
    topChannels: [],
    topChannelsTitle: '推荐频道',
    topChannelsError: false,
    page: 1,
    size: 10,
    hasMore: true,
    loading: false,
    channelLoading: false,
    currentUserId: null,
    keyword: '',
    activeKeyword: '',
    total: 0,
    showSuggest: false,
    hotKeywords: HOT_KEYWORDS,
    recommendations: RECOMMENDATION_BATCHES[0],
    recommendationBatch: 0
  },

  onLoad() {
    const currentUserId = getCurrentUserId()
    this.setData({ currentUserId })
    if (wx.showShareMenu) {
      wx.showShareMenu({ menus: ['shareAppMessage'] })
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
    const currentUserId = getCurrentUserId()
    this.setData({ currentUserId })

    const app = getApp()
    const requestedTab = app && app.globalData ? app.globalData.homeTab : ''
    if (app && app.globalData) {
      app.globalData.homeTab = ''
    }
    this.loadTopChannels(currentUserId)

    if (app && app.globalData && app.globalData.homeReset) {
      app.globalData.homeReset = false
      wx.pageScrollTo({ scrollTop: 0, duration: 0 })
      this.setData({
        keyword: '',
        activeKeyword: '',
        showSuggest: false,
        activeTab: 'hot',
        list: [],
        page: 1,
        total: 0,
        hasMore: true
      })
      this.loadFeed(true)
      return
    }

    if (requestedTab && requestedTab !== this.data.activeTab) {
      this.setData({ activeTab: requestedTab, showSuggest: false })
    }
    const activeTab = requestedTab || this.data.activeTab
    if (activeTab === 'channel') {
      this.loadChannels(currentUserId)
    } else {
      this.loadFeed(true)
    }
  },

  onPullDownRefresh() {
    const tasks = [this.loadTopChannels()]
    tasks.push(this.data.activeTab === 'channel' ? this.loadChannels() : this.loadFeed(true))
    Promise.all(tasks).finally(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.activeTab === 'hot' && this.data.hasMore && !this.data.loading) {
      this.loadFeed(false)
    }
  },

  switchMainTab(event) {
    const tab = event.currentTarget.dataset.tab
    if (!tab || tab === this.data.activeTab) {
      return
    }
    this.setData({ activeTab: tab, showSuggest: false })
    if (tab === 'channel') {
      this.loadChannels()
    } else {
      this.loadFeed(true)
    }
  },

  onSearchFocus() {
    clearTimeout(this.hideSuggestTimer)
    this.setData({ showSuggest: true })
  },

  onSearchBlur() {
    clearTimeout(this.hideSuggestTimer)
    this.hideSuggestTimer = setTimeout(() => {
      this.setData({ showSuggest: false })
    }, 200)
  },

  onSearchInput(event) {
    this.setData({ keyword: event.detail.value })
  },

  onSearchConfirm() {
    this.applySearch()
  },

  onSearchTap() {
    this.applySearch()
  },

  onSearchClear() {
    clearTimeout(this.hideSuggestTimer)
    this.setData({ keyword: '', showSuggest: true })
    this.applySearch('')
  },

  onHotKeywordTap(event) {
    this.applySearch(event.currentTarget.dataset.keyword || '')
  },

  onRecommendationTap(event) {
    this.applySearch(event.currentTarget.dataset.keyword || '')
  },

  onRecommendationRefresh() {
    const next = (this.data.recommendationBatch + 1) % RECOMMENDATION_BATCHES.length
    this.setData({
      recommendationBatch: next,
      recommendations: RECOMMENDATION_BATCHES[next]
    })
  },

  closeSuggest() {
    clearTimeout(this.hideSuggestTimer)
    this.setData({ showSuggest: false })
  },

  applySearch(value) {
    clearTimeout(this.hideSuggestTimer)
    const keyword = (value === undefined ? this.data.keyword : value).trim()
    this.setData({
      keyword,
      activeKeyword: keyword,
      activeTab: 'hot',
      showSuggest: false,
      list: [],
      page: 1,
      total: 0,
      hasMore: true
    })
    this.loadFeed(true)
  },

  async loadFeed(reset) {
    if (this.data.loading && !reset) {
      return
    }

    const page = reset ? 1 : this.data.page + 1
    const requestId = (this._feedRequestId || 0) + 1
    this._feedRequestId = requestId
    this.setData({ loading: true })

    try {
      const data = await api.getHotFeed(
        page,
        this.data.size,
        this.data.currentUserId,
        this.data.activeKeyword,
        null
      )
      if (requestId !== this._feedRequestId) {
        return
      }

      const rows = data.list || []
      const items = rows.map((post) => ({
        ...post,
        liked: Boolean(post.liked),
        contentParts: buildContentParts(post.content, this.data.activeKeyword)
      }))

      const list = reset ? items : this.data.list.concat(items)

      this.setData({
        list,
        page,
        total: data.total || 0,
        hasMore: Boolean(data.hasMore),
        loading: false
      })
      this.fillFeedImages(requestId, rows)
    } catch (error) {
      if (requestId !== this._feedRequestId) {
        return
      }
      this.setData({ loading: false })
    }
  },

  async fillFeedImages(requestId, rows) {
    const imageLists = await resolveCloudImagesBatch(rows.map((post) => post.images || []))
    if (requestId !== this._feedRequestId) {
      return
    }

    const imageMap = {}
    rows.forEach((post, index) => {
      imageMap[post.id] = imageLists[index] || []
    })
    const list = this.data.list.map((item) => (
      Object.prototype.hasOwnProperty.call(imageMap, item.id)
        ? { ...item, images: imageMap[item.id] }
        : item
    ))
    this.setData({ list })
  },

  async loadChannels(currentUserId = this.data.currentUserId) {
    if (this.data.channelLoading) {
      return
    }
    this.setData({ channelLoading: true })
    try {
      const channels = await api.getChannels(currentUserId)
      this.setData({
        channels: Array.isArray(channels) ? channels : [],
        channelLoading: false
      })
    } catch (error) {
      this.setData({ channelLoading: false })
    }
  },

  async loadTopChannels(currentUserId) {
    const userId = typeof currentUserId === 'number' || typeof currentUserId === 'string'
      ? currentUserId
      : this.data.currentUserId
    try {
      const channels = await api.getHomeChannels(userId)
      const list = Array.isArray(channels) ? channels : []
      if (list.length > 0) {
        this.applyTopChannels(list)
        return
      }
    } catch (error) {
      console.warn('[index] 首页频道加载失败，回退到频道列表', error)
    }
    try {
      const all = await api.getChannels(userId)
      this.applyTopChannels(Array.isArray(all) ? all.slice(0, 2) : [])
    } catch (error) {
      console.warn('[index] 频道列表加载失败', error)
      this.setData({ topChannels: [], topChannelsError: true })
    }
  },

  applyTopChannels(list) {
    this.setData({
      topChannels: list,
      topChannelsTitle: list.some((channel) => channel.joined)
        ? '我的频道'
        : '推荐频道',
      topChannelsError: false
    })
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

  onPostMore(event) {
    const postId = Number(event.currentTarget.dataset.id)
    const post = this.data.list.find((item) => item.id === postId)
    if (!post) {
      return
    }
    wx.showActionSheet({
      itemList: ['删除帖子'],
      itemColor: '#E5484D',
      success: (result) => {
        if (result.tapIndex === 0) {
          this.confirmDeletePost(postId)
        }
      }
    })
  },

  confirmDeletePost(postId) {
    wx.showModal({
      title: '删除帖子',
      content: '删除后无法恢复，确定删除吗？',
      confirmText: '删除',
      confirmColor: '#E5484D',
      success: async (result) => {
        if (!result.confirm) {
          return
        }
        wx.showLoading({ title: '删除中', mask: true })
        try {
          await api.deletePost(postId)
          const list = this.data.list.filter((item) => item.id !== postId)
          this.setData({
            list,
            total: Math.max(this.data.total - 1, 0)
          })
          wx.hideLoading()
          wx.showToast({ title: '已删除', icon: 'success' })
          if (list.length === 0 && this.data.hasMore) {
            this.loadFeed(true)
          }
        } catch (error) {
          wx.hideLoading()
        }
      }
    })
  },

  goDetail(event) {
    const postId = event.currentTarget.dataset.id
    if (!postId) {
      return
    }
    wx.navigateTo({ url: `/pages/detail/detail?postId=${postId}` })
  },

  goChannel(event) {
    const channelId = event.currentTarget.dataset.id
    if (!channelId) {
      return
    }
    const name = event.currentTarget.dataset.name || ''
    wx.navigateTo({
      url: `/pages/channel/channel?channelId=${channelId}&name=${encodeURIComponent(name)}`
    })
  },

  goAllChannels() {
    this.setData({ activeTab: 'channel', showSuggest: false })
    this.loadChannels()
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
  },

  onShareAppMessage(res) {
    if (!res || res.from !== 'button') {
      return {
        title: 'PetTalk 宠物圈',
        path: '/pages/index/index'
      }
    }
    const postId = Number(res.target && res.target.dataset && res.target.dataset.postId)
    let post = postId ? this.data.list.find((item) => item.id === postId) : null
    if (!post) {
      post = this.data.list[0]
    }
    if (!post) {
      return {
        title: 'PetTalk 宠物圈',
        path: '/pages/index/index'
      }
    }

    const title = (post.content || `${post.nickname || '宠物'}的帖子`)
      .replace(/\s+/g, ' ')
      .slice(0, 30)
    const share = {
      title,
      path: `/pages/detail/detail?postId=${post.id}`
    }
    if (post.images && post.images[0]) {
      share.imageUrl = post.images[0]
    }
    return share
  }
})
