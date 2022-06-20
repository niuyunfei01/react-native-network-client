import {appendFile, readFileInfo, readFile, deleteFile, logFilePath} from "./FileUtil";


import {getTime, getDatetime} from "./TimeUtil";
import HttpUtils from "./http";

const fileSize = 1024 * 100
let executeStatus = {};

//需要监控 门店id，用户id 模块名，组件名，方法名，执行时间，执行状态，执行状态的次数，记录时间，设备信息
//模块名可分为：提醒，订单，商品，运营，我的
//组价名：js文件名
//方法名：即当前被调用的方法名称
//执行时间可分为：
// 1、组件加载的时间（从组件准备渲染到组件渲染完成的时间）
// 2、方法执行的时间：方法入口到方法执行完成的时间，方法执行完成的时间包括请求api成功或者请求api失败的情况
//设备信息：品牌，版本等
//执行状态：执行成功或者执行错误

let isDeleteFile = false

const uploadInfo = async (jsonContent, accessToken) => {

    try {
        if (isDeleteFile) {
            return
        }
        await appendFile(jsonContent, logFilePath)
        const fileInfo = await readFileInfo(logFilePath)
        const file = fileInfo.filter(file => file.path === logFilePath)
        if (file[0].size > fileSize) {
            isDeleteFile = true
            const content = await readFile(logFilePath)
            const dataArray = content.split('\r\n')
            const uploadContentArray = []
            dataArray.map((data, index) => {

                if (index < dataArray.length - 1) {
                    uploadContentArray.push(JSON.parse(data))
                }
            })

            const data = JSON.stringify(uploadContentArray)
            const url = `v1/new_api/sla/recordRequestInfo?access_token=${accessToken}`
            HttpUtils.post(url, {data: data}).then(() => {
                deleteFile(logFilePath).then(() => {
                    isDeleteFile = false
                }).catch(() => {

                })
            }).catch(() => {
                isDeleteFile = false
            })

            //
        }
    } catch (e) {

    }
}
export const calcMs = (timeObj, access_token) => {

    if (!timeObj.is_record_request_monitor) {
        return
    }
    timeObj.method.map((methodObj, index) => {
        const attr = `${timeObj.moduleName}-${timeObj.componentName}-${methodObj.methodName}`
        if (methodObj.executeStatus === 'success') {
            if (undefined !== executeStatus[attr]?.successNum) {
                executeStatus[attr].successNum++
                methodObj.executeNumber = executeStatus[attr].successNum
            } else {
                executeStatus[attr] = {successNum: 1}
                methodObj.executeNumber = 1
            }
        } else {
            if (undefined !== executeStatus[attr]?.errorNum) {
                executeStatus[attr].errorNum++
                methodObj.executeNumber = executeStatus[attr].errorNum
            } else {
                executeStatus[attr] = {errorNum: 1}
                methodObj.executeNumber = 1
            }
        }
        if (index === timeObj.method.length - 1) {
            const recordTime = getDatetime(getTime())
            const info = {
                currentStoreId: timeObj.currentStoreId,
                currentUserId: timeObj.currentUserId,
                moduleName: timeObj.moduleName,
                componentName: timeObj.componentName,
                method: timeObj.method,
                recordTime: recordTime,
                deviceInfo: timeObj.deviceInfo
            }

            const jsonInfo = JSON.stringify(info)
            uploadInfo(jsonInfo, access_token).then(() => {

            })
        }
    })
}