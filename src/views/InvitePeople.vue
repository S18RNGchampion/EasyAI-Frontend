<template>
  <el-dialog v-model="chatStore.invitePeopleShow" title="邀请用户" width="600px" style="height: 90%;"
    :close-on-click-modal="false" class="invite-dialog" top="3vh">
    <div class="invite-content">
      <!-- 邀请链接区域 -->
      <div class="invite-link-section">
        <div class="section-header">
          <div class="header-icon">🎁</div>
          <h3 class="header-title">邀请链接</h3>
        </div>
        <div class="link-container">
          <el-input v-model="inviteLink" readonly class="link-input">
            <template #append>
              <el-button @click="copyLink" type="primary">
                <template #icon>
                  <el-icon>
                    <Document />
                  </el-icon>
                </template>
                复制
              </el-button>
            </template>
          </el-input>
          <div class="invite-tips">邀请好友注册，双方都可获得额外token奖励！</div>
        </div>
      </div>

      <!-- 邀请记录区域 -->
      <div class="invite-records-section">
        <div class="section-header">
          <div class="header-icon">📋</div>
          <h3 class="header-title">邀请记录</h3>
          <span class="invite-count">共邀请 {{ inviteList.length }} 人</span>
        </div>

        <div class="table-container">
          <el-table v-if="inviteList.length > 0" v-model="inviteList" :data="inviteList" style="width: 100%" height="250"
            class="invite-table">
            <el-table-column prop="invited_email" label="邮箱" min-width="180" width="180">
              <template #default="scope">
                <div class="user-cell">
                  <el-avatar :size="24" class="user-avatar">
                    {{ scope.row.invited_email.charAt(0) }}
                  </el-avatar>
                  <span class="email-text">{{ scope.row.invited_email }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="create_time" label="注册时间"min-width="190" width="190" />
            <el-table-column prop="reward" label="获得奖励"min-width="140" width="140" fixed="right">
              <template #default="scope">
                <span class="reward-text">+{{ scope.row.reward }} tokens</span>
              </template>
            </el-table-column>
          </el-table>

          <div v-else class="empty-state">
            <el-empty description="暂无邀请记录" />
          </div>
        </div> 
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useChatStore } from '@/js/store'
import { getInviteUserList } from '@/js/api/invite/invite'
import  message  from '@/utils/message'
import notification from '@/utils/notification'
const chatStore = useChatStore()

// 邀请链接
const inviteLink = ref(`localhost:3300?invite=${chatStore.userInfo.id}`)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 邀请列表数据
const inviteList = ref([])

// 复制邀请链接
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(inviteLink.value)
    message.success('邀请链接已复制到剪贴板')
  } catch (err) {
    message.error('复制失败，请手动复制')
  }
}

// 获取邀请列表数据
const fetchInviteList = async () => {
  try {  
    inviteList.value = await getInviteUserList();
  } catch (error) {
    if (error.code === 500) {
      message.error(error.msg, 3000);
    } else if (error.code === 501) {
      notification.networkError();
    }
  }
}

onMounted(() => {
  fetchInviteList()
})
</script>

<style scoped>
.invite-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }


}

.invite-content {
  padding: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.header-icon {
  font-size: 24px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.invite-count {
  font-size: 13px;
  color: #666;
  margin-left: auto;
}

.invite-link-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  flex-shrink: 0;
  /* 防止压缩 */
}

.link-container {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}

.link-input {
  margin-bottom: 12px;

  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #e4e7ed;
  }

  :deep(.el-input-group__append) {
    padding: 0;

    .el-button {
      border: none;
      height: 100%;
      border-radius: 0 4px 4px 0;
    }
  }
}

.invite-tips {
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.invite-records-section {
  background: #fff;
  border-radius: 12px;
  padding: 10px;
  flex: 1;
  /* 占据剩余空间 */
  display: flex;
  flex-direction: column;
  min-height: 0;
  /* 重要：允许flex子元素收缩 */
}

.table-container {
  flex: 1;
  overflow: hidden;
  /* 防止溢出 */
  min-height: 0;
  /* 重要：允许flex子元素收缩 */
  margin-bottom: 16px;
}

.invite-table {
  height: 100%;

  :deep(.el-table__inner-wrapper) {
    border-radius: 8px;
  }
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  background: var(--el-color-primary);
  color: #fff;
  font-size: 12px;
}

.reward-text {
  color: #67c23a;
  font-weight: 500;
}

.empty-state {
  height: 250px;
  /* 与表格高度一致 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.email-text {
  color: #333;
  font-size: 0.9rem;
}

.pagination-container {
  margin-top: auto;
  /* 推到底部 */
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
  /* 防止压缩 */
}

:deep(.el-pagination) {
  justify-content: flex-end;
  padding: 0;
}

:deep(.el-table .cell) {
  white-space: nowrap;
}
</style>
