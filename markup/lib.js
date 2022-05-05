function TransToWeb(e) {
	e=e.replace(/\</g, "&lt;");
	e=e.replace(/\>/g, "&gt;");
	e=e.replace(/\&lt;br\&gt;/g, "\<br\>");
	
	e=e.replace(/\`\ /g, "<codetext>");//code
	e=e.replace(/\ \`/g, "</codetext>");//code
	
	e=e.replace(/\*\*\ /g, "<b>");
	e=e.replace(/\ \*\*/g, "</b>");
	
	e=e.replace(/\*\ /g, "<i>");
	e=e.replace(/\ \*/g, "</i>");
	
	e=e.replace(/\~\~\ /g, "<del>");
	e=e.replace(/\ \~\~/g, "</del>");
	
	e=e.replace(/\#t1\ /g, "<h1>");
	e=e.replace(/\ t1\#/g, "</h1>");
	e=e.replace(/\#t2\ /g, "<h2>");
	e=e.replace(/\ t2\#/g, "</h2>");
	e=e.replace(/\#t3\ /g, "<h3>");
	e=e.replace(/\ t3\#/g, "</h3>");
	
	e=e.replace(/\+list/g, "<ul>");
	e=e.replace(/\+\ /g, "</li><li>");
	e=e.replace(/\-list/g, "</ul>");
	
	e=e.split("\n").join("\<br\>");
	e=e.replace(/\ /g, "&nbsp;");
	
	e=e.replace(/\-\-\-/g, "<hr>");
	e=e.replace(/\[url\]/g, "<a href=\"");//超链接
	e=e.replace(/\[\/url\]/g, "\" target\=\"_blank\">>>></a>");//超链接
	
	e=e.replace(/\[img\]/g, "<img src=\"");//图片
	e=e.replace(/\[\/img\]/g, "\">");//图片
	
	e=e.replace(/\`\`\`code\<br\>/g, "<div class=\"code\" title=\"code\">");//code
	e=e.replace(/\`\`\`/g, "</div>");//code
	
	return e;
}

function TransToSave(e) {
	
	e=e.replace(/\</g, "&lt;");
	e=e.replace(/\>/g, "&gt;");
	e=e.split("\n").join("\<br\>");
	e=e.split("\t").join("&nbsp;&nbsp;&nbsp;&nbsp;");
	return e;
}

function go(){
	r = document.getElementById("code_input").value;
	document.getElementById("code_show").innerHTML = TransToWeb(r);
	var d = new Date();
	var Todate = d.getFullYear() + "/" + (d.getMonth() + 1) + d.getDate();
	document.getElementById("write_in").value = "\n0	ZZY_WISU	" + document.getElementById("titleIpt").value + "	" + TransToSave(r) + "	" + Todate;
}