/**
 * Created by cm on 2017/4/15
 */
var query = require("../helper/createMysqlPool");

var publicDAO = require("./publicDAO");

// 全局变量
var g_vars = require("../helper/variable");

module.exports = {
	/**
	 * 导师发布毕设课题
	 *
	 * @param  info  [导师信息,课题信息]
	 *
	 * @return {[type]}   [返回写入状态]
	 */
	publishPro : function(info,callback){
		var sql = `insert into project_info(pro_id,pro_name,pro_type,pro_nature,major,publisher,publish_time,status)
							values(null,?,?,?,?,?,null,0)`;
		var params = [info.pro_name,info.pro_type,info.nature,info.major,info.tutor_id];
		query(sql,params,function(error,result){
			if(error){
				console.log("publishPro : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},


	/**
	 * 根据 课题id 获取课题信息
	 *
	 * @param {[type]}   pro_id   [description]
	 *
	 */
	getProject : (pro_id,callback)=>{
		var sql = `select roject_info.*,major_name  
							from project_info,major_info
							where pro_id =? and project_info.major_id = major_info.major_id`;
		query(sql,[pro_id],(error,result)=>{
			if(error){
				console.log("get project error : "+ error.message);
				return;
			}
			callback(result);
		});
	},


	/**
	 * 修改课题内容
	 *
	 * @param {[type]}   info     [修改信息]
	 *                  pro_name,pro_type,pro_nature,major_id
	 */
	updateProject : (info,callback)=>{
		var sql = `update project_info set pro_name=?,pro_type=?,pro_nature=?,major_id=?
							where pro_id = ?`;
		var params = [info.pro_name,info.pro_type,info.pro_nature,info.major_id];
		query(sql,params,(error,result)=>{
			if(error){
				console.log("update project error ："+ error.message);
				return;
			}
			callback(result);
		});
	},




	/**
	 * 获取  任务书,开题报告, 外文翻译, 中期答辩, 论文(草稿) 上传状态列表
	 * 
	 * 返回课题名，pro_id，类型，性质; 学生名，学号；任务书处理状态
	 * 返回结果按 pro_id 升序排列
	 */
	// getList : function(tutor_id,pro_process,callback){
	// 	var sql, nowYear = (new Date()).getFullYear();
	// 	/* 联合查询,返回该导师 所有 已被选课题 的学生信息,课题信息及上传内容id,没有上传则对应信息为 NULL*/
	// 	switch(pro_process){
	// 		// 获取任务书列表
	// 		case g_vars.PROCESS_TASK:
	// 			sql = `select stu_num,stu_name,pro_id,pro_name,pro_type,pro_nature,task_id,task_info.status
	// 							from  student_info
	// 				           left join  project_info on project_info.pro_id=student_info.project_id
	// 				           left join task_info on project_info.pro_id=task_info.project_id 
	// 							where publisher=? and project_info.publish_time>? 
	// 							order by project_info.pro_id`;
	// 			break;
	// 		// 获取开题报告列表
	// 		case g_vars.PROCESS_OPEN:
	// 			sql = `select stu_num,stu_name,pro_id,pro_name,pro_type,pro_nature,task_id,open_topic_info.status
	// 							from  student_info
	// 				           left join  project_info on project_info.pro_id=student_info.project_id
	// 				           left join open_topic_info on project_info.pro_id=open_topic_info.project_id 
	// 							where publisher=? and project_info.publish_time>? 
	// 							order by project_info.pro_id`;
	// 			break;
	// 		// 获取外文翻译列表
	// 		case g_vars.PROCESS_TRANSLATE:
	// 			sql = `select stu_num,stu_name,pro_id,pro_name,pro_type,pro_nature,task_id,translate_info.status
	// 							from  student_info
	// 				           left join  project_info on project_info.pro_id=student_info.project_id
	// 				           left join translate_info on project_info.pro_id=translate_info.project_id 
	// 							where publisher=? and project_info.publish_time>? 
	// 							order by project_info.pro_id`;
	// 			break;
	// 		// 获取中期答辩列表
	// 		case g_vars.PROCESS_MIDDLE:
	// 				sql = `select stu_num,stu_name,pro_id,pro_name,pro_type,pro_nature,task_id,middle_info.status
	// 							from  student_info
	// 				           left join  project_info on project_info.pro_id=student_info.project_id
	// 				           left join middle_info on project_info.pro_id=middle_info.project_id 
	// 							where publisher=? and project_info.publish_time>? 
	// 							order by project_info.pro_id`;
	// 			break;
	// 		// 获取论文草稿列表
	// 		case g_vars.PROCESS_DRAFT:
	// 			sql = `select stu_num,stu_name,pro_id,pro_name,pro_type,pro_nature,task_id,paper_info.status
	// 							from  student_info
	// 				           left join  project_info on project_info.pro_id=student_info.project_id
	// 				           left join draft_info on project_info.pro_id=paper_info.project_id 
	// 							where publisher=? and project_info.publish_time>? 
	// 							order by project_info.pro_id`;
	// 			break;
	// 		// 获取论文列表
	// 		case g_vars.PROCESS_PAPER:
	// 			sql = `select stu_num,stu_name,pro_id,pro_name,pro_type,pro_nature,task_id,paper_info.status
	// 							from  student_info
	// 				           left join  project_info on project_info.pro_id=student_info.project_id
	// 				           left join paper_info on project_info.pro_id=paper_info.project_id 
	// 							where publisher=? and project_info.publish_time>?  
	// 							order by project_info.pro_id`;
	// 			break;
	// 		// 参数不正确,结束
	// 		default:
	// 			console.log("get detail -> process error");
	// 			return;
	// 	}
	// 	/* 联合查询,返回该导师 所有 已被选课题 的学生信息，课题信息及任务书上传id,没有上传任务书则 task_id = NULL*/

	// 	query(sql,[tutor_id,nowYear],function(error,result){
	// 		if(error){
	// 			console.log("getTaskList : "+error.message);
	// 			return g_vars.ERROR;
	// 		}
	// 		callback(result);
	// 	});
	// },


	/**
	 * 获取  课题进度及文件 上传状态列表
	 * 
	 * 返回课题名，pro_id，类型，性质; 学生名，学号；任务书处理状态
	 * 返回结果按 pro_id 升序排列
	 */
	getList : (tutor_id,callback)=>{
		var sql ,params,nowYear;
		nowYear = (new Date()).getFullYear();
		sql = `select stu_name,stu_num,pro_process,student_info.status,pro_id,pro_name,pro_type,pro_nature
					from project_info
					left join student_info on pro_id = project_id
					where publisher=? and publish_time>?`;
		params = [tutor_id,nowYear];

		query(sql,params,(error,result)=>{
			if(error){
				console.log("getList : "+error.message);
				return;
			}
			callback(result);
		});
	},

	/**
	 * 处理学生的课题申请 ： 
	 * 	同意 -> 将 课题id 写入 student_info.project_id 字段,project_info.status字段置位 1 ：已被选
	 *  拒绝 -> 发私信给该学生
	 *  
	 * @param info  [学生id,申请id,课题id, 课题名称, 导师id,  拒绝理由, 处理结果 :1->同意,2:不同意]
	 *              [stu_id,cho_id,pro_id, pro_name, tutor_id,content,  result]
	 *
	 * @return {[type]}   [返回处理结果]
	 */
	dealSelectProject : function(info,callback){
		// 提交表中的记录设为已读，如果失败，结束操作
		var sql,params;
	 	
	 	// 同意
	 	if(info.result === g_vars.STATUS_PASS){
		 	// 返回值 ：0 ：已被选择，不能重复选择 	1 ：一切成功
			var back;
			sql = "call dealSelectProject(?,?,?,?,?)";
			params = [info.stu_id,info.pro_id,info.cho_id,g_vars.STATUS_PASS,back];

			query(sql,params,function(error){
				if(error){
					console.log("dealSelectProject : "+error.message);
					return g_vars.ERROR;
				}
				console.log("返回值 ： " + back);
				callback(back);
			});
		}
		
		// 拒绝:给学生发私信，告知已被拒绝
		else{
			info.title = "你申请的课题："+info.pro_name+"  被导师拒绝, 辣鸡";

			sql = "insert into contact_info(con_id,sender_id,receiver_id,title,content,type) values(null,?,?,null,4)";
			params = [info.tutor_id,info.stu_id,info.title];
			query(sql,params,function(error,result){
			if(error){
				console.log("refuseApply : "+ error.message);
				return g_vars.ERROR;
			}
			callback(result);
		})
		}
	},





	/**
	 * 处理任务书信息 ： 
	 * 	审核通过 -> 将任务书标志为通过：status->1；pro_process进入下一阶段
	 *  审核不通过 -> status->2
	 * 
	 * @param  info  [课题id, 导师id, 		评价, 		处理结果 ： 1->同意,2:不同意]
	 *               [pro_id,tutor_id,comments,result]
	 *
	 */
	dealTask : function(info,callback){
		
		// 参数 ：process (新阶段)  pid (课题id)  t_comments(导师评价)
		// 如果 process <= 0 表示不通过审核，默认审核不通过
		var sql = "call taskPass(?,?,?)",
				params , next_process = 0;
		// 审核通过
		if(info.result === g_vars.STATUS_PASS){
			// 下一阶段 ： 开题报告
			next_process = g_vars.PROCESS_OPEN;
		}
		
		params = [next_process,info.pro_id,info.comments];

		query(sql,params,function(error,result){
			if(error){
				console.log("dealTask : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},


	/**
	 * 处理开题报告信息 ： 
	 * 	审核通过 -> 将任务书标志为通过：status->1；pro_process进入下一阶段
	 *  审核不通过 -> status->2
	 * 
	 * @param  info  [课题id, 导师id, 		评价, 		处理结果 ： 1->同意,2:不同意]
	 *                [pro_id,tutor_id,comments,result]
	 *
	 */
	dealOpen : function(info,callback){
		var sql = "call openPass(?,?,?)",
				params, next_process = 0;
		// 审核通过
		if(info.result === g_vars.STATUS_PASS){
			// 参数 ：process (新阶段)  pid (课题id)  t_comments(导师评价)
			// 下一阶段 ： 外文翻译
			next_process = g_vars.PROCESS_TRANSLATE;
		}
		
		params = [next_process,info.pro_id,info.comments];

		query(sql,params,function(error,result){
			if(error){
				console.log("deal task update error : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},



	/**
	 * 处理外文翻译信息, 流程类似 dealTask 
	 *  将 submit_info.status 字段置位 1 ：已处理
	 *  审核通过 ->  status->1；pro_process进入下一阶段
	 *  审核不通过 -> status->2
	 *  
	 * @param  info  [学生id,申请id,课题id, 课题名称, 导师id, 		评价, 		处理结果 ： 1->同意,2:不同意]
	 *               [stu_id,sub_id,pro_id,pro_name,tutor_id,comments,result]
	 *
	 */
	dealTranslate : function(info,callback){
		 var sql = "call translatePass(?,?,?)",
		 		params, next_process = 0;
		// 审核通过
		if(info.result === g_vars.STATUS_PASS){
			// 下一阶段 ： 中期检查
			next_process = g_vars.PROCESS_MIDDLE;
		}
		
		params = [next_process,info.pro_id,info.comments];
		query(sql,params,function(error,result){
			if(error){
				console.log("dealTranslate : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},




	/**
	 * 处理中期答辩信息, 流程类似 dealTranslate
	 *  将 submit_info.status 字段置位 1 ：已处理
	 *  审核通过 -> status->1；pro_process进入下一阶段
	 *  审核不通过 -> status->2
	 *
	 * @return {[type]}   [description]
	 */
	dealMiddle : function(info,callback){
		var sql = "call middlePass(?,?,?)",
				params,next_process = 0;
		// 审核通过
		if(info.result === g_vars.STATUS_PASS){
			// 下一阶段 ： 上传论文草稿
			next_process = g_vars.PROCESS_DRAFT;
		}
		params = [next_process,info.pro_id,info.comments];
		query(sql,params,function(error,result){
			if(error){
				console.log("dealTranslate : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},



	/**
	 * 处理学生论文(草稿)信息, 流程类似 dealMiddle
	 *  将 submit_info.status 字段置位 1 ：已处理
	 *  审核通过 -> status->1；pro_process进入下一阶段
	 *  审核不通过 -> status->2
	 *  
	 */
	dealDraft : function(info,callback){
		 var sql = "call draftPass(?,?,?)",
		 		 params,next_process = 0;
		// 审核通过
		if(info.result === g_vars.STATUS_PASS){
			// 下一阶段 ： 上传论文正稿
			next_process = g_vars.PROCESS_PAPER;
		}
		params = [next_process,info.pro_id,info.comments];
		query(sql,params,function(error,result){
			if(error){
				console.log("dealDraft : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	},

	dealPaper : function(info,callback){
		 var sql = "call paperPass(?,?,?)",
		 		params, next_process = 0;
		// 审核通过
		if(info.result === g_vars.STATUS_PASS){
			// 下一阶段 ： 准备答辩
			next_process = g_vars.PROCESS_REPLY;
		}
		params = [next_process,info.pro_id,info.comments];
		query(sql,params,function(error,result){
			if(error){
				console.log("dealPaper : "+error.message);
				return g_vars.ERROR;
			}
			callback(result);
		});
	}

}