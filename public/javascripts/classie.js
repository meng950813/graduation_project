;
( function(window){
	"use strict";

	function classReg(className){
		return new RegExp("(^|\\s+)" + className + "(\\s+||$)");
	}

	var hasClass,addClass,removeClass;

	if("classList" in document.documentElement){

		hasClass = function(elem,c){
			return elem.classList.contains(c);
		};
		addClass = function(elem,c){
			elem.classList.add(c);
		};
		removeClass = function(elem,c){
			elem.classList.remove(c);
		};
	}
	else{
		hasClass = function(elem,c){
			return classReg(c).test(elem.className);
		};

		addClass = function(elem,c){
			if(!hasClass(elem,c)){
				elem.className += (" "+c);
			}
		};

		removeClass = function(elem,c){
			elem.className = elem.className.replace(classReg(c));
		};
	}

	function toggleClass(elem,c){
		hasClass(elem,c)?removeClass(elem,c):addClass(elem,c);
	}

	var classie = {
		hasClass : hasClass,
		addClass : addClass,
		removeClass : removeClass,
		toggleClass : toggleClass,

		// short name
		has : hasClass,
		add : addClass,
		remove : removeClass,
		toggle : toggleClass
	};

	// transport ==> 将 classie 变为全局对象
	if ( typeof define === 'function' && define.amd ) {
	  // AMD
	  define( classie );
	} else {
	  // browser global
	  window.classie = classie;
	}
} )(window);


/*  封装$ */
;window.$ = HTMLElement.prototype.$ = function(selector){
	var elem = document.querySelectorAll(selector);

	return elem.length == 0 ? null
				:elem.length == 1 ? elem[0]
				:elem;
}
window.$logger = HTMLElement.prototype.$logger = function(log){
	console.log(log);
}


/* 封装ajax */
window.AJAX = HTMLElement.prototype.AJAX  = {

	post : function(url,data,callback){
		var xhr = new window.XMLHttpRequest();
		xhr.open("post",url,true);
		xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');    //设置HTTP header字段
	  xhr.onreadystatechange = function () {
			// readyState==4 : 请求已完成;  304未修改
      if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
        callback(JSON.parse(xhr.responseText));
    	}
    };
    xhr.send(JSON.stringify(data));
	},

	get : function(url,callback){
		var xhr = new window.XMLHttpRequest();
		xhr.open('GET',url,true);
		xhr.onreadystatechange=function(){
			if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) { 
				callback(JSON.parse(xhr.responseText));  //从服务器获得数据
			}
		};
		xhr.send(null);
	}
}
