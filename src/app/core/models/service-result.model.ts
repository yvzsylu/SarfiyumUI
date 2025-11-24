export interface ServiceResult<T> {
    data: T;
    isSuccess: boolean;
    errors: string[] | null;
    statusCode: number;
}