const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { fileIDs } = event
  if (!Array.isArray(fileIDs) || fileIDs.length === 0) {
    return []
  }

  try {
    const result = await cloud.getTempFileURL({ fileList: fileIDs })
    return result.fileList.map((file) => file.tempFileURL)
  } catch (error) {
    console.error('getTempUrls failed', error)
    return []
  }
}
