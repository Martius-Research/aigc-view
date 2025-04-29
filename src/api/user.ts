import apiClient from "@/api/axios.ts";

export const getUserInfo = async (userId: string | number) => {
    try {
        return await apiClient.get(`/v1/user/users/${userId}`);
    } catch (error) {
        console.error("获取用户信息异常:", error);
        throw error;
    }
};