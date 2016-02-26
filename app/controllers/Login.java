package controllers;

import play.*;
import play.mvc.*;

import views.html.*;
import play.data.Form;
import play.data.DynamicForm;
import play.data.validation.Constraints.*;

import java.util.List;
import models.*;

public class Login extends Controller {
	
	//登录
	public static Result login(){
		
		if(session("username")==null||session("username")==""){
			return ok(login.render("请输入您的账号和密码.",0));
		}
		else{
		
			return redirect(Play.application().configuration().getString("loginFirstPage"));
		}
	}
	
	
	//登录
	public static Result loginDo(){
		
		//输入参数
		DynamicForm in = Form.form().bindFromRequest();
		
		String username = in.get("username");
		String password = in.get("password");
		
		if(username==null||username==""){
			return ok(login.render("请输入用户名！",1));
		}
		
		if(password==null||password==""){
			return ok(login.render("请输入密码！",1));
		}
		
		if(AuthUser.authenticate(username, password) == null) {
            return ok(login.render("用户名或密码错误！",1));
        }
		
		AuthUser authUser = AuthUser.findByUsername(username);
		
		session("name",authUser.getName());
		session("userid",authUser.getUserid());
		session("username", username);
// 		session("password", password);
		session("isadmin", authUser.getIsadmin()+"");
		
		return redirect(Play.application().configuration().getString("loginFirstPage"));
		
	}
	
	//登出
// 	@Security.Authenticated(Secured.class)
	public static Result logout(){
	
		session().clear();
		flash("成功", "成功登出！");
		
		return redirect("login");
	}

}
