<template>
  <v-dialog
    width="90%"
    :persistent="true"
    v-model="isShow"
    content-class="dialog-container"
  >
    <v-sheet class="pa-5" style="position: relative;">
      <v-card-title class="text-center mx-3">
        我的订单
      </v-card-title>
      <v-btn
        icon="mdi-close"
        variant="text"
        @click="chatStore.myOrderShow=false"
        style="position: fixed; top:0;right:0 "
      ></v-btn>

      <v-container
        style="background-color: #F0F3F8; height: 35.5rem; border-radius: 0.3rem; max-width: 100%; overflow-x: auto;"
      >
        <v-data-table
          v-model:page="page"
          :items="orders"
          class="elevation-1"
          :items-per-page="orderPerPage"
          item-key="id"
          :headers="computedHeaders"
          :show-expand="chatStore.xs"

        >
          <template v-slot:expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length">
                <div>订单号: {{ item.id }}</div>
                <div>订单名称: {{ item.orderName }}</div>
                <div>流量: {{ item.flowRate }}</div>
                <div>金额: {{ item.amount }}元</div>
                <div>状态: {{ item.status === 1 ? "已完成" : "未完成" }}</div>
                <div>时间: {{ item.created }}</div>
              </td>
            </tr>
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip :color="getColor(item.status)">
              {{ item.status === 1 ? "已完成" : "未完成" }}
            </v-chip>
          </template>

          <template v-slot:bottom>
            <div class="text-center pt-2">
              <v-pagination v-model="page" :length="pageCount" color="primary"></v-pagination>
            </div>
          </template>
        </v-data-table>
      </v-container>
    </v-sheet>
  </v-dialog>
</template>

<script setup>
import {computed, ref, onMounted, onBeforeUnmount} from 'vue';
import {useChatStore} from "@/js/store";





const isShow = ref(true);
const chatStore = useChatStore();
const page = ref(1);
const pageCount = computed(() => {
  return Math.ceil(orders.value.length / orderPerPage.value);
});
const orderPerPage = ref(8);
const orders = ref([
  {
    id: '20230927190922296',
    orderName: 'Lv2 畅享套餐',
    flowRate: '320G',
    amount: 118.00,
    status: 0,
    created: '2023/09/27 19:13'
  },
  {
    id: '20230604110648155',
    orderName: 'Lv2 畅享套餐',
    flowRate: '320G',
    amount: 36.00,
    status: 1,
    created: '2023/06/04 11:27'
  },
  {
    id: '20230224190238954',
    orderName: 'Lv2 畅享套餐',
    flowRate: '320G',
    amount: 30.00,
    status: 1,
    created: '2023/02/24 19:01'
  },
  {
    id: '20221226131233502',
    orderName: 'Lv2 畅享套餐',
    flowRate: '320G',
    amount: 30.00,
    status: 0,
    created: '2022/12/26 13:49'
  },
  {
    id: '20220922160916923',
    orderName: 'Lv2 畅享套餐',
    flowRate: '320G',
    amount: 30.00,
    status: 1,
    created: '2022/09/22 16:46'
  },
  {
    id: '20220824160817708',
    orderName: 'Lv2 畅享套餐',
    flowRate: '320G',
    amount: 10.00,
    status: 0,
    created: '2022/08/24 16:46'
  },
  {
    id: '20220728230759203',
    orderName: 'Lv2 畅享套餐',
    flowRate: '320G',
    amount: 10.00,
    status: 0,
    created: '2022/07/28 23:47'
  },
  {
    id: '20230927190922297',
    orderName: 'Lv2 畅享套餐',
    flowRate: '320G',
    amount: 118.00,
    status: 0,
    created: '2023/09/27 19:13'
  },
  {
    id: '20230604110648156',
    orderName: 'Lv2 畅享套餐',
    flowRate: '320G',
    amount: 36.00,
    status: 1,
    created: '2023/06/04 11:27'
  },
  {
    id: '20230224190238951',
    orderName: 'Lv2 畅享套餐',
    flowRate: '320G',
    amount: 30.00,
    status: 1,
    created: '2023/02/24 19:01'
  },
  // more orders...
]);

const allHeaders = [
  {title: '订单号', key: 'id', sortable: false},
  {title: '订单名称', key: 'orderName', sortable: false},
  {title: '购买流量', key: 'flowRate', sortable: false},
  {title: '订单金额', key: 'amount', sortable: false},
  {title: '订单状态', key: 'status', sortable: false},
  {title: '创建时间', key: 'created', sortable: false},
];

const mobileHeaders = [
  {title: '订单名称', key: 'orderName', sortable: false},
  {title: '订单金额', key: 'amount', sortable: false},
  // { title: '订单状态', key: 'status', sortable: false },
];


const computedHeaders = computed(() => {
  return chatStore.xs ? mobileHeaders : allHeaders;
});

const getColor = (value) => {
  return value === 1 ? 'green' : 'red';
};



</script>

<style scoped>


</style>
