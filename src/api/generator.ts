import apiClient from "./axios";

interface IGenerator {
    prompt:string,
    style:string
   
    size:string,
    
}




export const generatorImg = async (params:IGenerator) => {
    try {
        return await apiClient.post("/v1/design/generate-image",JSON.stringify(params));
    } catch (error) {
        console.error("请求数据异常:", error);
        throw error;
    }
};
