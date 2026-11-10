const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { fileIDs } = event
  if (!Array.isArray(fileIDs) || fileIDs.length === 0) {
    return { success: true }
  }

  try {
    const result = await cloud.deleteFile({ fileList: fileIDs })
    return { success: true, result }
  } catch (error) {
    console.error('deleteCloudFiles failed', error)
    return { success: false, errMsg: error.message }
  }
}
