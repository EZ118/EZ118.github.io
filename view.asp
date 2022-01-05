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
	id = request("id")
	
	action = request("action")
	
	if id <> "" and action="del" then
		sql = "delete from liuyan where id=" & id
		conn.Execute sql
		response.redirect("/")
	end if
	
%>

<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=gb-2312">
		<link href="StyleNew.css" rel="stylesheet" type="text/css">
		<link rel="shortcut icon" href="./img/icon.png">
		<link rel="stylesheet" type="text/css" href="./markup/mark.css">
		<style>
		.body_out{
			border:3px solid #ccc;
			padding:10px;
			border-radius:45px;
			background-color:#3399ff;
			width:700px;
			box-shadow:1px 1px 3px #292929;
		}
		.body_in{
			border:3px solid #ccc;
			padding:15px;
			border-radius:40px;
			background-color:#ffffff;
		}
		h2{margin:4px;}
		h3{margin:4px;}
		</style>
		<title>文章:<%=id%></title>
		<script>
		function checkform()
		{
			var flag=true;
			if(document.form1.sCont.value=="")
			{
				alert("评论不能为空!");
				document.form1.sCont.focus();
				return false
			};
			top.location.href=""
			return flag;
			
		}
		</script>
	</head>
	<body>
		<%
				rs.Open sqltext,conn,1,1
				set rs=conn.execute("select *from liuyan where id="&id)
				%>
				<center>
					<div style="width:56%;" class="body_out">
						<div class="body_in">
							<h2 align="left"><%=id%>. <%response.write(rs("sTitle"))%></h2>
							<h3 align="left">作者：<%=rs("userName")%></h3>
							<div align="left" style="font-size:16;margin:4px;">
								<%=rs("sContent")%>
							</div>
						</div>
					</div>
				</center>
				<%
				rs.close		
		%>
	</body>
</html>