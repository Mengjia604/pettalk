# PetTalk
实现功能：点赞、评论、关注；前端：详情页、个人主页
## 模块
- backend：后端服务（点赞、评论、关注接口）
- frontend：前端页面（详情页、个人主页）
- docs/sql：数据库建表脚本

## 真机调试

前端默认接口地址为 `http://127.0.0.1:8080`。真机调试时，确保手机和电脑在同一局域网，并在微信开发者工具控制台执行：

```js
wx.setStorageSync('apiBaseUrl', 'http://电脑局域网IP:8080')
```

恢复默认地址：

```js
wx.removeStorageSync('apiBaseUrl')
```

