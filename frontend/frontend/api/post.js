const { get, post, request } = require('../utils/request')

module.exports = {
  createPost(data) {
    return post('/post', data)
  },
  getFeed(page, size) {
    return get('/post/feed', { page, size })
  },
  getPostDetail(id) {
    return get('/post/' + id)
  },
  updatePost(id, data) {
    // 直接使用原生的 request 传参，绝对不会出错
    return request({
      url: '/post/' + id,
      method: 'PUT',
      data: data
    })
  },
  deletePost(id) {
    // 直接使用原生的 request 传参
    return request({
      url: '/post/' + id,
      method: 'DELETE'
    })
  }
}