import instance from "@/js/GlobalConfigAxios";


async function getInviteUserList() {
    const response = await instance.get('/easyai/invite/list');
    return response.data;
}

export { getInviteUserList }