const cloud = require('wx-server-sdk')

// 初始化云环境
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 云函数入口函数
exports.main = async (event, context) => {
  const { fileIDs } = event // 接收前端传来的 fileID 数组
  if (!fileIDs || fileIDs.length === 0) return []

  try {
    // 云函数拥有管理员权限，可以无视权限获取任何文件的临时链接
    const res = await cloud.getTempFileURL({
      fileList: fileIDs
    })
    // 提取链接返回给前端
    return res.fileList.map(f => f.tempFileURL)
  } catch (err) {
    console.error(err)
    return []
  }
}