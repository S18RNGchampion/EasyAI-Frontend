import instance from "@/js/GlobalConfigAxios";
import notification from "@/utils/notification";
import CustomError from "@/js/error/CustomError";


async function getUsedCardList() {
    const response = await instance.get('/easyai/card/list');
    return response.data;
}

async function rechargeWithCard(card_key) {
    const response = await instance.post('/easyai/card/reward', { card_key });
    return response.data;
}

export { getUsedCardList, rechargeWithCard }