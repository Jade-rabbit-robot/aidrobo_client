# Android App 打包说明

本文档说明如何基于当前工程生成可在安卓设备上安装的 App。

## 1. 前提条件

- Node.js 18 及以上
- npm 9 及以上
- Android Studio
- Android SDK
- Java 17

建议先确认以下命令可用：

```bash
node -v
npm -v
java -version
adb version
```

如果你在 Linux 上通过系统包安装过 Android SDK，还要额外确认 SDK 目录里真的有平台文件，例如：

```bash
ls /usr/lib/android-sdk/platforms
ls /usr/lib/android-sdk/build-tools
```

当前工程至少需要安装与 [android/variables.gradle](/home/dongfang/code/aidrobo_client/android/variables.gradle) 里 `compileSdkVersion` 对应的平台。当前仓库配置为 36，因此至少需要：

```bash
platforms;android-36
build-tools;36.0.0
platform-tools
```

## 2. 安装依赖

在工程根目录执行：

```bash
npm install
```

这一步会安装现有前端依赖，以及安卓封装所需的 Capacitor 依赖。

## 3. 配置机器人地址

不要再直接修改 `static2/js/rosApi.js` 中的连接地址。

推荐做法：启动 App 后进入“设置”页，直接修改“ROS WebSocket”并点击“保存并重连”。

如果你要给安装包提供默认值，再改这里：

`static2/js/appConfig.js`

示例：

```js
window.AIDROBO_APP_CONFIG = {
  rosURL: 'ws://192.168.1.120:9090'
};
```

说明：

- `127.0.0.1` 在安卓手机上表示手机自己，不是机器人。
- 必须填写机器人实际可访问的局域网 IP 或域名。
- 设置页保存后的地址会写入本机 `localStorage`，重启 App 后仍然生效。
- 如果运行中需要临时切换，也可以在浏览器控制台执行：

```js
localStorage.setItem('aidrobo.rosURL', 'ws://192.168.1.120:9090')
location.reload()
```

## 4. 初始化 Android 工程

首次执行：

```bash
npm run android:init
```

该命令会：

- 创建 `android/` 工程目录（如果尚不存在）
- 将 `dist/` 里的前端产物同步到安卓工程
- 自动检测 Android SDK，并生成 `android/local.properties`

## 5. 日常同步 Web 资源

每次前端代码修改后执行：

```bash
npm run android:sync
```

该命令会先执行 `npm run build`，再同步到安卓工程。

## 6. 用 Android Studio 打开工程

```bash
npm run android:open
```

打开后可以：

- 连接安卓真机调试
- 运行模拟器
- 配置签名
- 导出 release 包

## 7. 直接生成 Debug APK

```bash
npm run android:apk:debug
```

生成物路径：

```bash
android/app/build/outputs/apk/debug/app-debug.apk
```

## 8. 首次生成后建议检查的安卓配置

生成 `android/` 目录后，建议检查以下项：

### 8.1 明文网络权限

如果 ROS WebSocket 使用的是 `ws://` 而不是 `wss://`，安卓需要允许明文流量。

优先检查：

`android/app/src/main/AndroidManifest.xml`

确保 `<application>` 上存在：

```xml
android:usesCleartextTraffic="true"
```

### 8.2 网络权限

确认 Manifest 中存在：

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### 8.3 局域网访问

确保手机和机器人在同一局域网内，否则 WebSocket 无法连接。

## 9. 推荐打包流程

开发调试：

```bash
npm run android:sync
npm run android:open
```

快速生成测试包：

```bash
npm run android:apk:debug
```

如果脚本提示缺少 `platforms;android-36`，先补齐 SDK 组件后再重试。

正式发布：

- 用 Android Studio 打开 `android/`
- 配置签名 keystore
- 执行 `Build > Generate Signed Bundle / APK`

## 10. 常见问题

### WebSocket 连不上

优先检查：

- `static2/js/appConfig.js` 中的 `rosURL` 是否正确
- 手机能否 ping 通机器人 IP
- 安卓是否允许明文流量
- 机器人侧 `9090` 端口是否开放

### 页面能打开但数据不刷新

优先检查：

- ROSBridge 是否正常运行
- `/scan`、`/tf`、`/tf_static` 等话题是否真的在发
- 机器人和手机是否在同一网段

### `npm run android:init` 失败

优先检查：

- 是否已执行 `npm install`
- Android Studio / SDK / Java 是否安装完整
- 是否能正常执行 `npx cap --version`

### `npm run android:apk:debug` 只看到 `Build complete`

这两行是前端 webpack 的正常输出，不是 APK 已经打完：

```text
Build complete.
Tip: built files are meant to be served over an HTTP server.
```

真正的 APK 打包还会继续执行：

- `npx cap sync android`
- `android/gradlew assembleDebug`

如果随后失败，常见原因是：

- `android/local.properties` 没有写入 SDK 路径
- 没有安装与 `compileSdkVersion` 对应的 `platforms;android-xx`
- 没有安装匹配版本的 `build-tools`

现在仓库里的脚本会自动检测 SDK 并生成 `android/local.properties`。如果仍失败，优先检查：

```bash
cat android/local.properties
ls /usr/lib/android-sdk/platforms
ls /usr/lib/android-sdk/build-tools
```

## 11. 相关文件

- `capacitor.config.json`：Capacitor 安卓封装配置
- `static2/js/appConfig.js`：运行时 ROS 地址配置
- `scripts/android-init.sh`：初始化安卓工程
- `scripts/android-ensure-sdk.sh`：检测 SDK 并生成 `android/local.properties`
- `scripts/android-sync.sh`：同步 Web 资源到安卓工程
- `scripts/android-build-debug.sh`：打包 debug APK