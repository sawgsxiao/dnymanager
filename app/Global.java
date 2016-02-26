import play.*;  
import play.mvc.*;  
import play.mvc.Result;
import play.mvc.Results;
import play.mvc.Results.*;    
import play.mvc.Http.Request;
import java.lang.reflect.Method;

import views.html.*;
import views.*;

import play.GlobalSettings;
import play.mvc.Http;
import play.mvc.SimpleResult;
import play.mvc.Results;
import play.libs.F;

import java.util.Timer;
/**
 * 全局设置
 *
 */
public class Global extends GlobalSettings {  
  
	@Override  
	public void onStart(Application app) { 
	
		Timer timer = new Timer(); 
      	timer.schedule(new Task(), Long.valueOf(Play.application().configuration().getString("timerSchedule")) * 1000); 
		Logger.info("程序启动...");  
	}    
        
	@Override  
	public void onStop(Application app) {  
		Logger.info("程序关闭...");  
	}  
	
	//错误页面
	// @Override  
// 	public Result onError(Throwable t) {  
//         return internalServerError(  
// 			views.html.errorPage(t)  
// 			
//         );  
// 	}  
	
	//找不到请求的action
	// @Override  
// 	public Result onHandlerNotFound(Request request) {  
//         return notFound(  
// 			views.html.pageNotFound(uri)  
//         );  
// 	}  
	@Override
    public F.Promise<SimpleResult> onHandlerNotFound(Http.RequestHeader requestHeader) {
        // This is here to make sure that the context is set, there is a test that asserts
        // that this is true
        Http.Context.current().session().put("onHandlerNotFound", "true");
        return F.Promise.<SimpleResult>pure(Results.notFound("很抱歉，您查看的页面找不到了！"));
    }

	// @Override  
//     public Result onBadRequest(String uri, String error) {  
//         return badRequest("您请求的资源在火星!");  
//     }   

	@Override  
    public Action onRequest(Request request, Method actionMethod) {  
       	Logger.info("发送请求前..."+ request.toString());   
       	return super.onRequest(request, actionMethod);  
    }  
} 
