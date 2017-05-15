/* 记录全局变量 */

var variable = function(){
	// 响应请求结果
	this.SUCCESS = 1;
	this.ERROR 	= 0;
	
	// 用户身份
	this.ID_STUDENT	= 0;
	this.ID_TUTOR		= 1;
	this.ID_MANAGER = 2;

	
	// 审核/处理情况
	this.STATUS_INIT	= 0; // 初始状态，未处理
	this.STATUS_PASS	= 1; // 审核通过
	this.STATUS_FAIL	= 2; // 审核不通过

	this.STATUS = [];
	this.STATUS[this.STATUS] = "等待审核";
	this.STATUS[this.STATUS] = "审核通过";
	this.STATUS[this.STATUS] = "审核不通过";



	// 课题进度
	this.PROCESS_SELECT 		= 1; // 选题
	this.PROCESS_TASK 			= 2; // 任务书
	this.PROCESS_OPEN 			= 3; // 开题
	this.PROCESS_TRANSLATE 	= 4; // 外文翻译
	this.PROCESS_MIDDLE 		= 5; // 中期答辩
	this.PROCESS_DRAFT 			= 6; // 论文草稿
	this.PROCESS_PAPER 			= 7; // 论文
	this.PROCESS_REPLY 			= 8; // 答辩
	this.PROCESS_OVER 			= 9; // 结束

	this.PROCESS = [];
	this.PROCESS["task"] 			= "任务书";
	this.PROCESS["open"] 			= "开题报告";
	this.PROCESS["translate"] = "外文翻译";
	this.PROCESS["middle"] 		= "中期检查";
	this.PROCESS["draft"] 		= "论文草稿";
	this.PROCESS["paper"] 		= "论文正稿";
	this.PROCESS["reply"] 		= "答辩";
	this.PROCESS["over"] 			= "完成";

	// 毕设类型
	this.PRO_TYPE_A = "A";
	this.PRO_TYPE_B = "B";
	this.PRO_TYPE_C = "C";
	this.PRO_TYPE_D = "D";
	this.PRO_TYPE_E = "E";
	
	this.PRO_TYPE = [];
	this.PRO_TYPE[this.PRO_TYPE_A] = "工程设计(实践)";
	this.PRO_TYPE[this.PRO_TYPE_B] = "理论研究";
	this.PRO_TYPE[this.PRO_TYPE_C] = "实验研究";
	this.PRO_TYPE[this.PRO_TYPE_D] = "计算机软件综合";
	this.PRO_TYPE[this.PRO_TYPE_E] = "综合";

	// 毕设性质
	this.PRO_NATURE_A = "A";
	this.PRO_NATURE_B = "B";
	this.PRO_NATURE_C = "C";
	this.PRO_NATURE_D = "D";
	this.PRO_NATURE_E = "E";
	this.PRO_NATURE_F = "F";

	this.PRO_NATURE = [];
	this.PRO_NATURE[this.PRO_NATURE_A] = "纵向课题";
	this.PRO_NATURE[this.PRO_NATURE_B] = "已签合同的横向课题";
	this.PRO_NATURE[this.PRO_NATURE_C] = "未签合同的横向课题";
	this.PRO_NATURE[this.PRO_NATURE_D] = "实验室建设课题";
	this.PRO_NATURE[this.PRO_NATURE_E] = "模拟性课题";
	this.PRO_NATURE[this.PRO_NATURE_F] = "学生自选人文课题";


	this.FILE_DIR = "upload_files";

	/* 
	session:
			stu_id,
			reply_group_id

			pro_id,
		
			tutor_id,
		
		
	localStorage:
			stu_name,
			stu_num,
			major_name,
		
			tutor_num,
			tutor_name
			
			pro_name,
			pro_type,
			pro_nature,
*/
}

module.exports = new variable();