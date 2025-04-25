export interface IApiResponse<T = any> {
    resultValue?: T;
    successful: boolean;
    resultHint: string;
}

export interface IGenerator {
    prompt:string,
    aspectRatio:string
}

export interface IPromptRewrite {
  
    prompt: string;
}

