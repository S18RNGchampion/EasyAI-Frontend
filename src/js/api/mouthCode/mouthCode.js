import instance from "@/js/GlobalConfigAxios";


async function inputMouthKey(mouth_key) {
    const response = await instance.post('/easyai/mouth/reward',{
        mouth_key:mouth_key
    });
    return response.data;
}

export { inputMouthKey }