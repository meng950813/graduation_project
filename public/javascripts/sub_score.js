/* 设置上传路径及文件 */
var data = {},url;
(function(){
	if($("#work_report") != null){
		data = {
			work_report : null,
			reply_status: null
		}
		url = "score/reply_score";
	}
	else if($("#attitude") != null){
		data = {
			attitude 	: null,
			ablity		: null,
			checking	: null
		}
		url = "score/usual_grades";
	}
	else if($("#paper_level") != null){
		data = {
			paper_level : null,
			completion 	: null,
			quality 		: null,
			design 			: null,
			workload 		: null
		}
		url = "score/appraise_score"
	}
	else if($("#completion") != null){
		data = {
			completion 		: null,
			basic_status 	: null,
			application 	: null,
			paper_quality : null
		};
		url = "score/tutor_score";
	}
})();


var dialog = new show_result_dialog($("#animateDialog"),$("#animateDialog .close-btn"));

var score = new sub_score(
		$("#sub_score"),
		dialog,
		$("#score-area"),
		url,
		data
	);

