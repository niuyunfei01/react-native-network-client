export interface ICheckLoginParams {
  mobile?: string,
  password?: string,
  device_uuid?: string,
}

export interface ICheckSendMobileCodeParams {
  mobile?: string,
  device_uuid?: string,
  is_agree?: number,
  type?: number,
}
