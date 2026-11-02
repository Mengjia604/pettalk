const { get, post } = require('../utils/request')

module.exports = {
  // 发布动态
  createPost(data) {
    return post('/post', data)
  },
  // 获取首页列表
  getFeed(page, size) {
    return get('/post/feed', { page: page || 1, size: size || 10 })
  },
  // 获取单条动态详情 (给3号用)
  getPostDetail(id) {
    return get('/post/' + id)
  }
}