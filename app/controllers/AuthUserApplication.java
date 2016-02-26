package controllers;

import play.*;
import play.mvc.*;
import play.mvc.Http.MultipartFormData;
import play.mvc.Http.MultipartFormData.FilePart;

import views.html.*;
import play.data.Form;
import play.data.DynamicForm;
import play.data.validation.Constraints.*;

import play.libs.Json;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.ObjectMapper;  
import com.fasterxml.jackson.databind.JsonMappingException;  
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.core.JsonParseException;  

import play.api.libs.ws.Response;
import play.api.libs.ws.WS;
import play.data.DynamicForm;
import com.avaje.ebean.*;

import java.util.ArrayList;
import java.util.List;
import models.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.Iterator;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileNotFoundException;
import java.net.URISyntaxException;
import java.lang.NullPointerException;
import java.io.ByteArrayOutputStream;
import javax.imageio.stream.FileImageInputStream;

import play.db.ebean.Model;
import common.*;

@Security.Authenticated(Secured.class)
public class AuthUserApplication extends Controller {
    
    public static Result kzAuthUser() throws JsonParseException, JsonMappingException, IOException {
        
        ObjectNode resultJson = Json.newObject();
		
		//输入参数
    	DynamicForm in = Form.form().bindFromRequest();
    	
    	//分页
    	//每页显示数据
		int pageSize = Integer.parseInt(Play.application().configuration().getString("pagesize"));
		
		//当前第N页
		int pageNow = 1;
		
		String pageNowIn = (String)in.get("pagenow");
		if(pageNowIn!=null){
		
			pageNow = Integer.parseInt(pageNowIn);
		}
		
    	List<AuthUser> list = AuthUserApplication.list(pageSize,pageNow);
    	
    	//总数
		int countAll = AuthUserApplication.count();
		
		//总页数
		int pageCount = 0;
		
		if (countAll % pageSize == 0) {
       		pageCount = countAll / pageSize;
      	} else {
       		pageCount = countAll / pageSize + 1;
      	}
      	
      	String path = Play.application().configuration().getString("imageurl");
      	
      	return ok(kzAuthUser.render(list,countAll,pageNow,pageCount,pageSize,path));
    }
    
    public static List<AuthUser> list(int pageSize,int pageNow){
		
		int start=(pageNow-1)*pageSize;
		
      	String paramsSql = " and isadmin <> 1 ";
		
		if(session("isadmin").equals("0")){
			
			paramsSql = " and isadmin <> 1 and ismanager <> 1";
		}
		
		//sql语句       
	 	String sql = "select userid from auth_user where 1=1 "+paramsSql+" order by userid desc limit "+start+" ,"+pageSize;   
	
  		RawSql rawSql = RawSqlBuilder.unparsed(sql)
  		.columnMapping("userid",  "userid")   
  		.create();
  		
  		Query<AuthUser> eQ = Ebean.find(AuthUser.class);
  		eQ.setRawSql(rawSql);
  		
  		List<AuthUser> list = eQ.findList();

		return list;
    }
    
    public static int count(){
		
      	String paramsSql = " and isadmin <> 1 ";
		
		if(session("isadmin").equals("0")){
			
			paramsSql = " and isadmin <> 1 and ismanager <> 1";
		}

		//sql语句       
	 	String sql = "select count(userid) as count from auth_user where 1=1 "+paramsSql;  
     	
        SqlRow row = Ebean.createSqlQuery(sql).findUnique(); 
        
        int i = row.getInteger("count");  
       	
     	return i;
    }
    
    public static Result findExistUsername() throws JsonParseException, JsonMappingException, IOException
	{ 
		//输入参数
    	DynamicForm in = Form.form().bindFromRequest();

		ObjectNode resultJson = Json.newObject();
		
		String username = (String)in.get("username");
		
		if(username==null){
			username="";
		}

		if(username.equals("")){

			resultJson.put("code", "-1");
       		resultJson.put("msg", "用户账号不能为空!");
        	return ok(resultJson.toString());
		}

		AuthUser user = AuthUser.findByUsername(username);

		if(user!=null){

			resultJson.put("code", "-2");
       		resultJson.put("msg", "用户账号已经存在!");
        	return ok(resultJson.toString());
		}

        Logger.info("查询成功！");
        resultJson.put("code", "0"); 
        resultJson.put("msg", "查询成功！"); 
        return ok(resultJson.toString());
             
    }
    
    public static Result kzAuthUserAdd() {

        return ok(kzAuthUserAdd.render(""));
    }
    
    public static Result kzAuthUserAddDo() {
    	
    	//输入参数
    	DynamicForm in = Form.form().bindFromRequest();
    	
    	String username = in.get("authusername");
    	String password = in.get("password");
    	String name = in.get("name");
    	String mobile = in.get("mobile");
    	String ismanagerStr = in.get("ismanager");
    	
    	if(ismanagerStr==null){
			ismanagerStr = "0";
		}
    	
       	AuthUser authUser = new AuthUser();
		
		String userid = UtilsObject.getUUID();
		Date date=new Date();
		
		try {
			authUser.setUserid(userid);
			authUser.setUsername(username);
			authUser.setPassword(MD5.GetMD5Code(password));
			authUser.setName(name);
			authUser.setMobile(mobile);
			authUser.setIsmanager(Integer.parseInt(ismanagerStr));
			authUser.setStatus(0);
			authUser.save();
		}
		catch(Exception e){
			
		}
    	
        return redirect("/kzAuthUser");
    }
    
    public static Result kzAuthUserDetail(String id) {
		
		AuthUser authUser = AuthUser.findById(id);
		
        return ok(kzAuthUserDetail.render(authUser,""));
    }
    
    public static Result kzAuthUserUpdate() {
    
    	//输入参数
    	DynamicForm in = Form.form().bindFromRequest();
    	
    	String userid = in.get("userid");
    	
    	if(userid==null||userid.equals("")){
    		
    		return redirect("/kzAuthUser");
    	}
    	
    	AuthUser authUser = AuthUser.findById(userid);
       	
       	if(authUser==null){
       		
       		ok(kzAuthUserDetail.render(authUser,"没有数据!"));
       	}
    	
    	String name = in.get("name");
    	String mobile = in.get("mobile");
    	String ismanagerStr = in.get("ismanager");
    	
    	if(ismanagerStr==null){
			ismanagerStr = "0";
		}
	
		try {
			authUser.setName(name);
			authUser.setMobile(mobile);
			authUser.setIsmanager(Integer.parseInt(ismanagerStr));
			
			authUser.update();
		}
		catch(Exception e){
		
		}
    	
        return redirect("/kzAuthUser");
        
    }
    
    public static Result kzPasswdEdit(String id){

		return ok(kzPasswdEdit.render(id,""));
    }

	public static Result kzPasswdEditDo(){

 		//输入参数
    	DynamicForm in = Form.form().bindFromRequest();
  		
		String userid = (String)in.get("userid");
		String password = (String)in.get("password");

    	AuthUser user = AuthUser.findById(userid);

		String msg = "修改密码成功!";
    	try{
    		user.setPassword(MD5.GetMD5Code(password));

			user.update();
		}catch(Exception e){
			Logger.info("修改密码失败:e:"+e);
			msg = "修改密码失败！";
			return ok(kzPasswdEdit.render(userid,msg));
		}  
		Logger.info("修改密码成功。");

    	return ok(kzPasswdEdit.render(userid,msg));
    }
    
    public static Result kzUserPasswdEdit(String id){

		return ok(kzUserPasswdEdit.render(id,""));
    }

	public static Result kzUserPasswdEditDo(){

 		//输入参数
    	DynamicForm in = Form.form().bindFromRequest();
  		
		String userid = (String)in.get("userid");
		String password = (String)in.get("password");

    	AuthUser user = AuthUser.findById(userid);

		String msg = "修改用户密码成功!";
    	try{
    		user.setPassword(MD5.GetMD5Code(password));

			user.update();
		}catch(Exception e){
			Logger.info("修改用户密码失败:e:"+e);
			msg = "修改用户密码失败！";
			return ok(kzUserPasswdEdit.render(userid,msg));
		}  
		Logger.info("修改用户密码成功。");

    	return ok(kzUserPasswdEdit.render(userid,msg));
    }
    
    public static Result kzAuthUserDel(String id) {
		
		AuthUser.del(id);
		
        return redirect("/kzAuthUser");
    }
    
    public static Result userDisable(String id){
		
 		AuthUser.disable(id);

		return redirect("/kzAuthUser");
    }
    
    public static Result userEnable(String id){

 		AuthUser.enable(id);

		return redirect("/kzAuthUser");
    }
}
