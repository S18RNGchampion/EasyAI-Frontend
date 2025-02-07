import { ElNotification } from 'element-plus'

const notification = {
    success(title,message, duration = 1500, position = "top-right") {
        ElNotification({
            title: title,
            message: message,
            type: 'success',
            duration: duration,
            position: position,
        })
    },

    error(title,message, duration = 3000, position = "top-right") {
        ElNotification({
            title: title,
            message: message,
            type: 'error',
            duration: duration,
            position: position,
        })
    },

    warning(title,message, duration = 3000, position = "top-right") {
        ElNotification({
            title: title,
            message: message,
            type: 'warning',
            duration: duration,
            position: position,
        })
    },

    info(title,message, duration = 3000, position = "top-right") {
        ElNotification({
            title: title,
            message: message,
            type: 'info',
            duration: duration,
            position: position,
        })
    },

    networkError(title='网络错误!',message='连接服务器失败,请稍后再试', duration = 3000, position = "top-right") {
        ElNotification({
            title: title,
            message: message,
            type: 'error',
            duration: duration,
            position: position,
        })
    }
};

export default notification; 