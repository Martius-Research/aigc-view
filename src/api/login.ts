import apiClient from "./axios";

interface IUserBase {
    username: string;
    password: string;
}

interface ILogin extends IUserBase {}

interface IRegister extends IUserBase {
    email: string;
}


/**
 * 登录接口
 * @returns
 */
export const login = async (params:ILogin) => {
    try {
        return await apiClient.post("/v1/auth/userLogin",JSON.stringify(params));
    } catch (error) {
        console.error("请求数据异常:", error);
        throw error;
    }
};

/**
 * 注册用户
 * @param params
 */
export const register = async (params:IRegister) => {
    try {
        return await apiClient.post("/v1/auth/registerUser",JSON.stringify(params));
    } catch (error) {
        console.error("请求数据异常:", error);
        throw error;
    }
};
