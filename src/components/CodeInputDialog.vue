<template>
    <el-dialog v-model="dialogVisible" title="输入口令" width="400px" :close-on-click-modal="false" :show-close="true"
        class="code-input-dialog">
        <div class="dialog-content">
            <div class="dialog-header">
                <div class="gift-icon">🎁</div>
                <h2 class="dialog-title">输入口令</h2>
                <p class="dialog-subtitle">请输入您的专属口令以获取奖励</p>
            </div>

            <el-form :model="form" ref="formRef" :rules="rules" class="code-form">
                <el-form-item prop="code">
                    <el-input v-model="form.code" placeholder="请输入口令"  clearable class="code-input"
                        @keyup.enter="handleSubmit" />
                </el-form-item>
            </el-form>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleCancel" class="cancel-btn">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="loading" class="submit-btn">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { inputMouthKey } from '@/js/api/mouthCode/mouthCode'
import message from '@/utils/message'
import notification from '@/utils/notification'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:visible', 'complete'])

const dialogVisible = ref(props.visible)
const loading = ref(false)
const formRef = ref(null)
const result = ref(null);
const form = reactive({
    code: ''
})

const rules = {
    code: [
        { required: true, message: '请输入口令', trigger: 'blur' },
        { min: 3, message: '口令长度不能小于3个字符', trigger: 'blur' }
    ]
}

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
    dialogVisible.value = newVal
})

// 监听对话框关闭
watch(dialogVisible, (newVal) => {
    if (!newVal) {
        emit('update:visible', false)
    }
})

const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate()
    try {
        loading.value = true;
        result.value = await inputMouthKey(form.code);
        console.log(result.value)
        handleCancel();
        notification.success("口令正确!","成功获得  "+result.value.reward+"  token!",3000);
        emit('complete', result.value.reward);
    } catch (error) {
        if (error.code === 500) {
            message.error(error.msg);
        } else if (error.code === 501) {
            notification.networkError();
        }
    } finally {
        loading.value = false
    }

}

const handleCancel = () => {
    dialogVisible.value = false
    formRef.value?.resetFields()
}
</script>

<style scoped>
.code-input-dialog {
    :deep(.el-dialog) {
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    :deep(.el-dialog__header) {
        display: none;
    }

    :deep(.el-dialog__body) {
        padding: 0;
    }

    :deep(.el-dialog__footer) {
        padding: 16px 24px;
        border-top: 1px solid #f0f0f0;
    }
}

.dialog-content {
    padding: 24px 24px 16px;
}

.dialog-header {
    text-align: center;
    margin-bottom: 24px;
}

.gift-icon {
    font-size: 48px;
    margin-bottom: 16px;
    animation: bounce 1s ease infinite;
}

.dialog-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px;
}

.dialog-subtitle {
    font-size: 0.875rem;
    color: #666;
    margin: 0;
}

.code-form {
    :deep(.el-form-item) {
        margin-bottom: 0;
    }
}

.code-input {
    :deep(.el-input__wrapper) {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        border-radius: 8px;
        padding: 8px 12px;
        background: #f8f9fa;
        transition: all 0.3s ease;
    }

    :deep(.el-input__wrapper:hover) {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }

    :deep(.el-input__wrapper.is-focus) {
        box-shadow: 0 2px 12px rgba(var(--el-color-primary-rgb), 0.2) !important;
    }

    :deep(.el-input__inner) {
        height: 40px;
        font-size: 1rem;
    }

    :deep(.el-input__prefix-inner) {
        font-size: 1.2rem;
        color: #666;
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.cancel-btn {
    border: none;
    background: #f5f5f5;

    &:hover {
        background: #e8e8e8;
    }
}

.submit-btn {
    padding: 8px 24px;
    font-weight: 500;
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-5px);
    }
}
</style>
