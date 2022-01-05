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
'定义一个数据集rs
set rs=server.createobject("adodb.recordset")

rType=request("rType")
curId=request("curId")
ctype=request("ctype")
id=request("id")

%>
	
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=gb-2312">
		<link href="StyleNew.css" rel="stylesheet" type="text/css">
		<link rel="shortcut icon" href="./img/icon.png">
		<style>
		.lbody{
			width:60%;
			margin-left:35%;
		}
		.abody{
			width:100%;
			padding:10px;
			border-radius:10px;
			box-shadow:0 0 10px #CCC;
			margin-bottom:15px;
		}
		</style>
		<title>ZZY_WISU的个人主页</title>
	</head>
	<body>
		<div>
			<img src="./img/cover-left.png" style="height:100%;position:fixed;left:0px;top:0px;z-index:10;">
			
			<div style="height:100%;position:fixed;left:0px;top:0px;z-index:10;padding:10px;">
				<img src="./img/icon.png" style="border-radius:100%;height:40px;"><br>
			</div>
		</div>
		
		<div class="lbody" style="width:56%;">
			<%
				sqltext="select * from liuyan  order by id desc"
				rs.Open sqltext,conn,1,1
				i=1
				do while not rs.EOF
				%>
				<table class="abody" onclick="window.open('./view.asp?id=<%=rs("id")%>');" align=left>
					<tbody>
						<tr>
							<td width=50px>
								<img src="./img/icon.png" style="border-radius:100%;height:40px;">
							</td>
							<td>
								<%=rs("userName")%>
							</td>
							<td align=right colspan=2>
								<i><%=rs("cDate")%></i>
							</td>
						</tr>
						<tr>
							<td colspan=2>
								<b><%=rs("sTitle")%></b>
							</td>
							<td></td>
							<td width=20px>
								<img src="./img/go.png" style="width:20px;">
							</td>
						</tr>
					</tbody>
				</table>
				<%	
					i=i+1
					rs.MoveNext
				loop
				rs.close		
			%>
		</div>
		<img src="./img/new-article.png" onclick="location.href='./articledit.asp'" style="border-radius:100%;height:55px;position:fixed;bottom:15px;right:15px;z-index:10;box-shadow:0 0 10px #CCC;">
		<%
		set rs=nothing
		conn.close
		set conn=nothing	
		%>
	</body>
</html>