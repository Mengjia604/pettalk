const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { fileIDs } = event
  if (!fileIDs || fileIDs.length === 0) return { success: true }

  try {
    const res = await cloud.deleteFile({
      fileList: fileIDs
    })
    return { success: true, result: res }
  } catch (err) {
    console.error(err)
    return { success: false, errMsg: err.message }
  }
}