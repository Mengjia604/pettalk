# PetTalk 接口文档

## 1. 通用约定

- 基础地址：`http://127.0.0.1:8080`
- 请求体：`application/json`
- 分页参数：`page` 默认 `1`，`size` 默认 `10`，`size` 最大 `50`
- 当前未接入正式鉴权，用户身份通过 `userId`、`followerId` 等参数传入
- 所有业务接口统一返回 `Result`：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

`code = 200` 表示成功，`code = 500` 表示业务或服务器错误。HTTP 状态码当前仍可能为 200，前端以 `body.code` 判断结果。

## 2. 登录

### POST /auth/login

模拟微信登录。当前不校验微信 `code`，使用 `openid` 识别用户。

请求体：

```json
{
  "openid": "test_openid_123",
  "code": "wx.login 返回的临时 code（可选，当前后端预留）"
}
```

响应 `data`：

```json
{
  "token": "mock_token_1",
  "user": {
    "id": 1,
    "openid": "test_openid_123",
    "nickname": "微信用户_test",
    "avatar": null,
    "bio": null,
    "createTime": "2026-10-20 16:00:00"
  }
}
```

当前后端仍以 `openid` 识别用户，`code` 字段为后续接入微信 `code2session` 预留。

## 3. 个人主页

### GET /user/{userId}/profile

聚合用户资料、宠物、统计数据和个人动态。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `userId` | path | 是 | 主页用户 ID |
| `currentUserId` | query | 否 | 当前登录用户 ID，用于返回关注状态 |
| `page` | query | 否 | 动态页码，默认 1 |
| `size` | query | 否 | 动态每页数量，默认 10 |

响应 `data`：

```json
{
  "user": {
    "id": 1,
    "nickname": "微信用户_test",
    "avatar": null,
    "bio": "喜欢小动物",
    "createTime": "2026-10-20 16:00:00"
  },
  "pets": [],
  "postCount": 3,
  "followingCount": 2,
  "followerCount": 5,
  "following": true,
  "posts": {
    "records": [],
    "total": 3,
    "size": 10,
    "current": 1,
    "pages": 1
  }
}
```

未传 `currentUserId` 时，`following` 为 `null`；查看自己主页时也为 `false`。

## 4. 宠物档案

### GET /pet/{userId}

查询指定用户的宠物列表。

### GET /pet/detail/{id}

查询宠物详情。

### POST /pet

新增宠物。

```json
{
  "userId": 1,
  "name": "团子",
  "breed": "英短",
  "birthday": "2024-05-01",
  "avatar": "https://example.com/pet.png"
}
```

### PUT /pet/{id}

更新宠物，字段同新增宠物。

### DELETE /pet/{id}

删除宠物。

## 5. 动态

### POST /post

发布动态。文字和图片不能同时为空，最多上传 9 张图片。

```json
{
  "userId": 1,
  "petId": 1,
  "content": "今天带团子去公园",
  "images": ["cloud://cloud1-d2g2g1di987d43491.xxxx/post/1.jpg"]
}
```

`images` 存放 CloudBase 上传后返回的 `fileID`，前端展示时通过 `getTempUrls` 云函数换取临时访问链接。

响应 `data`：

```json
{
  "id": 1
}
```

### GET /post/feed

首页信息流，按发布时间倒序分页。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | query | 否 | 默认 1 |
| `size` | query | 否 | 默认 10，最大 50 |
| `currentUserId` | query | 否 | 当前用户 ID，用于返回点赞状态 |

响应 `data`：

```json
{
  "list": [],
  "page": 1,
  "size": 10,
  "total": 0,
  "hasMore": false
}
```

`list` 中每条动态字段包括：`id`、`userId`、`petId`、`content`、`images`、`likeCount`、`commentCount`、`createdAt`、`nickname`、`avatar`、`liked`、`following`。

### GET /post/{postId}

动态详情。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `postId` | path | 是 | 动态 ID |
| `userId` | query | 否 | 当前用户 ID，用于返回点赞和关注状态 |

响应 `data`：

```json
{
  "id": 1,
  "userId": 1,
  "petId": 1,
  "content": "今天带团子去公园",
  "images": [],
  "likeCount": 2,
  "commentCount": 1,
  "createdAt": "2026-10-20 16:00:00",
  "nickname": "微信用户_test",
  "avatar": null,
  "liked": true,
  "following": false
}
```

当前版本暂不提供动态修改和删除接口。宠物档案的修改、删除接口不受影响。

## 6. 评论

### POST /comment

发表评论，同一事务内更新动态评论数。

```json
{
  "postId": 1,
  "userId": 1,
  "content": "太可爱了"
}
```

### GET /post/{postId}/comments

按动态分页查询评论，按创建时间倒序。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `postId` | path | 是 | 动态 ID |
| `page` | query | 否 | 默认 1 |
| `size` | query | 否 | 默认 10，最大 50 |

评论字段包括：`id`、`postId`、`userId`、`content`、`createTime`、`nickname`、`avatar`。

## 7. 点赞

### POST /post/{postId}/like

点赞，重复调用保持幂等。

```json
{
  "userId": 1
}
```

### DELETE /post/{postId}/like?userId=1

取消点赞，重复调用保持幂等。

点赞和取消点赞均返回：

```json
{
  "liked": true,
  "likeCount": 3
}
```

## 8. 关注

### POST /follow

关注用户，重复调用保持幂等。

```json
{
  "followerId": 1,
  "followeeId": 2
}
```

### DELETE /follow?followerId=1&followeeId=2

取消关注，重复调用保持幂等。

关注和取消关注均返回：

```json
{
  "following": true
}
```

## 9. 图片云存储

- 发布页选择图片后，先调用 `wx.cloud.uploadFile` 上传到 CloudBase，保存返回的 `fileID`。
- 首页、动态详情和个人主页展示图片前，调用 `getTempUrls` 云函数批量换取临时 URL。
- CloudBase 环境：`cloud1-d2g2g1di987d43491`。
- 部署前需在微信开发者工具中上传并部署 `frontend/cloudfunctions/getTempUrls`，否则云图片无法正常显示。

## 10. 前端页面约定

### pages/login/login.js

- 数据：`loading`
- 事件：`handleLogin`、`login`
- 登录成功后缓存 `token`、`user`，并切换到首页

### pages/pet-edit/pet-edit.js

- 数据：`form`、`isEdit`、`saving`、`today`
- 事件：`onNameInput`、`onBreedInput`、`onBirthdayChange`、`chooseAvatar`、`previewAvatar`、`savePet`、`deletePet`
- 编辑模式通过页面参数 `id` 或 `petId` 传入宠物 ID

### pages/index/index.js

- 数据：`posts`、`page`、`size`、`total`、`hasMore`、`loading`、`currentUserId`
- 事件：`toggleLike`、`goDetail`、`goProfile`、`goPublish`
- `toggleLike`、`goDetail` 通过 `data-id` 读取动态 ID；`goProfile` 通过 `data-user-id` 读取用户 ID

### pages/publish/publish.js

- 数据：`content`、`images`、`pets`、`petId`、`petIndex`、`submitting`
- 事件：`onContentInput`、`chooseImages`、`removeImage`、`previewImage`、`onPetChange`、`submit`

### pages/detail/detail.js

- 数据：`post`、`comments`、`hasMore`、`commentContent`、`submitting`、`isSelf`
- 事件：`toggleLike`、`toggleFollow`、`goProfile`、`onCommentInput`、`submitComment`、`previewImage`

### pages/profile/profile.js

- 数据：`profile`、`posts`、`hasMore`、`loading`、`isSelf`
- 事件：`toggleFollow`、`goDetail`、`goPetEdit`、`goPublish`、`previewImage`
- 动态图片通过 `resolveCloudImages` 解析 `fileID` 后展示。
