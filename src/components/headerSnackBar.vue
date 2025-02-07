

<template>
  <v-snackbar
    v-model="snackBarShow"
    location="top"
    :color="status?'success':'error'"
    :timeout="1500"
    :width="width"
    :min-width="width"
  >
    {{title}}
  </v-snackbar>
</template>

<script setup>
import {ref} from "vue";
const snackBarShow=defineModel();
const props=defineProps({
  status:{
    type:Boolean,
    required:true,
  },
  title:{
    type:String,
    default:"文件上传成功"
  },
  width:{
    type:String,
    default:"7.5rem"
  }
})

// const snackBarInfo = ref({
//   show:false,
//   color:'success',
//   text:'',
//   width:"7.5rem",
//   minWidth:"7.5rem",
// });
// function uploadFileSuccess(textInfo){
//   snackBarInfo.value.show = true;
//   snackBarInfo.value.text =  textInfo;
//   snackBarInfo.value.color ='success';
//   snackBarInfo.value.width = "7.4rem";
//   snackBarInfo.value.minWidth = "7.4rem";
// }
// function uploadFileError(textInfo){
//   snackBarInfo.value.show = true;
//   snackBarInfo.value.text =textInfo;
//   snackBarInfo.value.color = 'error';
//   snackBarInfo.value.width = "10.8rem";
//   snackBarInfo.value.minWidth = "10.8rem";
// }
</script>
<style scoped>

</style>
