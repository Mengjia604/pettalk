Page({
  data: {
    targetUserId: null,
    userId: 1,
    userInfo: {},
    fanCount: 0,
    followCount: 0,
    isFollowed: false
  },
  onLoad(options) {
    this.setData({ targetUserId: options.uid })
    this.getProfile()
  },
  getProfile() {
    wx.request({
      url: 'http://localhost:8080/api/user/profile/' + this.data.targetUserId,
      method: 'GET',
      data: { userId: this.data.userId },
      success: res => {
        const d = res.data.data
        this.setData({
          userInfo: d.user,
          fanCount: d.fanCount,
          followCount: d.followCount,
          isFollowed: d.isFollowed
        })
      }
    })
  },
  handleFollow() {
    wx.request({
      url: 'http://localhost:8080/api/follow',
      method: 'POST',
      data: {
        userId: this.data.userId,
        followedId: this.data.targetUserId
      },
      success: () => {
        this.getProfile()
      }
    })
  }
})
