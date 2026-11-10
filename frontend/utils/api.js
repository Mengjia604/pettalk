const { request } = require('./request')
function buildQuery(params) {
  const query = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  return query ? `?${query}` : ''
}
function login(code) {
  return request({
    url: '/auth/login',
    method: 'POST',
    data: { code },
    auth: false
  })
}
function getFeed(page = 1, size = 10, currentUserId = null, keyword = '') {
  return request({
    url: `/post/feed${buildQuery({ page, size, currentUserId, keyword })}`
  })
}

function getHotFeed(page = 1, size = 10, currentUserId = null, keyword = '', channelId = null) {
  return request({
    url: `/post/hot${buildQuery({ page, size, currentUserId, keyword, channelId })}`
  })
}

function getChannels(currentUserId = null) {
  return request({
    url: `/channel/list${buildQuery({ currentUserId })}`
  })
}

function getHomeChannels(currentUserId = null) {
  return request({
    url: `/channel/home${buildQuery({ currentUserId })}`
  })
}

function getMyChannels(currentUserId = null) {
  return request({
    url: `/channel/mine${buildQuery({ currentUserId })}`
  })
}

function getChannel(channelId, currentUserId = null) {
  return request({
    url: `/channel/${channelId}${buildQuery({ currentUserId })}`
  })
}

function joinChannel(channelId) {
  return request({
    url: `/channel/${channelId}/join`,
    method: 'POST'
  })
}

function leaveChannel(channelId) {
  return request({
    url: `/channel/${channelId}/join`,
    method: 'DELETE'
  })
}

function getChannelPosts(channelId, page = 1, size = 10, currentUserId = null) {
  return request({
    url: `/channel/${channelId}/posts${buildQuery({ page, size, currentUserId })}`
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
function getFollowingList(userId, params = {}) {
  return request({
    url: `/user/${userId}/following${buildQuery({
      currentUserId: params.currentUserId,
      page: params.page,
      size: params.size
    })}`
  })
}

function getFollowersList(userId, params = {}) {
  return request({
    url: `/user/${userId}/followers${buildQuery({
      currentUserId: params.currentUserId,
      page: params.page,
      size: params.size
    })}`
  })
}

function updateUserProfile(data) {
  return request({
    url: '/user/profile',
    method: 'PUT',
    data
  })
}

function publishPost(data) {
  return request({
    url: '/post',
    method: 'POST',
    data
  })
}
function editPost(postId, data) {
  return request({
    url: `/post/${postId}`,
    method: 'PUT',
    data
  })
}

function deletePost(postId) {
  return request({
    url: `/post/${postId}`,
    method: 'DELETE'
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
  getHotFeed,
  getChannels,
  getHomeChannels,
  getMyChannels,
  getChannel,
  getChannelPosts,
  joinChannel,
  leaveChannel,
  getPost,
  getUserProfile,
  getFollowingList,
  getFollowersList,
  updateUserProfile,
  publishPost,
  editPost,
  deletePost,
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
