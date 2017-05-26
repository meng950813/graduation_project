/**
 * Created by cm on 2017/4/15
 */
var query = require("../helper/createMysqlPool");

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
		var sql = `insert into project_info(pro_id,pro_name,pro_type,pro_nature,major_id,publisher,status)
							values(null,?,?,?,?,?,0)`;
		var params = [info.pro_name,info.pro_type,info.pro_nature,info.major_id,info.tutor_id];
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
		var sql = `select project_info.*,major_name,pro_process as progress
							from project_info
							left join major_info on project_info.major_id = major_info.major_id
							left join student_info on pro_id = student_info.project_id
							where pro_id =? `;
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
	 * 检测输入的课题名是否存在
	 *
	 * @param {[type]}   pro_name [description]
	 *
	 */
	checkProjectName : (pro_name,callback)=>{
		var sql = `select pro_id from project_info where pro_name=?`;
		query(sql,[pro_name],(error,result)=>{
			if(error){
				console.log("check project name error : "+error.message);
				return;
			}
			callback(result);
		});
	},


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
		var sql,params;
	 	
	 	// 同意
	 	if(info.result === g_vars.STATUS_PASS){
		 	// 返回值 ：0 ：已被选择，不能重复选择 	1 ：一切成功
			sql = "call dealSelectProject(?,?,?)";
			params = [info.cho_id,info.stu_id,info.pro_id];

			query(sql,params,function(error,result){
				if(error){
					console.log("dealSelectProject : "+error.message);
					return g_vars.ERROR;
				}
				
				callback(result);
			});
		}
		
		// 拒绝:给学生发私信，告知已被拒绝
		else{
			info.title = "你申请的课题："+info.pro_name+"  被导师拒绝, 辣鸡";
			/* 拒绝 ： cho_id , sender, receiver,title */
			sql = "call rejectSelectProject(?,?,?,?)";
			params = [info.cho_id,info.tutor_id,info.stu_id,info.title];
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
	 * 获取所有未处理的选题申请
	 *
	 * @param {[type]}   tutor_id [description]
	 */
	getSelectInfo : (tutor_id,callback)=>{
		var sql = `select choose_pro_info.*,pro_id,pro_name from choose_pro_info,project_info
							where tutor_id=? and  choose_pro_info.status=0 and project_id=pro_id
							order by choose_pro_info.publish_time desc`;
		query(sql,[tutor_id],(error,result)=>{
			if(error){
				console.log("get select error" + error.message);
				return;
			}
			callback(result);
		});
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
	},


	/**
	 * 获取考核卡片列表信息
	 *
	 * @param {[type]}   tutor_id [description]
	 */
	getAssessList : (tutor_id,callback)=>{
		var sql,nowYear = (new Date()).getFullYear();
		sql = `select stu_name,stu_num,pro_id,pro_name,pro_type,pro_nature,assess_comments as assess
					from project_info
					left join student_info on pro_id = student_info.project_id
					left join assessment_info on pro_id = assessment_info.project_id
					where publisher=? and publish_time>? and project_info.status=1`;
		query(sql,[tutor_id,nowYear],(error,result)=>{
			if(error){
				console.log("get assess list : "+error.message);
				return;
			}
			callback(result);
		});
	},

	/**
	 * 获取考核卡片详情,成绩等级,学生姓名,课题名称
	 */
	getAssess : (pro_id,callback)=>{
		var sql = `select assessment_info.*,stu_name,stu_num,pro_name,pro_id,score_info.*
						from project_info
						left join student_info on student_info.project_id=pro_id
						left join assessment_info on assessment_info.project_id=pro_id
						left join score_info on score_info.project_id=pro_id
						where pro_id = ?`;
		query(sql,[pro_id],(error,result)=>{
			if(error){
				console.log("get assess : "+error.message);
				return;
			}
			callback(result);
		});
	},

	/**
	 * 插入/修改考核卡
	 *
	 * @param {[type]}   info     [pro_id,comments,file_path]
	 *
	 */
	updateAssess : (info,callback)=>{
		var sql = `update assessment_info set assess_comments=?`,
		 	   params = [info.comments];
		if(info.file_path != null || info.file_path != undefined){
		 	sql += ",annex_path=?";
		 	params.push(info.file_path);
		}
		sql += "where project_id=?";
		params.push(info.pro_id);
		query(sql,params,(error,result)=>{
		 	if(error){
		 		console.log("update assess : "+error.message);
		 		return;
		 	}
		 	callback(result);
		});
	}
}