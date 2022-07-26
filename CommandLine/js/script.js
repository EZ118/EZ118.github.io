function keyup_submit(e, ele){ 
	var evt = window.event || e; 
	if (evt.keyCode == 13 && ele.value != ""){
		loadlist(ele.value);
		document.getElementById("SaveCommand").value = ele.value;
	} else if(evt.keyCode == 38){
		ele.value = document.getElementById("SaveCommand").value;
	}
}
function scrollToBottom() {
	var t = document.body.clientHeight;
	window.scroll({top:t,left:0,behavior:'smooth'});
}

function exec(ajaxLoadedData){
	// 第一步：匹配加载的页面中是否含有js
	var regDetectJs = /<script(.|\n)*?>(.|\n|\r\n)*?<\/script>/ig;
	var jsContained = ajaxLoadedData.match(regDetectJs);

	// 第二步：如果包含js，则一段一段的取出js再加载执行
	if(jsContained) {
		// 分段取出js正则
		var regGetJS = /<script(.|\n)*?>((.|\n|\r\n)*)?<\/script>/im;

		// 按顺序分段执行js
		var jsNums = jsContained.length;
		for (var i=0; i<jsNums; i++) {
			var jsSection = jsContained[i].match(regGetJS);

			if(jsSection[2]) {
				if(window.execScript) {
					// 给IE的特殊待遇
					window.execScript(jsSection[2]);
				} else {
					// 给其他大部分浏览器用的
					window.eval(jsSection[2]);
				}
			}
		}
	}
}

function loadlist(cmd) {
	let old = cmd;
	let url = old + " ";
	url = url.split(" ");
	
	if (window.XMLHttpRequest) {xhttp = new XMLHttpRequest();}
	else {xhttp = new ActiveXObject("Microsoft.XMLHTTP");}
	
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById("bd").innerHTML += "&gt;&nbsp;" + old + "<br>";
			document.getElementById("bd").innerHTML += this.responseText + "<br>";
			exec(this.responseText);
			scrollToBottom();
			document.getElementById("CmdInput").value = "";
		} else if(this.readyState == 4 && (this.status == 403 || this.status == 404 || this.status == 400)) {
			document.getElementById("bd").innerHTML += "&gt;&nbsp;" + old + "<br>";
			document.getElementById("bd").innerHTML += "'" + old + "'is not an internal or external command, nor is it a runnable program or batch file.<br>";
			scrollToBottom();
			document.getElementById("CmdInput").value = "";
		}
	};
	xhttp.open("GET", "./apps/" + url[0] + ".html", true);
	xhttp.send(); 
}

window.onload = function(){
	var aaa = setInterval("scrollToBottom()", 10000);
}

