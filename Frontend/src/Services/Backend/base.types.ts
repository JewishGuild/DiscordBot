export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BaseDatabaseEntity {
  _id: string;
  createDate: string;
  updateDate: string;
}
