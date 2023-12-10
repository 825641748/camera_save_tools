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
