export type Param = {
    name: string,
    type: string,
    index: number;
}

export type MethodMeta = {
    subUrl: string,
    httpMethod: string,
    midwares: Function[],
    params: Param[]
}

export type RouteMeta = {
    [methodName: string]: MethodMeta;
}
export type ClassMeta = {
    baseUrl: string,
    routes: RouteMeta,
    midwares: Function[];
}

export let getClassMeta = (target): ClassMeta => {
    return (target.$Meta = target.$Meta || { baseUrl: '', routes: {} })
}
export let getMethodMeta = (target, methodName): MethodMeta => {
    let meta = getClassMeta(target);

    let methodMeta = meta.routes[methodName] || (meta.routes[methodName] = {
        subUrl: '',
        httpMethod: '',
        midwares: [],
        params: []
    });

    return methodMeta;
}

/**
 * 
 * @Path('/user')
 * class UserService {
 * }
 * 
 */
export function Path(baseUrl: string, midwares?: Function[]) {
    return function (target) {
        let meta = getClassMeta(target.prototype);
        meta.baseUrl = baseUrl;
        meta.midwares = midwares;
    }
}

let MethodFactory = (httpMehod: string) => {
    return (url: string, midwares?: any[]) => {
        return (target, methodName: string, descriptor: PropertyDescriptor) => {

            let meta = getMethodMeta(target, methodName);
            meta.subUrl = url;
            meta.httpMethod = httpMehod;
            meta.midwares = midwares;

            // Sort parameter by param index
            meta.params.sort((param1: Param, param2: Param) => param1.index - param2.index);
        }
    }
}
/**
 * 
 * @GET('/user/:name')
 * list(@PathParam('name') name:string)
 * 
 */
export let GET = MethodFactory('get');
export let POST = MethodFactory('post');
export let DELETE = MethodFactory('delete');
export let PUT = MethodFactory('put');


let ParamFactory = (paramType: string, paramName?: string) => {
    return (target, methodName: string, paramIndex: number) => {
        let meta = getMethodMeta(target, methodName);
        meta.params.push({
            name: paramName ? paramName : paramType,
            index: paramIndex,
            type: paramType
        });
    }
}
let MethodParamFactory = (paramType: string) => {
    return (paramName: string) => {
        return ParamFactory(paramType, paramName)
    }
}

/**
 * 
 * list(@PathParam('name') name:string)
 * 
 */
export let PathParam = MethodParamFactory('path');
export let QueryParam = MethodParamFactory('query');
export let FormParam = MethodParamFactory('form');
export let CookieParam = MethodParamFactory('cookie');
export let HeaderParam = MethodParamFactory('header');

let ContextParamFactory = (paramType: string) => {
    return ParamFactory(paramType)
}

/**
 * 
 * @GET('/get')
 * list(@Request request)
 * 
 */
export let Request = ContextParamFactory('request')
export let Response = ContextParamFactory('response')