<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<%
'以下这段是连接数据库
dim conn,connstr,rs
Server.ScriptTimeout=900
connstr="Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" & Server.MapPath("zhou.mdb")
On Error Resume Next
    Set conn = Server.CreateObject("ADODB.Connection")
    Conn.open connstr
    If Err Then
        err.Clear
        Set Conn = Nothing
        Response.Write "Error"
        Response.End
    End If
     
    %>
     
<%
	set rs=server.createobject("adodb.recordset")
	 
	action=request("action")

	if Request.ServerVariables("REQUEST_METHOD")="POST" and action="new" then
		cName=request("userName")
		cTitle=request("sTitle")
		cContent=request("sContent")
		sql="select * from liuyan where (id is null)"
		rs.open sql,conn,1,3
		rs.addnew
		rs("userName")=cName
		rs("sTitle")=cTitle
		rs("sContent")=cContent
		rs.update
		response.redirect("/")
		rs.close
	end if
%>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=gb-2312">
		<link rel="shortcut icon" href="../img/icon.png">
		<link rel="stylesheet" type="text/css" href="./markup/mark.css">
        <script src="./markup/lib.js"></script>
		<style>
			center{
				width:100%;
				height:100%;
			}
		</style>
		<script src="./ftml/trans.js"></script>
		<title>撰写文章</title>
	</head>
	<body>
		<center>
			<form name="form1" method="post" action="articledit.asp" onsubmit="return checkform()">
				<div class="tbtr" align="left" style="height:31px;">
					<input type=text name=sTitle size=80 style="height:25px;margin:4px;width:70%" autocomplete="off" placeholder=" 在此输入标题"> 
					<input type="reset" style="height:25px;width:10%" value="清 空">&nbsp;
					<input type="submit" style="height:25px;width:10%" name="Submit" value="发 布">
					<input type=hidden name=userName value="ZZY_WISU">
					<input type=hidden name=action value="new">
				</div>
				<div>
					<div align="right">
                        <a href="#What_the_fuck_is_that!" onclick="window.open('./markup/help.html','','resizable=no,width=400,height=450');">查看MarkUp编辑器教程</a>
                        <input type=button onclick="go()" style="border:solid 1px #ccc;padding:5px;border-radius:5px;background-color:#fff;" value="手动转换">
					</div>
					<textarea id="code_input" placeholder="键入以输入..." maxlength="1000"></textarea>
					<div id="code_show" onclick="go()" align="left"></div><br>
					<input id="write_in" name="sContent" type="hidden" value="">
				</div>
			</form>
		</center>
		<script language=Javascript>
			document.form1.userName.focus()	
			function checkform()
			{
				var flag=true;
				if(document.form1.sTitle.value==""){alert("请输入标题!");document.form1.sTitle.focus();return false};
				if(document.form1.sContent.value==""){alert("请点击手动转换按钮!");document.form1.sContent.focus();return false};
				return flag;
			}
		</script>
	</body>
</html>