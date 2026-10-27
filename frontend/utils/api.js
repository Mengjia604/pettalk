const { request } = require('./request')

function buildQuery(params) {
  const query = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')

  return query ? `?${query}` : ''
}

function login(openid, code) {
  const data = { openid }
  if (code) {
    data.code = code
  }
  return request({
    url: '/auth/login',
    method: 'POST',
    data,
    auth: false
  })
}

function getFeed(page = 1, size = 10, currentUserId = null) {
  return request({
    url: '/post/feed',
    data: { page, size, currentUserId }
  })
}

function getPost(postId, userId) {
  return request({
    url: `/post/${postId}${buildQuery({ userId })}`
  })
}

function getUserProfile(userId, currentUserId, page = 1, size = 10) {
  return request({
    url: `/user/${userId}/profile${buildQuery({ currentUserId, page, size })}`
  })
}

function publishPost(data) {
  return request({
    url: '/post',
    method: 'POST',
    data
  })
}

function getComments(postId, page = 1, size = 10) {
  return request({
    url: `/post/${postId}/comments`,
    data: { page, size }
  })
}

function createComment(data) {
  return request({
    url: '/comment',
    method: 'POST',
    data
  })
}

function likePost(postId, userId) {
  return request({
    url: `/post/${postId}/like`,
    method: 'POST',
    data: { userId }
  })
}

function unlikePost(postId, userId) {
  return request({
    url: `/post/${postId}/like${buildQuery({ userId })}`,
    method: 'DELETE'
  })
}

function followUser(followerId, followeeId) {
  return request({
    url: '/follow',
    method: 'POST',
    data: { followerId, followeeId }
  })
}

function unfollowUser(followerId, followeeId) {
  return request({
    url: `/follow${buildQuery({ followerId, followeeId })}`,
    method: 'DELETE'
  })
}

function getPets(userId) {
  return request({
    url: `/pet/${userId}`
  })
}

function getPet(id) {
  return request({
    url: `/pet/detail/${id}`
  })
}

function addPet(data) {
  return request({
    url: '/pet',
    method: 'POST',
    data
  })
}

function updatePet(id, data) {
  return request({
    url: `/pet/${id}`,
    method: 'PUT',
    data
  })
}

function deletePet(id) {
  return request({
    url: `/pet/${id}`,
    method: 'DELETE'
  })
}

module.exports = {
  login,
  getFeed,
  getPost,
  getUserProfile,
  publishPost,
  getComments,
  createComment,
  likePost,
  unlikePost,
  followUser,
  unfollowUser,
  getPets,
  getPet,
  addPet,
  updatePet,
  deletePet
}
