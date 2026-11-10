function isCloudFile(value) {
  return typeof value === 'string' && value.indexOf('cloud://') === 0
}

async function resolveCloudImages(images = []) {
  if (!Array.isArray(images) || images.length === 0) {
    return []
  }

  const fileIDs = images.filter(isCloudFile)
  if (fileIDs.length === 0) {
    return images.slice()
  }
  if (!wx.cloud) {
    return images.slice()
  }

  try {
    const result = await wx.cloud.callFunction({
      name: 'getTempUrls',
      data: { fileIDs }
    })
    const urls = Array.isArray(result.result) ? result.result : []
    const urlMap = {}
    fileIDs.forEach((fileID, index) => {
      urlMap[fileID] = urls[index] || fileID
    })
    return images.map((image) => urlMap[image] || image)
  } catch (error) {
    console.error('获取云图片临时链接失败', error)
    return images.slice()
  }
}

async function resolveCloudImagesBatch(imageLists = []) {
  const lists = (imageLists || []).map((images) => (Array.isArray(images) ? images.slice() : []))
  const fileIDs = []
  const seen = {}
  lists.forEach((images) => {
    images.forEach((image) => {
      if (isCloudFile(image) && !seen[image]) {
        seen[image] = true
        fileIDs.push(image)
      }
    })
  })

  if (fileIDs.length === 0 || !wx.cloud) {
    return lists
  }

  try {
    const result = await wx.cloud.callFunction({
      name: 'getTempUrls',
      data: { fileIDs }
    })
    const urls = Array.isArray(result.result) ? result.result : []
    const urlMap = {}
    fileIDs.forEach((fileID, index) => {
      urlMap[fileID] = urls[index] || fileID
    })
    return lists.map((images) => images.map((image) => urlMap[image] || image))
  } catch (error) {
    console.error('批量获取云图片临时链接失败', error)
    return lists
  }
}

async function uploadPostImage(filePath, index = 0) {
  if (!wx.cloud) {
    throw new Error('当前基础库不支持云开发')
  }

  const matched = filePath.match(/\.[a-zA-Z0-9]+$/)
  const extension = matched ? matched[0] : '.jpg'
  const cloudPath = `post/${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}${extension}`
  const result = await wx.cloud.uploadFile({
    cloudPath,
    filePath
  })

  if (!result.fileID) {
    throw new Error('图片上传失败')
  }
  return result.fileID
}

async function uploadPetAvatar(filePath) {
  if (!wx.cloud) {
    throw new Error('当前基础库不支持云开发')
  }

  const matched = filePath.match(/\.[a-zA-Z0-9]+$/)
  const extension = matched ? matched[0] : '.jpg'
  const cloudPath = `pet/avatar/${Date.now()}-${Math.floor(Math.random() * 10000)}${extension}`
  const result = await wx.cloud.uploadFile({
    cloudPath,
    filePath
  })

  if (!result.fileID) {
    throw new Error('头像上传失败')
  }
  return result.fileID
}

async function uploadUserAvatar(filePath) {
  if (!wx.cloud) {
    throw new Error('当前基础库不支持云开发')
  }

  const matched = filePath.match(/\.[a-zA-Z0-9]+$/)
  const extension = matched ? matched[0] : '.jpg'
  const cloudPath = `user/avatar/${Date.now()}-${Math.floor(Math.random() * 10000)}${extension}`
  const result = await wx.cloud.uploadFile({
    cloudPath,
    filePath
  })

  if (!result.fileID) {
    throw new Error('头像上传失败')
  }
  return result.fileID
}

async function uploadProfileCover(filePath) {
  if (!wx.cloud) {
    throw new Error('当前基础库不支持云开发')
  }

  const matched = filePath.match(/\.[a-zA-Z0-9]+$/)
  const extension = matched ? matched[0] : '.jpg'
  const cloudPath = `user/cover/${Date.now()}-${Math.floor(Math.random() * 10000)}${extension}`
  const result = await wx.cloud.uploadFile({
    cloudPath,
    filePath
  })

  if (!result.fileID) {
    throw new Error('背景图上传失败')
  }
  return result.fileID
}

async function deleteCloudFiles(fileIDs = []) {
  const ids = (Array.isArray(fileIDs) ? fileIDs : []).filter(isCloudFile)
  if (ids.length === 0 || !wx.cloud) {
    return
  }

  try {
    await wx.cloud.callFunction({
      name: 'deleteCloudFiles',
      data: { fileIDs: ids }
    })
  } catch (error) {
    console.error('清理云存储图片失败', error)
  }
}

module.exports = {
  resolveCloudImages,
  resolveCloudImagesBatch,
  uploadPostImage,
  uploadPetAvatar,
  uploadUserAvatar,
  uploadProfileCover,
  deleteCloudFiles
}
