import apiClient from "./axios";

interface IUserBase {
    username: string;
    password: string;
}

interface ILogin extends IUserBase {
}

interface IRegister extends IUserBase {
    email: string;
}

interface IUserInfo {
    userId: string;
    email?: string;
}


/**
 * 登录接口
 * @returns
 */
export const login = async (params: ILogin) => {
    try {
        return await apiClient.post("/v1/auth/userLogin", JSON.stringify(params));
    } catch (error) {
        console.error("请求数据异常:", error);
        throw error;
    }
};

/**
 * 注册用户
 * @param params
 */
export const register = async (params: IRegister) => {
    try {
        return await apiClient.post("/v1/auth/registerUser", JSON.stringify(params));
    } catch (error) {
        console.error("请求数据异常:", error);
        throw error;
    }
};
/**
 * 注销账户
 * @param params
 */
export const deleteAccount = async (params: IUserInfo) => {
    try {
        return await apiClient.delete(`/v1/auth/users/${params.userId}`);
    } catch (error) {
        console.error("请求数据异常:", error);
        throw error;
    }
};
/**
 * 修改邮箱
 * @param params
 */
export const modifyEmail = async (params: IUserInfo) => {
    try {
        return await apiClient.put(`/v1/auth/users/${params.userId}/email`, { email: params.email });
    } catch (error) {
        console.error("请求数据异常:", error);
        throw error;
    }
};
