package common;

import play.*;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Properties;
import java.util.UUID; 

import java.io.BufferedInputStream;  
import java.io.BufferedOutputStream;   
import java.io.FileOutputStream;  
import java.io.InputStream;  
import java.io.OutputStream;  
import java.util.Random;

import controllers.*;

/**
 * 共有类方法
 *
 */
public class UtilsObject {
   
    private static UtilsObject instance=null;
    
    private UtilsObject(){}
    
    public static UtilsObject getInstance(){
        if(instance==null){
            instance= new UtilsObject();
        }
        return instance;
    }
    
    public static String getUUID(){
    
    	UUID uuid = UUID.randomUUID();   
       	String str = uuid.toString();   
       		
       	// 去掉"-"符号   
      	String result = str.substring(0, 8) + str.substring(9, 13) + str.substring(14, 18) + str.substring(19, 23) + str.substring(24);
    	
    	return result;
    }
    
    //本地文件保存在服务器
    public static void copy(File src, File dst) {  
    	
    	int BUFFER_SIZE = Integer.parseInt(Play.application().configuration().getString("image_buffer_size"));  
    	
        InputStream in = null;  
        OutputStream out = null;  
        try {  
            in = new BufferedInputStream(new FileInputStream(src), BUFFER_SIZE);  
            out = new BufferedOutputStream(new FileOutputStream(dst),  
                    BUFFER_SIZE);  
            byte[] buffer = new byte[BUFFER_SIZE];  
            int len = 0;  
            while ((len = in.read(buffer)) > 0) {  
                out.write(buffer, 0, len);  
            }  
        } catch (Exception e) {  
            e.printStackTrace();  
        } finally {  
            if (null != in) {  
                try {  
                    in.close();  
                } catch (IOException e) {  
                    e.printStackTrace();  
                }  
            }  
            if (null != out) {  
                try {  
                    out.close();  
                } catch (IOException e) {  
                    e.printStackTrace();  
                }  
            }  
        }  
    }  
    
    //把内容中的图片地址转变为{imageurl}
    public static String changeContentByUrl(String content){
    
    	String imageUrl = Play.application().configuration().getString("resourceurl");
    	
    	String contentStr=content.replace(imageUrl,"{imageurl}");
    	
//     	contentStr=contentStr.replace("/ueditor/ueditor","{imageurl}/ueditor");
    	
    	return contentStr;
    } 
    
    //把内容中的{imageurl}转变为图片地址
    public static String changeUrlByContent(String content){
    
    	String imageUrl = Play.application().configuration().getString("resourceurl");
    	
    	String contentStr=content.replace("{imageurl}",imageUrl);
    	
//     	contentStr=contentStr.replace("/ueditor/ueditor",imageUrl+"/ueditor");
    	
    	return contentStr;
    } 
    
    //把width="***"改成width="100%"
    public static String changeWidth(String content){
    	
    	String contentStr=content.replaceAll("width=\".*?\"","width=\"100%\"");
    	
    	return contentStr;
    } 
    
    //把height="***"删除
    public static String delHeight(String content){
    	
    	String contentStr=content.replaceAll("height=\".*?\"","");
    	
    	return contentStr;
    }
    
    //把width:***;改成width:100%;
    public static String changeWidthStyle(String content){
    	
    	String contentStr=content.replaceAll("width\\:.*?\\;","width:100%;");
    	
    	return contentStr;
    } 
    
    //把height:***;删除
    public static String delHeightStyle(String content){
    	
    	String contentStr=content.replaceAll("height\\:.*?\\;","");
    	
    	return contentStr;
    }
	
	//随机6位验证码
	public static String randomNumeric6() {
        int count = 6;
        char start = '0';
        char end = '9';
 
        Random rnd = new Random();
 
        char[] result = new char[count];
        int len = end - start + 1;
 
        while (count-- > 0) {
            result[count] = (char) (rnd.nextInt(len) + start);
        }
 
        return new String(result);
    }
    
    //验证码下发语言
    //type 1:中 2:英 3:柬
    public static String getSMSContent(String username,String verifyCode,String langue) {
        
        String content = "";
        
        content = UtilsObject.getSMSByLogin(username,verifyCode,langue);
        
        return content;
    }
    
    public static String getSMSByLogin(String username,String verifyCode,String langue) {
    	
    	String content = "";
    	
    	/*if(langue.equals(ControllerType.LangueZH)){
        	content = "【旅游助理】手机号码:"+username+",您登陆的验证码为:"+verifyCode+",请于15分钟内输入。";
        }else if(langue.equals(ControllerType.LangueEN)){
        	content = "【旅游助理】mobile:"+username+",您登陆的验证码为:"+verifyCode+",请于15分钟内输入。";
        }else if(langue.equals(ControllerType.LangueKM)){
        	content = "【旅游助理】លេខទូរស័ព្ទចល័ត:"+username+",您登陆的验证码为:"+verifyCode+",请于15分钟内输入。";
        }*/
        
        return content;
    }
    
}
