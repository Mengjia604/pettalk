Page({
  data: {
    postId: null,
    userId: 1,
    post: {},
    likeCount: 0,
    isLiked: false,
    commentTotal: 0,
    commentList: []
  },
  onLoad(options) {
    this.setData({ postId: options.postId })
    this.getDetail()
  },
  getDetail() {
    wx.request({
      url: 'http://localhost:8080/api/post/detail/' + this.data.postId,
      method: 'GET',
      data: { userId: this.data.userId },
      success: res => {
        const d = res.data.data
        this.setData({
          post: d.post,
          likeCount: d.likeCount,
          isLiked: d.isLiked,
          commentTotal: d.commentTotal,
          commentList: d.commentList
        })
      }
    })
  },
  handleLike() {
    wx.request({
      url: 'http://localhost:8080/api/post/like',
      method: 'POST',
      data: {
        postId: this.data.postId,
        userId: this.data.userId
      },
      success: () => {
        this.getDetail()
      }
    })
  }
})
