package models;

import play.db.ebean.Model;

import java.io.FileInputStream;
import java.io.OutputStream;
import java.io.InputStream;
import java.io.ByteArrayInputStream;  
import java.io.ByteArrayOutputStream;  
import java.io.DataInputStream;  
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.io.IOException;

import javax.persistence.Table;
import javax.persistence.Entity;
import javax.persistence.Id;
import java.util.Date;
import java.util.List;

import play.db.ebean.*;
import play.data.format.*;
import play.data.validation.*;

import com.avaje.ebean.*;
import javax.persistence.*;

import models.*;
import common.*;
@Entity
@Table(name="auth_user")
public class AuthUser extends Model{
	
	private static final long serialVersionUID = 1L;
	
    @Id
    private String userid;

    private String username;
    private String password;
    private int status;
    private String name;
    private int authid;
    private String remark;
    private String mobile;
    private int isadmin;
    private int ismanager;
    
    public AuthUser() {

    }

    public static Finder<String,AuthUser> find = new Finder<String,AuthUser>(
    	String.class, AuthUser.class
  	); 
  	
  	public static AuthUser findById(String userId) {
        return find.where().eq("USERID", userId).findUnique();
    }
    
    /**
     * Retrieve a User from username.
     */
    public static AuthUser findByUsername(String username) {
        return find.where().eq("username", username).findUnique();
    }
    
    /**
     * Authenticate a FcSysUser.
     */
    public static AuthUser authenticate(String username, String password) {
        return find.where()
            .eq("username", username)
            .eq("password", MD5.GetMD5Code(password))
            .eq("status", 0)
			.eq("ismanager", 1)
            .findUnique();
    }
    
    public static void del(String userid) {
    	Ebean.createSqlUpdate(
            "delete from auth_user where userid = :userid "
        ).setParameter("userid", userid)
         .execute();
    }
    
	public static void disable(String userid) {
    	Ebean.createSqlUpdate(
            "update auth_user set status = 1 where userid = :userid "
        ).setParameter("userid", userid)
         .execute();
    }
    
    public static void enable(String userid) {
    	Ebean.createSqlUpdate(
            "update auth_user set status = 0 where userid = :userid "
        ).setParameter("userid", userid)
         .execute();
    }

    // Getter and Setter removed for brevity
    public String getUserid() {
  		return userid;
	}
	
	public void setUserid(String userid) {
		this.userid = userid;
	}
	
	public String getUsername() {
  		return username;
	}
	
	public void setUsername(String username) {
		this.username = username;
	}
	 
	public String getPassword() {
		return password;
	}
	
	public void setPassword(String password) {
		this.password = password;
	}
	
	public int getStatus() {
		return status;
	}
	
	public void setStatus(int status) {
		this.status = status;
	}
	
	public String getName() {
  		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public int getAuthid() {
		return authid;
	}
	
	public void setAuthid(int authid) {
		this.authid = authid;
	}
	
	public String getRemark() {
		return remark;
	}
	
	public void setRemark(String remark) {
		this.remark = remark;
	}
	
	public String getMobile() {
		return mobile;
	}
	
	public void setMobile(String mobile) {
		this.mobile = mobile;
	}
	
	public int getIsadmin() {
		return isadmin;
	}
	
	public void setIsadmin(int isadmin) {
		this.isadmin = isadmin;
	}
	
	public int getIsmanager() {
		return ismanager;
	}
	
	public void setIsmanager(int ismanager) {
		this.ismanager = ismanager;
	}
	 
}
