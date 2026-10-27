const api = require('../../utils/api')

function getCurrentUser() {
  try {
    const user = wx.getStorageSync('user')
    return user && user.id ? user : null
  } catch (error) {
    return null
  }
}

function todayString() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function emptyForm() {
  return {
    name: '',
    breed: '',
    birthday: '',
    avatar: ''
  }
}

Page({
  data: {
    petId: null,
    userId: null,
    isEdit: false,
    saving: false,
    today: todayString(),
    form: emptyForm()
  },

  onLoad(options) {
    const user = getCurrentUser()
    const petId = Number(options.id || options.petId) || null
    this.setData({
      petId,
      isEdit: Boolean(petId)
    })

    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/login/login' })
      }, 500)
      return
    }

    this.setData({ userId: user.id })

    if (petId) {
      this.loadPet(petId)
    }
  },

  onShow() {
    const user = getCurrentUser()
    if (!user || user.id === this.data.userId) {
      return
    }

    this.setData({ userId: user.id })
    if (this.data.isEdit) {
      this.loadPet(this.data.petId)
    }
  },

  async loadPet(petId) {
    try {
      const pet = await api.getPet(petId)
      if (pet.userId !== this.data.userId) {
        wx.showToast({ title: '无权编辑该宠物', icon: 'none' })
        this.backToProfile()
        return
      }

      this.setData({
        form: {
          name: pet.name || '',
          breed: pet.breed || '',
          birthday: pet.birthday || '',
          avatar: pet.avatar || ''
        }
      })
    } catch (error) {
      // 请求层已统一提示错误
    }
  },

  onNameInput(event) {
    this.setData({ 'form.name': event.detail.value })
  },

  onBreedInput(event) {
    this.setData({ 'form.breed': event.detail.value })
  },

  onBirthdayChange(event) {
    this.setData({ 'form.birthday': event.detail.value })
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        const file = (result.tempFiles || [])[0]
        if (file) {
          this.setData({ 'form.avatar': file.tempFilePath })
        }
      }
    })
  },

  previewAvatar() {
    if (!this.data.form.avatar) {
      return
    }
    wx.previewImage({
      current: this.data.form.avatar,
      urls: [this.data.form.avatar]
    })
  },

  async savePet() {
    if (this.data.saving) {
      return
    }

    const name = (this.data.form.name || '').trim()
    if (!name) {
      wx.showToast({ title: '宠物昵称不能为空', icon: 'none' })
      return
    }

    const payload = {
      userId: this.data.userId,
      name,
      breed: (this.data.form.breed || '').trim(),
      birthday: this.data.form.birthday || null,
      avatar: this.data.form.avatar || null
    }

    this.setData({ saving: true })
    try {
      if (this.data.isEdit) {
        await api.updatePet(this.data.petId, payload)
      } else {
        await api.addPet(payload)
      }
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => this.backToProfile(), 500)
    } catch (error) {
      // 请求层已统一提示错误
    } finally {
      this.setData({ saving: false })
    }
  },

  deletePet() {
    if (!this.data.isEdit || this.data.saving) {
      return
    }

    wx.showModal({
      title: '删除宠物',
      content: '确认删除这只宠物吗？',
      success: async (result) => {
        if (!result.confirm) {
          return
        }

        this.setData({ saving: true })
        try {
          await api.deletePet(this.data.petId)
          wx.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => this.backToProfile(), 500)
        } catch (error) {
          // 请求层已统一提示错误
        } finally {
          this.setData({ saving: false })
        }
      }
    })
  },

  backToProfile() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 })
      return
    }
    wx.switchTab({ url: '/pages/profile/profile' })
  }
})
