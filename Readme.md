# 使用说明

```shell
#建议把项目解压到移动硬盘
unzip camera_save_tools.zip
#进入项目目录
cd camera_save_tools
#安装所需环境
apt install ffmpeg nodejs npm
npm install
#运行脚本
./install.sh
```



## configure.json配置文件参数说明

| 属性        | 类型   | 值   | 备注                                                         |
| ----------- | ------ | ---- | ------------------------------------------------------------ |
| threshold   | number | 90   | 必填，单位：百分比%<br />视频存储能够达到的磁盘整体使用情况占比，默认值90（不建议设置100）。<br />假设磁盘100G,那么视频存储在磁盘整体使用情况占比达到90%，即90G，就不会在使用更多空间了，允许稍微超出些许。 |
| logFilePath | string | log  | 必填，日志文件名称及存储路径                                 |
| videoTime   | number | 600  | 必填，单位：秒s<br />每个保存的视频的时间，全局属性          |
| savePath    | string | save | 必填，视频文件的存储目录                                     |
| devices     | array  |      | 必填，配置监控摄像头的设备，有几个摄像头设置几个             |

### devices下每个设备的配置参数说明

| 属性      | 类型   | 值                                                           | 备注                                   |
| --------- | ------ | ------------------------------------------------------------ | -------------------------------------- |
| name      | string | ''                                                           | 必填，设备名称（建议使用英文，自定义） |
| protocol  | string | rtsp<br />rtmp                                               | 必填，视频流协议                       |
| url       | string | rtmp://x.x.x.x/...<br />rtsp://[username]:[password]@x.x.x.x | 必填，视频流地址                       |
| videoTime | number | 600                                                          | 可选，优先级最高                       |

## 利用阿里云盘实现自动上传录像视频到云盘

项目地址：https://github.com/tickstep/aliyunpan

## apt安装

适用于apt包管理器的系统，例如Ubuntu，国产deepin深度操作系统等。目前只支持amd64和arm64架构的机器。

```
sudo curl -fsSL http://file.tickstep.com/apt/pgp | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/tickstep-packages-archive-keyring.gpg > /dev/null && echo "deb [signed-by=/etc/apt/trusted.gpg.d/tickstep-packages-archive-keyring.gpg arch=amd64,arm64] http://file.tickstep.com/apt aliyunpan main" | sudo tee /etc/apt/sources.list.d/tickstep-aliyunpan.list > /dev/null && sudo apt-get update && sudo apt-get install -y aliyunpan
 
```

安装完成执行

```shell
aliyunpan
```


## 如何获取RefreshToken

需要通过浏览器获取refresh_token。这里以Chrome浏览器为例，其他浏览器类似。
打开 [阿里云盘网页](https://www.aliyundrive.com/drive) 并进行登录，然后F12按键打开浏览器调试菜单，按照下面步骤进行 [![img](https://github.com/tickstep/aliyunpan/raw/main/assets/images/how-to-get-refresh-token.png)](https://github.com/tickstep/aliyunpan/blob/main/assets/images/how-to-get-refresh-token.png)

或者直接在控制台输入以下命令获取

```
JSON.parse(localStorage.getItem("token")).refresh_token
```



[![img](https://github.com/tickstep/aliyunpan/raw/main/assets/images/how-to-get-refresh-token-cmd.png)](https://github.com/tickstep/aliyunpan/blob/main/assets/images/how-to-get-refresh-token-cmd.png)

## 

## 登录

需要先登录，已经登录过的可以跳过此步。
RefreshToken获取教程请查看：[如何获取RefreshToken](https://github.com/tickstep/aliyunpan/blob/main/README.md#如何获取RefreshToken)

```shell
aliyunpan > login -RefreshToken=32994cd2c43...4d505fa79
```

## 同步备份文件

同步备份功能，支持备份本地文件到云盘，备份云盘文件到本地，双向同步备份三种模式。支持JavaScript插件对备份文件进行过滤。

***注意：如果同步目录下有非常多的文件，最好在首次备份前先运行一次scan任务，等scan任务完成并建立起同步数据库后，再正常启动同步任务。这样同步任务可以更加快速同步并且能有效避免同步重复文件。***

例如：将本地视频保存目录 `/mnt/sda1/project/camera_save_tools1.0/save` 中的文件备份上传到云盘目录 `/备份盘/camera`



```shell
#首次运行建议先扫描并构建同步数据库，如下：
sync start -ldir "/mnt/sda1/project/camera_save_tools1.0/save" -pdir "/camera" -mode "upload" -step scan

#然后再正常启动同步任务，如下：
sync start -ldir "/mnt/sda1/project/camera_save_tools1.0/save" -pdir "/camera" -mode "upload"

```

## 
