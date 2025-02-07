<template>
  <div class="uploadFile">
    <input type="file" ref="fileInput" style="display: none" @change="handleFileChange">
    <v-btn @click.stop="handleFileUpload" color="success" style="width: 100%">{{ buttonText }}</v-btn>
  </div>
</template>
<script setup>
import {ref} from "vue";
import {defineEmits} from 'vue';

const props = defineProps(
  {
    // img   all
    fileType: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      default: "上传文件"
    }
  },
);

const emit = defineEmits(['completeUpload', 'uploadFileError']);
const fileUrl = ref('');
const fileInput = ref('');


function isSupportedFileType(file) {
  if (props.fileType === 'all') {
    return supportedAllTypes.includes(file.type);
  } else {
    return supportedImageTypes.includes(file.type);
  }
}

const supportedAllTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const supportedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/gif'
];

function handleFileChange(event) {
  // 当文件选择变化时触发
  const file = event.target.files[0];

  if (!isSupportedFileType(file)) {
    emit('uploadFileError', '文件类型不支持');
  } else {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        fileUrl.value = reader.result;
        emit('completeUpload', fileUrl.value);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      emit('uploadFileError', '上传失败！');
    } finally {
      // 重置文件输入值
      fileInput.value.value = '';
    }
  }

}

function handleFileUpload() {
  console.log("fuck")
  // 点击按钮时触发文件选择
  fileInput.value.click();
}


</script>
<style scoped>

</style>
