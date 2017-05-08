/**
 * create by cm -2017/4/15
 */
const crypto = require("crypto");
const secret = "meng";
var g_vars	 = require("../helper/variable");

module.exports = {

	/**
	 * 将从数据库中获取的审核结果代码转换为对应的中文
	 *
	 * @param {[type]} status []
	 *
	 */
	reviewResult : (status)=>{
		return status == 0 ? "未审核"
											 : status == 1 ? "审核通过"
											 						   : status == 2 ? "审核不通过" :"未提交";
	},

	/**
	 * 加密模块
	 * 利用sha256算法,配合私钥生成 64 位 16进制 加密字符
	 */
	encrypt : (source)=>{
		return crypto.createHmac('sha256', secret)
                 .update(source)
                 .digest('hex');
	},


	/* 未登录,跳转到登录页 */
	toLogin : (req,res)=>{
		// console.log("in toLogin : "+ req.session.user.identity);
		if(req.session.user == undefined)
			res.redirect("/login");
	},
	/* 已登录,不允许跳转到 login 页面 */
	hasLogin : (req,res)=>{
		// console.dir(req.session);
		if(req.session.user != undefined)
			res.redirect("/index");
	},

	/**
	 * 判断当前用户是否有权限进入该页面
	 *
	 * @param {[type]} req      [传入参数,主要为session内容]
	 * @param {[type]} res      [主要用于页面重定向]
	 * @param {[type]} belongTo [要进入页面属于学生(0)/导师(1)]
	 *
	 * @return {[type]} [description]
	 */
	hasPower : (req,res,belongTo)=>{
		/* 首先判断当前用户是否已登录 : 若未登录进入登录页面*/
		if(req.session.user == undefined)
			res.redirect("/login");

		/* 当前用户与当前页面适用用户类型不同，重定向到error页面 */
		if(req.session.user.identity != belongTo){
			// var data = {
			// 	message : "您没有权限进入该页面",
			// 	error   : {
			// 		status : "",
			// 		stack  : ""
			// 	}
			// }
			var err = new Error('Not Found');
		  err.status = 404;
		  // next(err);
			res.redirect("/error",err);
		}
	},

	/**
 * 将获取的课题类型及性质转换为可读文字
 *
 * @param {[type]} result [查询结果]
 */
	formatProjectType : (result)=>{
		for(var i in result){
			result[i].pro_type = result[i].pro_type +"、" +g_vars.PRO_TYPE[result[i].pro_type];
			result[i].pro_nature = result[i].pro_nature +"、" +g_vars.PRO_NATURE[result[i].pro_nature];
		}
	},


	/**
	 * 通过文件路径 获取文件名 
	 *
	 * @param {[type]} file_path [文件路径]
	 *
	 */
	getFileName : (file_path)=>{
		// var paths = file_path.split("/");
		// 时间戳为13位,+ 2位下划线 ==> 15位
		return file_path == null ? null : file_path.substr(15);
	},

	redirectTo : (user_info)=>{
		// 如果是学生，跳转到当前毕设进度页面
		if(user_info.identity == g_vars.ID_STUDENT){
			switch(user_info.pro_process){
				case g_vars.PROCESS_SELECT:
					return "/choose";
				case g_vars.PROCESS_TASK:
					return "/task";
				case g_vars.PROCESS_OPEN:
					return "/open";
				case g_vars.PROCESS_TRANSLATE:
					return "/translate";
				case g_vars.PROCESS_MIDDLE:
					return "/middle";
				case g_vars.PROCESS_DRAFT:
					return "/draft";
				case g_vars.PROCESS_PAPER:
					return "/paper";
				case g_vars.PROCESS_REPLY:
					return "/reply";
			}
		}
		// 否则返回导师页面路由
		return "/tutor";
	}

}