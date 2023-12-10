/**
 * @version 1.1
 * @author 魏泽鑫
 * @email weizexin1220@qq.com
 * @WeChat WZX-qt
 */
const CONF = require("./configure.json");
const {
	exec
} = require('child_process');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const disk = require('diskusage');

// 磁盘阈值
const threshold = CONF.threshold; // 设置阈值为50%，你可以根据需要调整
// 日志文件路径
const logFilePath = CONF.logFilePath;
// 视频时间长度
const videoTime = CONF.videoTime; // 单位为秒，此处设置为 10 分钟
// 文件保存根路径
const savePath = CONF.savePath;

// 检验保存文件路径
function checkPath(diskPath) {
	if (!fs.existsSync(diskPath)) {
		try {
			fs.mkdirSync(diskPath, {
				recursive: true
			});
			log(LOG.INFO, `checkPath: ${diskPath}磁盘目录已创建!`);
		} catch (err) {
			log(LOG.ERROR, `checkPath: ${error.message}`);
		}
	} else {
		log(LOG.INFO, `checkPath: ${diskPath}磁盘目录已存在!`);
	}
}

// 执行命令函数
function executeCommand(command) {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				log(LOG.ERROR, `executeCommand: ${command}\n${error.message}`);
				reject(error);
			} else {
				resolve(stdout || stderr);
			}
		});
	});
}

// 录制流函数
async function recordStream(streamType, streamUrl, recordingDuration, interval, storagePath) {
	try {
		// 延迟指定的时间后开始下一次录制
		setTimeout(() => {
			recordStream(streamType, streamUrl, recordingDuration, interval, storagePath);
		}, interval * 1000);
		const timestamp = moment().format('YYYY-MM-DD');
		const filePath = path.join(savePath, storagePath, timestamp);
		checkPath(filePath);
		const fileName = moment().format('YYYY-MM-DD_HH-mm-ss');
		const command =
			`ffmpeg -i ${streamUrl} ${streamType==='rtmp'?'-c:v copy -c:a aac':'-c copy'} -t ${recordingDuration} ${path.join(filePath, fileName)}.mp4`
		const output = await executeCommand(command);
		log(LOG.INFO, `recordStream: ${fileName}.mp4 录制完成!`);
		// 检查磁盘空间是否不足
		const isDiskSpaceFull = await checkDiskUsage(threshold);
		if (isDiskSpaceFull) {
			log(LOG.WARN, `recordStream: Disk Space is Full!`);
			// 删除最旧的视频文件
			deleteOldestFileAndFolder(path.join(savePath, storagePath));
		}
	} catch (error) {
		log(LOG.ERROR, `recordStream: ${error.message}`);
	}
}

// 删除最旧的文件及其文件夹
function deleteOldestFileAndFolder(rootDirectory) {
	fs.readdir(rootDirectory, (err, folders) => {
		if (err) {
			log(LOG.ERROR, `deleteOldestFileAndFolder: 读取目录错误 \n${err}`);
			return;
		}
		const dateFolders = folders.filter(folder => /^\d{4}-\d{2}-\d{2}$/.test(folder));
		if (dateFolders.length > 0) {
			dateFolders.sort((folderA, folderB) => new Date(folderA) - new Date(folderB));
			const oldestFolder = dateFolders[0];
			const oldestFolderPath = path.join(rootDirectory, oldestFolder);
			fs.readdir(oldestFolderPath, (err, files) => {
				if (err) {
					log(LOG.ERROR, `deleteOldestFileAndFolder: 读取文件夹 ${oldestFolder} 错误！\n${err}`);
					return;
				}
				if (files.length > 0) {
					files.sort((fileA, fileB) => fs.statSync(path.join(oldestFolderPath, fileA)).mtime -
						fs.statSync(path.join(oldestFolderPath, fileB)).mtime);
					const oldestFile = files[0];
					const oldestFilePath = path.join(oldestFolderPath, oldestFile);
					fs.unlink(oldestFilePath, (err) => {
						if (err) {
							log(LOG.ERROR,
								`deleteOldestFileAndFolder: 删除文件 ${oldestFile} 错误！\n${err}`);
							return;
						}
						log(LOG.INFO, `deleteOldestFileAndFolder: 已删除最旧的文件: ${oldestFile}！`);
						if (files.length === 1) {
							fs.rmdir(oldestFolderPath, (err) => {
								if (err) {
									log(LOG.ERROR,
										`deleteOldestFileAndFolder: 删除文件夹 ${oldestFolder} 错误！\n${err}`
										);
									return;
								}

								log(LOG.INFO,
									`deleteOldestFileAndFolder: 已删除最旧的文件夹: ${oldestFolder}！`
									);
							});
						}
					});
				}
			});
		}
	});
}

// 检查磁盘剩余空间
async function checkDiskUsage(thresholdPercentage) {
	try {
		const rootPath = process.cwd();
		const usage = await disk.check(rootPath);
		const totalSpace = usage.total;
		const usedSpace = totalSpace - usage.free;
		const usedPercentage = (usedSpace / totalSpace) * 100;
		log(LOG.INFO,
			`checkDiskUsage: 总空间：${totalSpace} bytes; 占用空间：${usedSpace} bytes; 利用率：{usedPercentage.toFixed(2)}%`
		);
		return usedPercentage >= thresholdPercentage;
	} catch (error) {
		log(LOG.ERROR, `checkDiskUsage: ${error.message}`);
		return false;
	}
}

// 随机字符串生成器
function generateRandomString(length = 10) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let randomString = '';

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		randomString += characters.charAt(randomIndex);
	}

	return randomString;
}
const LOG = {
	DEBUG: '[DEBUG]',
	INFO: '[INFO]',
	WARN: '[WARN]',
	ERROR: '[ERROR]',
	FATAL: '[FATAL]'
}
//日志函数
function log(level, message) {
	if (level === LOG.DEBUG) {
		console.log(moment().format('YYYY/MM/DD HH:mm:ss'), level, message);
	} else {
		fs.appendFileSync(CONF.logFilePath, `${moment().format('YYYY/MM/DD HH:mm:ss')} ${level} ${message}\r\n`)
	}
}


// 主函数
async function main() {
	try {
		// 创建保存文件路径
		checkPath(savePath);
		setTimeout(()=>{
			// 启动录制流
			CONF.devices.map(item => {
				recordStream(item.protocol, item.url, item.videoTime || CONF.videoTime, item.videoTime || CONF
					.videoTime, item.name ? item.name : generateRandomString());
			})
		},2000)
	} catch (error) {
		log(LOG.ERROR, `main: ${error.message}`);
	}
}

// 启动主函数
main();
