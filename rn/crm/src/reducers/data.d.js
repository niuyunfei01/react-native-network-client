export interface ICheckPhoneParams {
    mobile?: string,
    verifyCode?: string,
}
export interface IUser {
    ...ICheckPhoneParams,
    mobile?: string
    name?:string,
    address?: string,
    shopName?: string,
    classify?: string,
}
