若开发者仅有一个服务空间，`uniCloud`会自动识别，并将开发者这个唯一的服务空间设置为当前服务空间，之后的云函数、云存储等资源操作，均在当前服务空间进行。

若开发者创建了多个服务空间，`uniCloud`无法自动识别；需开发者在客户端调用云开发API之前，先调用初始化方法`uniCloud.init`，指定具体服务空间。

`uniCloud.init`方法会返回一个`uniCloud`实例，之后云开发API的调用都需要通过该`uniCloud`实例发起。

云函数会自动识别自己所属的服务空间，无需初始化。

`uniCloud.init`方法定义如下：

```
function init(options):uniCloud
```

`uniCloud.init`方法接受一个`options`参数，返回`uniCloud`实例，`uniCloud`实例可调用云函数、云存储相关API。

**options 参数说明**

|参数名				|类型		|必填				|默认值	|说明																								|平台差异说明		|
|:-:					|:-:		|:-:				|:-:		|:-:																								|:-:						|
|provider			|String	|是					|-			|选择服务供应商（可选值tencent，aliyun）						|								|
|spaceId			|String	|是					|-			|服务空间ID，**注意是服务空间ID，不是服务空间名称**	|								|
|clientSecret	|String	|阿里云必填	|-			|服务空间secret key，可以在uniCloud控制台查看				|仅阿里云侧支持	|
<!-- |endpoint			|String	|否					|https://api.bspapp.com	|服务空间地址																			|仅阿里云侧支持																																	| -->
<!-- |autoSignIn		|Boolean|否					|true										|是否自动匿名登录																	|仅腾讯云侧支持																																	|
|debugFunction|Boolean|否					|true										|是否启用云函数日志输出														|仅开发阶段生效，平台支持：APP、H5(使用`HBuilderX`内置浏览器获得更好的调试体验)	| -->

**示例代码**

```javascript
//开发者创建了多个服务空间，则需手动初始化
const myCloud = uniCloud.init({
  provider: 'aliyun',
  spaceId: 'xxxx-yyy',
  clientSecret: 'xxxx'
});
//通过uniCloud实例调用云开发的API
myCloud.callFunction()
myCloud.uploadFile()

//开发者仅创建了一个服务空间，则无需初始化
//可通过uniCloud直接调用云开发的API
uniCloud.callFunction()
uniCloud.uploadFile()
```

<!-- **注意**

- 服务提供商为腾讯云时，需要开发者手动去管理控制台开启匿名登录才可以操作云函数[详情](/uniCloud/authentication#匿名登录) -->