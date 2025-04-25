import apiClient from "./axios";

 import type { IGenerator, IPromptRewrite } from "@/interface/IApiResponse";

 /**
  * 生成图像
  * @param params 
  * @returns 
  */
export const generatorImg = async (params:IGenerator) => {
    try {
        return await apiClient.post("/v1/design/generate-image",JSON.stringify(params));
    } catch (error) {
        console.error("请求数据异常:", error);
        throw error;
    }
};


/**
 * prompt重写
 * @param params 
 * @returns 
 */
export const promptRewrite = async (params: IPromptRewrite) => {
    try {
        return await apiClient.post("/v1/design/prompt-rewrite", JSON.stringify(params));
    } catch (error) {
        console.error("请求数据异常:", error);
        throw error;
    }
};