import axios from "axios";
import {jwtDecode} from "jwt-decode";

axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API,
});

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {




        config.baseURL = import.meta.env.VITE_APP_BASE_API;



        const loginfo = localStorage.getItem("Authorization");

        if (loginfo) {
            try {
                const token = jwtDecode(loginfo);

                if (token) {
                    config.headers["Authorization"] = ` ${loginfo}`;
                }
            } catch (error) {
                console.error("Invalid token format in localStorage", error);
            }
        }

        return config;
    },
    (error) => {

        // 请求错误时做些事情
        return Promise.reject(error);
    }
);

// 响应拦截器
apiClient.interceptors.response.use(
    (response) => {

        return response;
    },
    (error) => {

        return Promise.reject(error);
    }
);

export default apiClient;
