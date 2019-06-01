export default class TimeUtil {
  static getWeek (date = new Date()) {
    const weekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const day = date.getDay()
    return weekMap[day]
  }
}