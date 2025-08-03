import { StatusCodes } from 'http-status-codes';

export interface ApiMakerResponse<T> {
  data: T;
  status?: StatusCodes;
}
