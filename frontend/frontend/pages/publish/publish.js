const { createPost, updatePost, getPostDetail } = require('../../api/post')

Page({
  data: {
    content: '',
    images: [], 
    submitting: false,
    postId: null 
  },

  async onLoad(options) {
    if (options.id) {
      this.setData({ postId: options.id })
      wx.setNavigationBarTitle({ title: '编辑动态' })
      this.loadPostDetail(options.id)
    }
  },

  async loadPostDetail(id) {
    wx.showLoading({ title: '加载中' })
    try {
      const post = await getPostDetail(id)
      this.setData({ content: post.content })
      
      // 保存原始 fileID 和 转换后的临时链接
      this.originalImages = [...post.images]

      if (post.images && post.images.length > 0) {
        const cloudRes = await wx.cloud.callFunction({
          name: 'getTempUrls',
          data: { fileIDs: post.images }
        })
        const tempUrls = cloudRes.result || []
        this.oldTempUrls = tempUrls // 👈 记录旧的 http 链接
        this.setData({ images: tempUrls })
      }
    } catch (e) {
      wx.showToast({ title: '获取详情失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },

  chooseImage() {
    const left = 9 - this.data.images.length
    if (left <= 0) return
    wx.chooseMedia({
      count: left,
      mediaType: ['image'],
      success: (res) => {
        const paths = res.tempFiles.map(f => f.tempFilePath)
        this.setData({ images: this.data.images.concat(paths) })
      }
    })
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images.slice()
    images.splice(index, 1)
    this.setData({ images })
  },

  async submit() {
    if (this.data.submitting) return

    const content = (this.data.content || '').trim()
    if (!content && this.data.images.length === 0) {
      return wx.showToast({ title: '写点内容或选张图', icon: 'none' })
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '处理中...' })

    try {
      const finalFileIDs = []
      const oldTempUrls = this.oldTempUrls || []
      const originalImages = this.originalImages || []

      for (let i = 0; i < this.data.images.length; i++) {
        const img = this.data.images[i]
        
        // 判断是否是旧图：在旧链接数组里找得到
        const oldIndex = oldTempUrls.indexOf(img)
        
        if (oldIndex > -1) {
          // 是旧图，拿回原来的 cloud:// 地址
          finalFileIDs.push(originalImages[oldIndex])
        } else {
          // 是新图，执行上传
          const cloudPath = `post/${Date.now()}-${i}-${Math.floor(Math.random() * 10000)}.jpg`
          const uploadRes = await wx.cloud.uploadFile({ cloudPath, filePath: img })
          finalFileIDs.push(uploadRes.fileID)
        }
      }
      
      if (this.data.postId) {
        await updatePost(this.data.postId, { content, images: finalFileIDs })
        
        // 找出被删掉的旧图并清理
        if (originalImages.length > 0) {
          const deletedFiles = originalImages.filter(id => !finalFileIDs.includes(id))
          if (deletedFiles.length > 0) {
            wx.cloud.callFunction({
              name: 'deleteCloudFiles',
              data: { fileIDs: deletedFiles }
            })
          }
        }
      } else {
        await createPost({ content, images: finalFileIDs, petId: null })
      }

      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      
      const pages = getCurrentPages()
      const prev = pages[pages.length - 2]
      if (prev) {
        if (prev.fetchDetail) prev.fetchDetail(this.data.postId)
        else if (prev.refreshFeed) prev.refreshFeed()
      }
      
      setTimeout(() => wx.navigateBack(), 600)

    } catch (e) {
      wx.hideLoading()
      console.error("保存失败:", e)
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})