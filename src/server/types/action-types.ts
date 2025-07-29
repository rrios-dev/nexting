import { AsyncState } from 'async-xtate';
import ServerError from '../errors/server-error';

/**
 * Tipo genérico que representa cualquier acción generada por makeServerAction
 */
export type GenericAction = 
  | ((...args: any[]) => Promise<AsyncState<any, ReturnType<ServerError['toJSON']>>>)
  | (() => Promise<AsyncState<any, ReturnType<ServerError['toJSON']>>>);

/**
 * Extrae los parámetros de entrada de una acción
 */
export type InferActionInput<T extends GenericAction> = 
  T extends (...args: infer P) => any 
    ? P extends [infer First] 
      ? First 
      : P extends [] 
        ? void 
        : P
    : never;

/**
 * Extrae el tipo de datos de respuesta exitosa de una acción
 */
export type InferActionOutput<T extends GenericAction> = 
  T extends (...args: any[]) => Promise<AsyncState<infer R, any>>
    ? R
    : never;

/**
 * Extrae el tipo de error de una acción
 */
export type InferActionError<T extends GenericAction> = 
  T extends (...args: any[]) => Promise<AsyncState<any, infer E>>
    ? E
    : never;

/**
 * Tipo de error estándar para todas las acciones
 */
export type ActionError = ReturnType<ServerError['toJSON']>;

/**
 * Helper type para verificar si una acción requiere parámetros
 */
export type ActionRequiresInput<T extends GenericAction> = 
  InferActionInput<T> extends void ? false : true; 