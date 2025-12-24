# API 接口文档
## 文档信息
| 项目 | 内容 |
| ---- | ---- |
| **标题** | API Documentation |
| **版本** | v1 |
| **许可证** | MIT License |
| **服务地址** | http://ouc.it.srv.thinkpadstore.lighilit.top/ |
| **数据格式** | 接收与返回均为 JSON 格式 |
| **安全认证** | Basic 认证 |

## 接口列表
### 一、购物车接口（cart）
#### 1.  获取购物车列表
- **请求地址**：`/cart/`
- **请求方法**：GET
- **请求参数**：无
- **响应状态码**：200 OK
- **响应数据**：`CartItem` 数组

#### 2.  创建购物车项
- **请求地址**：`/cart/`
- **请求方法**：POST
- **请求参数**：请求体传 `CartItem` 对象（必填）
- **响应状态码**：201 Created
- **响应数据**：创建成功的 `CartItem` 对象

#### 3.  获取单个购物车项
- **请求地址**：`/cart/{id}/`
- **请求方法**：GET
- **路径参数**：`id`（字符串类型，必填）- 购物车项唯一标识
- **响应状态码**：200 OK
- **响应数据**：对应 `id` 的 `CartItem` 对象

#### 4.  全量更新购物车项
- **请求地址**：`/cart/{id}/`
- **请求方法**：PUT
- **路径参数**：`id`（字符串类型，必填）- 购物车项唯一标识
- **请求参数**：请求体传 `CartItem` 对象（必填）
- **响应状态码**：200 OK
- **响应数据**：更新后的 `CartItem` 对象

#### 5.  部分更新购物车项
- **请求地址**：`/cart/{id}/`
- **请求方法**：PATCH
- **路径参数**：`id`（字符串类型，必填）- 购物车项唯一标识
- **请求参数**：请求体传 `CartItem` 对象（必填）
- **响应状态码**：200 OK
- **响应数据**：更新后的 `CartItem` 对象

#### 6.  删除购物车项
- **请求地址**：`/cart/{id}/`
- **请求方法**：DELETE
- **路径参数**：`id`（字符串类型，必填）- 购物车项唯一标识
- **响应状态码**：204 No Content
- **响应数据**：无

### 二、登录接口（login）
#### 1.  账号登录获取令牌
- **请求地址**：`/login/`
- **请求方法**：POST
- **请求参数**：请求体传 `TokenObtainPair` 对象（必填）
- **响应状态码**
  - 200 OK：登录成功
  - 401 Unauthorized：未授权（无有效账号）
- **响应数据**
  - 200 OK 响应体：
    ```json
    {
      "refresh": "string", // 刷新令牌
      "access": "string"  // 访问令牌
    }
    ```
  - 401 Unauthorized 响应体：
    ```json
    {
      "detail": "No active account found with the given credentials"
    }
    ```

#### 2.  刷新访问令牌
- **请求地址**：`/login/token/refresh/`
- **请求方法**：POST
- **接口描述**：传入有效的刷新令牌，获取新的访问令牌
- **请求参数**：请求体传 `TokenRefresh` 对象（必填）
- **响应状态码**：201 Created
- **响应数据**：`TokenRefresh` 对象

### 三、商品接口（product）
#### 1.  获取商品列表
- **请求地址**：`/product/`
- **请求方法**：GET
- **请求参数**：无
- **响应状态码**：200 OK
- **响应数据**：`Product` 数组

#### 2.  获取单个商品详情
- **请求地址**：`/product/{id}/`
- **请求方法**：GET
- **路径参数**：`id`（整数类型，必填）- 商品唯一标识
- **响应状态码**：200 OK
- **响应数据**：对应 `id` 的 `Product` 对象

### 四、用户接口（user）
#### 1.  获取用户列表
- **请求地址**：`/user/`
- **请求方法**：GET
- **请求参数**：无
- **响应状态码**：200 OK
- **响应数据**：`User` 数组

#### 2.  创建用户
- **请求地址**：`/user/`
- **请求方法**：POST
- **请求参数**：请求体传 `User` 对象（必填）
- **响应状态码**：201 Created
- **响应数据**：创建成功的 `User` 对象

#### 3.  获取单个用户信息
- **请求地址**：`/user/{id}/`
- **请求方法**：GET
- **路径参数**：`id`（字符串类型，必填）- 用户唯一标识
- **响应状态码**：200 OK
- **响应数据**：对应 `id` 的 `User` 对象

#### 4.  全量更新用户信息
- **请求地址**：`/user/{id}/`
- **请求方法**：PUT
- **路径参数**：`id`（字符串类型，必填）- 用户唯一标识
- **请求参数**：请求体传 `User` 对象（必填）
- **响应状态码**：200 OK
- **响应数据**：更新后的 `User` 对象

#### 5.  部分更新用户信息
- **请求地址**：`/user/{id}/`
- **请求方法**：PATCH
- **路径参数**：`id`（字符串类型，必填）- 用户唯一标识
- **请求参数**：请求体传 `User` 对象（必填）
- **响应状态码**：200 OK
- **响应数据**：更新后的 `User` 对象

#### 6.  删除用户
- **请求地址**：`/user/{id}/`
- **请求方法**：DELETE
- **路径参数**：`id`（字符串类型，必填）- 用户唯一标识
- **响应状态码**：204 No Content
- **响应数据**：无

## 数据模型定义
### 1.  CartItem（购物车项）
| 字段名 | 类型 | 约束 | 说明 |
| ---- | ---- | ---- | ---- |
| id | integer | 只读 | 购物车项ID |
| total_price | string | 只读 | 总价 |
| original_total_price | string | 只读 | 原价总价 |
| cart | integer | 只读 | 关联购物车ID |
| quantity | integer | 0 ≤ 数值 ≤ 9223372036854775807 | 商品数量 |
| product | integer | 必填 | 关联商品ID |

### 2.  TokenObtainPair（登录令牌获取参数）
| 字段名 | 类型 | 约束 | 说明 |
| ---- | ---- | ---- | ---- |
| username | string | 必填，最小长度 1 | 用户名 |
| password | string | 必填，最小长度 1 | 密码 |

### 3.  TokenRefresh（令牌刷新参数/响应）
| 字段名 | 类型 | 约束 | 说明 |
| ---- | ---- | ---- | ---- |
| refresh | string | 必填，最小长度 1 | 刷新令牌 |
| access | string | 只读，最小长度 1 | 访问令牌 |

### 4.  Product（商品）
| 字段名 | 类型 | 约束 | 说明 |
| ---- | ---- | ---- | ---- |
| id | integer | 只读 | 商品ID |
| images | array[string] | 必填，URI格式，最小长度 1 | 商品图片链接列表 |
| name | string | 必填，1 ≤ 长度 ≤ 255 | 商品名称 |
| model | string | 必填，1 ≤ 长度 ≤ 100 | 商品型号 |
| price | string | 必填，decimal格式 | 商品价格 |
| description | string | 必填，最小长度 1 | 商品描述 |
| stock | integer | 必填，0 ≤ 数值 ≤ 9223372036854775807 | 商品库存 |
| image | string | 只读，URI格式 | 商品主图 |

### 5.  User（用户）
| 字段名 | 类型 | 约束 | 说明 |
| ---- | ---- | ---- | ---- |
| id | integer | 只读 | 用户ID |
| password | string | 必填，1 ≤ 长度 ≤ 128 | 密码 |
| last_login | string | 可为空，date-time格式 | 最后登录时间 |
| is_superuser | boolean | - | 是否为超级管理员 |
| username | string | 必填，1 ≤ 长度 ≤ 150，正则`^[\w.@+-]+$` | 用户名 |
| first_name | string | 最大长度 150 | 名 |
| last_name | string | 最大长度 150 | 姓 |
| is_staff | boolean | - | 是否为后台工作人员 |
| is_active | boolean | - | 账号是否激活 |
| date_joined | string | date-time格式 | 账号创建时间 |
| email | string | 必填，1 ≤ 长度 ≤ 254，email格式 | 邮箱 |
| is_vip | boolean | - | 是否为VIP用户 |
| groups | array[integer] | 元素唯一 | 关联用户组ID列表 |
| user_permissions | array[integer] | 元素唯一 | 关联用户权限ID列表 |

