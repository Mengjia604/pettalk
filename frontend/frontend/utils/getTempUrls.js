module.exports = async function(fileIDs) {
  if (!fileIDs || fileIDs.length === 0) return []
  try {
    const cloudRes = await wx.cloud.callFunction({
      name: 'getTempUrls',
      data: { fileIDs }
    })
    return cloudRes.result || []
  } catch (e) {
    console.error("获取临时链接失败", e)
    return fileIDs
  }
}