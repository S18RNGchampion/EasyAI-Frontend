import { ElMessage } from 'element-plus';

const message = {
    success(message, duration = 1500) {
        ElMessage({
            plain: true,
            message,
            type: 'success',
            duration
        });
    },

    error(message, duration = 1500) {
        ElMessage({
            plain: true,
            message,
            type: 'error',
            duration
        });
    },

    warning(message, duration = 1500) {
        ElMessage({
            plain: true,
            message,
            type: 'warning',
            duration
        });
    },

    info(message, duration = 1500) {
        ElMessage({
            plain: true,
            message,
            type: 'info',
            duration
        });
    }
};

export default message; 