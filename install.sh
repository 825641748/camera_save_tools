#!/bin/bash

echo "增加开机自启服务"
cat << EOF > /etc/systemd/system/camera_save_tools.service
[Unit]
Description=Camera Save Tools

[Service]
ExecStart=/usr/bin/node $PWD/index.js > $PWD/log.log
WorkingDirectory=$PWD
Restart=always
User=root

[Install]
WantedBy=default.target
EOF

echo "重新加载systemd守护进程"
systemctl daemon-reload

echo "启用camera_save_tools服务"
systemctl enable camera_save_tools

echo "启动camera_save_tools服务"
systemctl start camera_save_tools

echo -e "camera_save_tools服务已启动\n - 启动服务systemctl start camera_save_tools\n - 停止服务：systemctl stop camera_save_tools\n - 重启服务：systemctl restart camera_save_tools"
