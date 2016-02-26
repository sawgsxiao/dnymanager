package controllers;

import controllers.routes;
import models.*;
import play.mvc.Http.Context;
import play.mvc.Result;
import play.mvc.Security;
import java.util.Date;

public class Secured extends Security.Authenticator {
	
	@Override
    public String getUsername(Context ctx) {
 
        // see if user is logged in
        if (ctx.session().get("username") == null)
            return null;
 
        // see if the session is expired
        String previousTick = ctx.session().get("userTime");
        if (previousTick != null && !previousTick.equals("")) {
            long previousT = Long.valueOf(previousTick);
            long currentT = new Date().getTime();
            long timeout = Long.valueOf(play.Play.application().configuration().getString("sessionTimeout")) * 1000 * 60;
            if ((currentT - previousT) > timeout) {
                // session expired
                ctx.session().clear();
                return null;
            } 
        }
 
        // update time in session
        String tickString = Long.toString(new Date().getTime());
        ctx.session().put("userTime", tickString);
 
        return ctx.session().get("username");
    }
    
    // @Override
//     public String getUsername(Context ctx) {
//         return ctx.session().get("username");
//     }

    @Override
    public Result onUnauthorized(Context ctx) {
        return redirect("/login");
    }
}   
