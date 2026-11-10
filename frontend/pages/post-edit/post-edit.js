const api = require('../../utils/api')
const {
  uploadPostImage,
  resolveCloudImages,
  deleteCloudFiles
} = require('../../utils/cloud')

function getCurrentUserId() {
  const user = wx.getStorageSync('user')
  return user && user.id ? user.id : null
}

Page({
  data: {
    postId: null,
    userId: null,
    content: '',
    images: [],
    pets: [],
    petIndex: 0,
    selectedPetName: '不关联',
    petId: null,
    loading: true,
    submitting: false
  },

  onLoad(options) {
    const postId = Number(options.postId || options.id)
    if (!postId) {
      wx.showToast({ title: '帖子不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 500)
      return
    }

    this.imageRefs = []
    this.originalImages = []
    this.setData({
      postId,
      userId: getCurrentUserId()
    })
    wx.setNavigationBarTitle({ title: '编辑动态' })
    this.loadPets()
    this.loadPost(postId)
  },

  async loadPets() {
    const userId = this.data.userId
    if (!userId) {
      return
    }
    try {
      const pets = await api.getPets(userId)
      const options = [{ id: null, name: '不关联' }].concat(pets || [])
      this.setData({ pets: options })
      this.syncPetSelection(this.data.petId)
    } catch (error) {
      // 请求层已统一提示错误
    }
  },

  async loadPost(postId) {
    wx.showLoading({ title: '加载中', mask: true })
    try {
      const post = await api.getPost(postId, this.data.userId)
      const rawImages = Array.isArray(post.images) ? post.images : []
      const images = await resolveCloudImages(rawImages)
      this.originalImages = rawImages.slice()
      this.originalPetId = post.petId || null
      this.imageRefs = rawImages.map((fileID) => ({ type: 'old', fileID }))
      this.setData({
        content: post.content || '',
        images,
        petId: post.petId || null,
        loading: false
      })
      this.syncPetSelection(post.petId)
    } catch (error) {
      this.setData({ loading: false })
      wx.showToast({ title: '获取动态失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  syncPetSelection(petId) {
    const pets = this.data.pets
    if (!pets.length) {
      return
    }
    let petIndex = 0
    if (petId) {
      const found = pets.findIndex((pet) => pet.id === petId)
      if (found >= 0) {
        petIndex = found
      }
    }
    this.setData({
      petIndex,
      selectedPetName: pets[petIndex].name
    })
  },

  onContentInput(event) {
    this.setData({ content: event.detail.value })
  },

  onPetChange(event) {
    const petIndex = Number(event.detail.value)
    const pet = this.data.pets[petIndex]
    if (!pet && this.originalPetId) {
      wx.showToast({ title: '暂不支持取消宠物关联', icon: 'none' })
      this.syncPetSelection(this.originalPetId)
      return
    }
    this.setData({
      petIndex,
      selectedPetName: pet ? pet.name : '不关联',
      petId: pet ? pet.id : null
    })
  },

  chooseImages() {
    const remain = 9 - this.data.images.length
    if (remain <= 0) {
      wx.showToast({ title: '最多选择 9 张图片', icon: 'none' })
      return
    }

    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        const paths = (result.tempFiles || []).map((file) => file.tempFilePath)
        paths.forEach((path) => {
          this.imageRefs.push({ type: 'new', path })
        })
        this.setData({ images: this.data.images.concat(paths) })
      }
    })
  },

  removeImage(event) {
    const index = Number(event.currentTarget.dataset.index)
    const images = this.data.images.slice()
    images.splice(index, 1)
    this.imageRefs.splice(index, 1)
    this.setData({ images })
  },

  previewImage(event) {
    const current = event.currentTarget.dataset.url
    wx.previewImage({ current, urls: this.data.images })
  },

  async submit() {
    if (this.data.submitting) {
      return
    }

    const content = this.data.content.trim()
    if (!content && this.data.images.length === 0) {
      wx.showToast({ title: '内容与图片不能同时为空', icon: 'none' })
      return
    }
    if (this.data.images.length > 9) {
      wx.showToast({ title: '图片最多 9 张', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '保存中...', mask: true })
    try {
      const fileIDs = []
      for (let index = 0; index < this.data.images.length; index += 1) {
        const ref = this.imageRefs[index]
        if (ref && ref.type === 'old') {
          fileIDs.push(ref.fileID)
        } else {
          const fileID = await uploadPostImage(this.data.images[index], index)
          fileIDs.push(fileID)
        }
      }

      const payload = { content, images: fileIDs }
      if (this.data.petId) {
        payload.petId = this.data.petId
      }
      await api.editPost(this.data.postId, payload)

      const removedImages = this.originalImages.filter((fileID) => !fileIDs.includes(fileID))
      if (removedImages.length > 0) {
        deleteCloudFiles(removedImages)
      }

      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      const pages = getCurrentPages()
      const prev = pages[pages.length - 2]
      if (prev && typeof prev.fetchDetail === 'function') {
        prev.fetchDetail()
      }
      setTimeout(() => {
        if (pages.length > 1) {
          wx.navigateBack()
        } else {
          wx.switchTab({ url: '/pages/index/index' })
        }
      }, 600)
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: error.message || '保存失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
