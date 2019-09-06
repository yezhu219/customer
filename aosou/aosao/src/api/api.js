import {
  post,
  get
} from './http.js'
export default {
  
  //首页数据
  async getIndexData(params) {
    return await get('/merchant/index/getIndexData', params)
  },
  async updateWorkInfo(params) {
    return await get('/merchant/index/updWoekState', params)
  },
  async getQueryLog(params) {
    return await get('/merchant/log/getQueryLog', params)
  },
  async getRechargeLog(params) {
    return await get('/merchant/log/getRechargeLog', params)
  },
  async getRoomTypes(params) {
    return await get('/merchant/index/getRoomTypes', params)
  },
  async getHotelInfoByKeyword(params) {
    return await get('/merchant/index/getHotelInfoByKeyword', params)
  },
  async delQueryOrder(params) {
    return await get('/merchant/hotel/query/delQueryOrder', params)
  },
  async copyQueryOrder(params) {
    return await get('/merchant/hotel/query/copyQueryOrder', params)
  },
  async getPayCode(params) {
    return await get('/merchant/pay/getPayCode', params)
  },
  async updQueryOrder(params) {
    return await get('/merchant/hotel/query/updQueryOrder', params)
  },
  async dragSortr(params) {
    return await get('/merchant/hotel/query/dragSort', params)
  },
}