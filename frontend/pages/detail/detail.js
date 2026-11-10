const api = require('../../utils/api')
const { resolveCloudImages, deleteCloudFiles } = require('../../utils/cloud')

function getCurrentUserId() {
  const user = wx.getStorageSync('user')
  return user && user.id ? user.id : null
}

Page({
  data: {
    postId: null,
    userId: null,
    post: {},
    comments: [],
    loading: false
  },

  onLoad(options) {
    const postId = Number(options.postId || options.id)
    if (!postId) {
      wx.showToast({ title: '帖子不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 500)
      return
    }
    this.setData({
      postId,
      userId: getCurrentUserId()
    })
    if (wx.showShareMenu) {
      wx.showShareMenu({ menus: ['shareAppMessage'] })
    }
    this.fetchDetail()
  },

  onPullDownRefresh() {
    this.fetchDetail().finally(() => wx.stopPullDownRefresh())
  },

  async fetchDetail() {
    this.setData({ loading: true })
    try {
      const post = await api.getPost(this.data.postId, this.data.userId)
      this.rawImages = Array.isArray(post.images) ? post.images.slice() : []
      const images = await resolveCloudImages(post.images || [])
      const avatar = post.avatar
        ? (await resolveCloudImages([post.avatar]))[0]
        : ''
      this.setData({
        post: {
          ...post,
          images,
          avatar,
          liked: Boolean(post.liked)
        },
        loading: false
      })
    } catch (error) {
      this.setData({ loading: false })
    }
  },

  async toggleLike() {
    const userId = this.data.userId || getCurrentUserId()
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    const post = this.data.post
    if (!post || !post.id) {
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

  onPostMore() {
    const post = this.data.post
    if (!post || !post.id) {
      return
    }
    wx.showActionSheet({
      itemList: ['编辑帖子', '删除帖子'],
      success: (result) => {
        if (result.tapIndex === 0) {
          this.goEdit()
        } else if (result.tapIndex === 1) {
          this.confirmDeletePost()
        }
      }
    })
  },

  goEdit() {
    const post = this.data.post
    if (!post || !post.id) {
      return
    }
    wx.navigateTo({ url: `/pages/post-edit/post-edit?postId=${post.id}` })
  },

  confirmDeletePost() {
    const postId = this.data.post.id
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
          const result = await api.deletePost(postId)
          const fileIDs = (result && result.images) || this.rawImages || []
          deleteCloudFiles(fileIDs)
          wx.hideLoading()
          wx.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => {
            const pages = getCurrentPages()
            if (pages.length > 1) {
              wx.navigateBack()
            } else {
              wx.switchTab({ url: '/pages/index/index' })
            }
          }, 600)
        } catch (error) {
          wx.hideLoading()
        }
      }
    })
  },

  previewImage(event) {
    const urls = event.currentTarget.dataset.urls || []
    const current = event.currentTarget.dataset.current
    if (urls.length > 0) {
      wx.previewImage({ urls, current })
    }
  },

  goProfile() {
    const post = this.data.post
    if (!post || !post.userId) {
      return
    }
    wx.setStorageSync('profileTargetUserId', post.userId)
    wx.switchTab({ url: '/pages/profile/profile' })
  },

  onShareAppMessage() {
    const post = this.data.post || {}
    const title = (post.content || `${post.nickname || '宠物'}的帖子`)
      .replace(/\s+/g, ' ')
      .slice(0, 30)
    const share = {
      title: title || 'PetTalk 宠物动态',
      path: `/pages/detail/detail?postId=${this.data.postId}`
    }
    if (post.images && post.images[0]) {
      share.imageUrl = post.images[0]
    }
    return share
  }
})
