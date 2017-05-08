/**
 * create by cm -2017/4/15
 */
const crypto = require("crypto");
const secret = "meng";

/**
 * 加密模块
 * 利用sha256算法,配合私钥生成 64 位 16进制 加密字符
 *
 */
var encrypt = function(source){
	return crypto.createHmac('sha256', secret)
                   .update(source)
                   .digest('hex');
}

module.exports = encrypt;