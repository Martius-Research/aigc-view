export interface IApiResponse<T = any> {
    resultValue?: T;
    successful: boolean;
    resultHint: string;
}