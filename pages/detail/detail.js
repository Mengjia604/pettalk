const api = require('../../utils/api')

function getCurrentUserId() {
  const user = wx.getStorageSync('user')
  return user && user.id ? user.id : null
}

Page({
  data: {
    postId: null,
    post: null,
    isSelf: false,
    comments: [],
    page: 1,
    size: 10,
    total: 0,
    hasMore: true,
    loading: false,
    commentContent: '',
    submitting: false,
    currentUserId: null
  },

  onLoad(options) {
    const postId = Number(options.postId)
    const currentUserId = getCurrentUserId()

    if (!postId) {
      wx.showToast({ title: '动态不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 600)
      return
    }

    this.setData({ postId, currentUserId })
    this.loadDetail()
    this.loadComments(true)
  },

  onPullDownRefresh() {
    Promise.all([this.loadDetail(), this.loadComments(true)])
      .finally(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadComments(false)
    }
  },

  async loadDetail() {
    try {
      const post = await api.getPost(this.data.postId, this.data.currentUserId)
      this.setData({
        post,
        isSelf: Boolean(this.data.currentUserId && post.userId === this.data.currentUserId)
      })
    } catch (error) {
      // 请求层已统一提示错误
    }
  },

  async loadComments(reset) {
    if (this.data.loading) {
      return
    }

    const page = reset ? 1 : this.data.page + 1
    this.setData({ loading: true })

    try {
      const data = await api.getComments(this.data.postId, page, this.data.size)
      const records = data.records || []
      const comments = reset ? records : this.data.comments.concat(records)
      const total = Number(data.total || 0)

      this.setData({
        comments,
        page,
        total,
        hasMore: comments.length < total,
        loading: false
      })
    } catch (error) {
      this.setData({ loading: false })
    }
  },

  onCommentInput(event) {
    this.setData({ commentContent: event.detail.value })
  },

  async submitComment() {
    if (this.data.submitting) {
      return
    }

    const userId = this.data.currentUserId || getCurrentUserId()
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }

    const content = this.data.commentContent.trim()
    if (!content) {
      wx.showToast({ title: '评论内容不能为空', icon: 'none' })
      return
    }
    if (!this.data.post) {
      wx.showToast({ title: '动态加载中', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    try {
      const comment = await api.createComment({
        postId: this.data.postId,
        userId,
        content
      })
      this.setData({
        comments: [comment].concat(this.data.comments),
        commentContent: '',
        total: this.data.total + 1,
        'post.commentCount': Number(this.data.post.commentCount || 0) + 1
      })
    } catch (error) {
      // 请求层已统一提示错误
    } finally {
      this.setData({ submitting: false })
    }
  },

  async toggleLike() {
    const userId = this.data.currentUserId || getCurrentUserId()
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }

    const post = this.data.post
    if (!post) {
      return
    }

    const liked = !post.liked
    try {
      const data = liked
        ? await api.likePost(post.id, userId)
        : await api.unlikePost(post.id, userId)
      this.setData({
        'post.liked': Boolean(data.liked),
        'post.likeCount': data.likeCount
      })
    } catch (error) {
      // 请求层已统一提示错误
    }
  },

  async toggleFollow() {
    const userId = this.data.currentUserId || getCurrentUserId()
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }

    const post = this.data.post
    if (!post || post.userId === userId) {
      return
    }

    const following = !post.following
    try {
      const data = following
        ? await api.followUser(userId, post.userId)
        : await api.unfollowUser(userId, post.userId)
      this.setData({ 'post.following': Boolean(data.following) })
    } catch (error) {
      // 请求层已统一提示错误
    }
  },

  goProfile() {
    const post = this.data.post
    if (!post) {
      return
    }
    wx.setStorageSync('profileTargetUserId', post.userId)
    wx.switchTab({ url: '/pages/profile/profile' })
  },

  previewImage(event) {
    const current = event.currentTarget.dataset.url
    wx.previewImage({ current, urls: this.data.post ? this.data.post.images : [] })
  }
})
