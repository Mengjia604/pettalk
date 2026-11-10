const api = require('../../utils/api')
const {
  resolveCloudImages,
  uploadUserAvatar,
  uploadProfileCover
} = require('../../utils/cloud')

function getCurrentUser() {
  try {
    const user = wx.getStorageSync('user')
    return user && user.id ? user : null
  } catch (error) {
    return null
  }
}

function firstChar(value) {
  const text = String(value || '').trim()
  return text ? text.charAt(0) : '宠'
}

Page({
  data: {
    userId: null,
    loading: true,
    loaded: false,
    loadError: '',
    saving: false,
    nickname: '',
    bio: '',
    bioCount: 0,
    avatarText: '宠',
    avatarUrl: '',
    coverUrl: '',
    originalAvatar: '',
    originalCover: '',
    avatarFile: '',
    coverFile: ''
  },

  onLoad() {
    const user = getCurrentUser()
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/login/login' })
      }, 500)
      return
    }
    this.setData({ userId: user.id })
    this.loadProfile()
  },

  async loadProfile() {
    this.setData({ loading: true, loadError: '' })
    try {
      const profile = await api.getUserProfile(this.data.userId, this.data.userId, 1, 1)
      const user = profile.user || {}
      const [coverUrl, avatarUrl] = await resolveCloudImages([
        user.cover || '',
        user.avatar || ''
      ])
      const nickname = user.nickname || ''
      const bio = user.bio || ''
      this.setData({
        nickname,
        bio,
        bioCount: bio.length,
        avatarText: firstChar(nickname),
        avatarUrl: avatarUrl || '',
        coverUrl: coverUrl || '',
        originalAvatar: user.avatar || '',
        originalCover: user.cover || '',
        loaded: true
      })
    } catch (error) {
      this.setData({
        loaded: false,
        loadError: (error && error.message) || '资料加载失败，请稍后重试'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  retryLoad() {
    this.loadProfile()
  },

  onNicknameInput(event) {
    const nickname = event.detail.value
    this.setData({
      nickname,
      avatarText: firstChar(nickname)
    })
  },

  onBioInput(event) {
    const bio = event.detail.value
    this.setData({ bio, bioCount: bio.length })
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        const file = (result.tempFiles || [])[0]
        if (file) {
          this.setData({
            avatarFile: file.tempFilePath,
            avatarUrl: file.tempFilePath
          })
        }
      }
    })
  },

  chooseCover() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        const file = (result.tempFiles || [])[0]
        if (file) {
          this.setData({
            coverFile: file.tempFilePath,
            coverUrl: file.tempFilePath
          })
        }
      }
    })
  },

  async saveProfile() {
    if (this.data.saving) {
      return
    }
    if (!this.data.loaded) {
      wx.showToast({ title: '请先加载资料', icon: 'none' })
      return
    }

    const nickname = (this.data.nickname || '').trim()
    const bio = (this.data.bio || '').trim()
    if (!nickname) {
      wx.showToast({ title: '名字不能为空', icon: 'none' })
      return
    }
    if (nickname.length > 50) {
      wx.showToast({ title: '名字不能超过 50 个字符', icon: 'none' })
      return
    }
    if (bio.length > 200) {
      wx.showToast({ title: '简介不能超过 200 个字符', icon: 'none' })
      return
    }

    this.setData({ saving: true })
    try {
      let avatar = this.data.originalAvatar || null
      let cover = this.data.originalCover || null
      if (this.data.avatarFile) {
        avatar = await uploadUserAvatar(this.data.avatarFile)
      }
      if (this.data.coverFile) {
        cover = await uploadProfileCover(this.data.coverFile)
      }

      const result = await api.updateUserProfile({ nickname, bio, avatar, cover })
      const user = getCurrentUser() || {}
      wx.setStorageSync('user', {
        ...user,
        nickname: result.nickname || nickname,
        bio: result.bio || bio,
        avatar: result.avatar || avatar || '',
        cover: result.cover || cover || ''
      })
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 600)
    } catch (error) {
      wx.showToast({
        title: (error && error.message) || '保存失败，请稍后重试',
        icon: 'none'
      })
    } finally {
      this.setData({ saving: false })
    }
  }
})
