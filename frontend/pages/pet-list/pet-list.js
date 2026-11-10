const api = require('../../utils/api')
const { resolveCloudImages } = require('../../utils/cloud')

function getCurrentUser() {
  try {
    const user = wx.getStorageSync('user')
    return user && user.id ? user : null
  } catch (error) {
    return null
  }
}

Page({
  data: {
    userId: null,
    pets: [],
    loading: false,
    loadError: '',
    needLogin: false
  },

  onLoad() {
    const user = getCurrentUser()
    if (!user) {
      this.setData({ needLogin: true })
      return
    }
    this.setData({ userId: user.id })
  },

  onShow() {
    const user = getCurrentUser()
    if (!user) {
      this.setData({
        userId: null,
        pets: [],
        loading: false,
        needLogin: true
      })
      return
    }
    this.setData({ userId: user.id, needLogin: false })
    this.loadPets()
  },

  onPullDownRefresh() {
    this.loadPets().finally(() => wx.stopPullDownRefresh())
  },

  async loadPets() {
    const userId = this.data.userId
    if (!userId) {
      return
    }

    const requestId = (this._requestId || 0) + 1
    this._requestId = requestId
    this.setData({ loading: true, loadError: '' })

    try {
      const result = await api.getPets(userId)
      if (requestId !== this._requestId) {
        return
      }

      const pets = Array.isArray(result) ? result : []
      const list = await Promise.all(pets.map(async (pet) => {
        const avatarUrl = pet.avatar
          ? (await resolveCloudImages([pet.avatar]))[0]
          : ''
        return {
          ...pet,
          avatarUrl: avatarUrl || ''
        }
      }))
      if (requestId !== this._requestId) {
        return
      }
      this.setData({ pets: list, loading: false })
    } catch (error) {
      if (requestId !== this._requestId) {
        return
      }
      this.setData({
        loading: false,
        loadError: (error && error.message) || '宠物档案加载失败，请稍后重试'
      })
    }
  },

  goEdit(event) {
    const petId = Number(event.currentTarget.dataset.id)
    if (!petId) {
      return
    }
    wx.navigateTo({ url: `/pages/pet-edit/pet-edit?id=${petId}` })
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/pet-edit/pet-edit' })
  },

  goLogin() {
    wx.setStorageSync('loginRedirect', 'profile')
    wx.navigateTo({ url: '/pages/login/login' })
  },

  retryLoad() {
    const user = getCurrentUser()
    if (!user) {
      this.setData({ needLogin: true })
      return
    }
    this.setData({ userId: user.id, needLogin: false, loadError: '' })
    this.loadPets()
  }
})
