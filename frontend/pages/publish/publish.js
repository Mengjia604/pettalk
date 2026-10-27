const api = require('../../utils/api')
const { uploadPostImage } = require('../../utils/cloud')

function getCurrentUserId() {
  const user = wx.getStorageSync('user')
  return user && user.id ? user.id : null
}

Page({
  data: {
    content: '',
    images: [],
    pets: [],
    petIndex: 0,
    selectedPetName: '不关联',
    petId: null,
    submitting: false,
    userId: null
  },

  onLoad() {
    this.setData({ userId: getCurrentUserId() })
  },

  onShow() {
    const userId = getCurrentUserId()
    this.setData({ userId })
    if (userId) {
      this.loadPets(userId)
    }
  },

  async loadPets(userId) {
    try {
      const pets = await api.getPets(userId)
      const options = [{ id: null, name: '不关联' }].concat(pets || [])
      this.setData({
        pets: options,
        petIndex: 0,
        selectedPetName: options[0].name,
        petId: null
      })
    } catch (error) {
      // 请求层已统一提示错误
    }
  },

  onContentInput(event) {
    this.setData({ content: event.detail.value })
  },

  onPetChange(event) {
    const petIndex = Number(event.detail.value)
    const pet = this.data.pets[petIndex]
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
        this.setData({ images: this.data.images.concat(paths) })
      }
    })
  },

  removeImage(event) {
    const index = Number(event.currentTarget.dataset.index)
    const images = this.data.images.slice()
    images.splice(index, 1)
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

    const userId = this.data.userId || getCurrentUserId()
    if (!userId) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }

    const content = this.data.content.trim()
    if (!content && this.data.images.length === 0) {
      wx.showToast({ title: '请输入内容或选择图片', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '发布中...', mask: true })
    try {
      const fileIDs = []
      for (let index = 0; index < this.data.images.length; index += 1) {
        const fileID = await uploadPostImage(this.data.images[index], index)
        fileIDs.push(fileID)
      }

      await api.publishPost({
        userId,
        petId: this.data.petId,
        content,
        images: fileIDs
      })
      wx.showToast({ title: '发布成功', icon: 'success' })
      this.setData({
        content: '',
        images: [],
        petIndex: 0,
        selectedPetName: '不关联',
        petId: null
      })
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 600)
    } catch (error) {
      wx.showToast({ title: error.message || '发布失败', icon: 'none' })
    } finally {
      wx.hideLoading()
      this.setData({ submitting: false })
    }
  }
})
