const { createPost } = require('../../api/post')

Page({
  data: {
    content: '',
    images: [],
    submitting: false
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
    wx.showLoading({ title: '发布中...' })

    try {
      // 1. 打印当前选中的图片本地路径
      console.log("当前选中的本地图片:", this.data.images)

      const fileIDs = []
      for (let i = 0; i < this.data.images.length; i++) {
        const filePath = this.data.images[i]
        const cloudPath = `post/${Date.now()}-${i}-${Math.floor(Math.random() * 10000)}.jpg`
        
        console.log(`开始上传第 ${i+1} 张图片...`)
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: filePath
        })
        
        console.log("上传成功，获得 fileID:", uploadRes.fileID)
        fileIDs.push(uploadRes.fileID)
      }

      console.log("准备发送给后端的图片数组:", fileIDs)

      // 2. 将文字和真实的 fileIDs 发送给后端
      await createPost({
        content,
        images: fileIDs, // 这里一定要确保传的是 fileIDs
        petId: null
      })

      wx.showToast({ title: '发布成功', icon: 'success' })
      
      // 延迟切回首页
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 600)
      
      const pages = getCurrentPages()
      const prev = pages[pages.length - 2]
      if (prev && prev.refreshFeed) {
        prev.refreshFeed()
      }
      
      setTimeout(() => wx.navigateBack(), 600)
    } catch (e) {
      wx.hideLoading()
      console.error("发布失败:", e)
      wx.showToast({ title: '发布失败，看控制台', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})