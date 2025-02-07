export default class CustomError extends Error {
  constructor(code, msg) {
    super(msg); // 设置 message 属性
    this.code = code; // 添加 code 属性
    this.msg = msg; // 添加 msg 属性，便于访问
  }
}


