function translate(e)
{
	e=e.replace(/\</g, "&lt;");
	e=e.replace(/\>/g, "&gt;");
	
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
	
	e=e.replace(/\ /g, "&nbsp;");
	e=e.replace(/\	/g, "<span style=\"white-space:pre\">	</span>");
	
	e=e.replace(/\+table\n/g, "<table border\=\"1\"\><tr><td>");
	e=e.replace(/\-table/g, "</td></tr></table>");
	e=e.replace(/\- /g, "</td></tr><tr><td>");
	e=e.replace(/\|/g, "</td><td>");
	
	e=e.split("\n").join("\<br\>");
	e=e.replace(/\<br\>\<br\>/g, "<br>");
	
	e=e.replace(/\-\-\-\-/g, "<hr>");
	e=e.replace(/\[url\]/g, "<a href=\"");//超链接
	e=e.replace(/\[\/url\]/g, "\" target\=\"_blank\">>>></a>");//超链接
	
	e=e.replace(/\[img\]/g, "<img src=\"");//图片
	e=e.replace(/\[\/img\]/g, "\">");//图片
	
	e=e.replace(/\`\`\`code\<br\>/g, "<div class=\"code\" title=\"code\">");//code
	e=e.replace(/\`\`\`/g, "</div>");//code
	
	return e;
}
function go()
{
	r=document.getElementById("code_input").value;
	e=translate(r);
	s=document.getElementById("code_show");
	s.innerHTML=e;
	txt=document.getElementById("write_in");
	txt.value=e;
	console.log(txt.value);
}
window.onload=function()
{
	setInterval("go()", 1000);
}