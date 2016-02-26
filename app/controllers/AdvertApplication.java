package controllers;

import play.*;
import play.mvc.*;
import play.api.libs.ws.Response;
import play.api.libs.ws.WS;
import play.mvc.Http.MultipartFormData;
import play.mvc.Http.MultipartFormData.FilePart;
import play.db.ebean.Model;
import play.data.DynamicForm;

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
import java.io.IOException; 

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

import java.io.BufferedInputStream;  
import java.io.BufferedOutputStream;  
import java.io.File;  
import java.io.FileInputStream;  
import java.io.FileOutputStream;  
import java.io.InputStream;  
import java.io.OutputStream; 
import java.util.regex.Pattern;
import java.util.regex.Matcher; 

import common.*;

import models.*;

// @Security.Authenticated(Secured.class)
public class AdvertApplication extends Controller {
    
    public static Result kzAdvert() throws JsonParseException, JsonMappingException, IOException {
    
        //输入参数
    	DynamicForm in = Form.form().bindFromRequest();
		
		String result = KzAdvertController.controllerWeb(in.data()).toString();
    	
    	if(result.equals("")){
    		
    		return ok("");
    	}
    	
    	ObjectMapper mapper = new ObjectMapper();  
        JsonNode jsonNode=null;
        
        try{
    		jsonNode = mapper.readTree(result);
    	} catch (Exception e) {  
    		Logger.info("接口返回异常数据！"+result);
    		return ok("");
    	}
    	
    	String code = jsonNode.findPath("code").asText();
    	List<KzAdvert> list = new ArrayList<KzAdvert>();
    	
    	if(code.equals("0")){
    	
    		ObjectMapper objectMapper = new ObjectMapper(); 
    		
    		JavaType javaType = objectMapper.getTypeFactory().constructParametricType(ArrayList.class, KzAdvert.class);
    		list =  (List<KzAdvert>)objectMapper.readValue(jsonNode.path("list").asText(), javaType);
    	}
    	
		int countAll = jsonNode.findPath("countall").asInt();
    	int pageNow = jsonNode.findPath("pagenow").asInt();
    	int pageCount = jsonNode.findPath("pagecount").asInt();
    	int pageSize = jsonNode.findPath("pagesize").asInt(); 
    	String path = Play.application().configuration().getString("imageurl");
		
        return ok(kzAdvert.render(list,countAll,pageNow,pageCount,pageSize,path));
    }
    
    public static Result kzAdvertAdd() {

        return ok(kzAdvertAdd.render(""));
    }
    
    public static Result kzAdvertAddDo() {
    	
    	//输入参数
    	DynamicForm in = Form.form().bindFromRequest();
    	
//     	int type = Integer.parseInt(in.get("type"));
    	String title = in.get("title");
    	String content = in.get("editorValue");
    	
    	if(content==null){
    		content="";
    	}
    	
    	MultipartFormData body = request().body().asMultipartFormData();  
      	FilePart image = body.getFile("image");  
      	
//       	String fileName = image.getFilename();  
		String fileName = UtilsObject.getUUID();
        String contentType = image.getContentType();   
        
        SimpleDateFormat df = new SimpleDateFormat("yyyyMMdd");//设置日期格式

        String savefilename = Play.application().configuration().getString("save_advert_image_url")+df.format(new Date())+ "/" + fileName+".png";
        String getfilename = Play.application().configuration().getString("get_advert_image_url")+df.format(new Date())+ "/" + fileName+".png";
      
      	File sf = new File(savefilename);
      
      	if(!sf.getParentFile().exists()){
         	 sf.getParentFile().mkdir();//如果父文件夹不存在则创建文件夹
     	}
      
      	try { 
       		UtilsObject.copy(image.getFile(),sf);
       	}
       	catch(Exception e){
       		
       		return ok(kzAdvertAdd.render("保存图片失败,请重试！"));
       	}
     
       	KzAdvert kzAdvert = new KzAdvert();
		
		String uuid = UtilsObject.getUUID();
		Date date=new Date();
		
		content = UtilsObject.changeContentByUrl(content);
		content = UtilsObject.delHeight(content);
		content = UtilsObject.changeWidth(content);
		content = UtilsObject.delHeightStyle(content);
		content = UtilsObject.changeWidthStyle(content);
		
		try {
			kzAdvert.setUuid(uuid);
			kzAdvert.setTitle(title);
// 			kzAdvert.setType(type);
			kzAdvert.setContent(content);
			kzAdvert.setImage(getfilename);
			kzAdvert.setUrl(Play.application().configuration().getString("advert_url")+uuid);
			kzAdvert.setCreatetime(date);
			kzAdvert.setStatus(0);
			kzAdvert.setRemark("");
			kzAdvert.setSeq(KzAdvertController.querySeqNext());
			kzAdvert.save();
		}
		catch(Exception e){
			
		}
    	
        return redirect("/kzAdvert");
    }
    
    public static Result kzAdvertDetail(String uuid) {
		
		KzAdvert kzAdvert = KzAdvert.findByUuid(uuid);
		
		String path = Play.application().configuration().getString("imageurl");
		
		if(kzAdvert==null){
			
			ok(kzAdvertDetail.render(kzAdvert,"没有数据!",path));
		}
		
		String content = UtilsObject.changeUrlByContent(kzAdvert.getContent());
		
		kzAdvert.setContent(content);
		
        return ok(kzAdvertDetail.render(kzAdvert,"",path));
    }
    
    public static Result kzAdvertUpdate() {
    
    	//输入参数
    	DynamicForm in = Form.form().bindFromRequest();
    	
    	String uuid = in.get("uuid");
//     	String type = in.get("type");
    	
    	if(uuid==null||uuid.equals("")){
    		
    		return ok("没有数据！");
    	}
    	
    	String path = Play.application().configuration().getString("imageurl");
    	KzAdvert kzAdvert = KzAdvert.findByUuid(uuid);
       	
       	if(kzAdvert==null){
       		
       		ok(kzAdvertDetail.render(kzAdvert,"没有数据!",path));
       	}
    	
    	String title = in.get("title");
    	String content = in.get("editorValue");
    	
    	if(content==null){
    		content="";
    	}
    	
    	MultipartFormData body = request().body().asMultipartFormData();  
      	FilePart image = body.getFile("image");  
      	
      	String getfilename="";
      	
      	if(image!=null){
      	
//       		String fileName = image.getFilename();  
			String fileName = UtilsObject.getUUID();
        	String contentType = image.getContentType();   
        
        	SimpleDateFormat df = new SimpleDateFormat("yyyyMMdd");//设置日期格式

       		String savefilename = Play.application().configuration().getString("save_advert_image_url")+df.format(new Date())+ "/" + fileName+".png";
        	getfilename = Play.application().configuration().getString("get_advert_image_url")+df.format(new Date())+ "/" + fileName+".png";
      
      		File sf = new File(savefilename);
      
      		if(!sf.getParentFile().exists()){
         			sf.getParentFile().mkdir();//如果父文件夹不存在则创建文件夹
     		}
      
      		try { 
       			UtilsObject.copy(image.getFile(),sf);
       		}
       		catch(Exception e){
       		
       			return ok(kzAdvertDetail.render(kzAdvert,"保存图片失败,请重试！",path));
       		}
       	
       	}
		
		content = UtilsObject.changeContentByUrl(content);
		content = UtilsObject.delHeight(content);
		content = UtilsObject.changeWidth(content);
		content = UtilsObject.delHeightStyle(content);
		content = UtilsObject.changeWidthStyle(content);
		
		try {
			kzAdvert.setTitle(title);
			kzAdvert.setContent(content);
			
			if(!getfilename.equals("")){
				kzAdvert.setImage(getfilename);
			}
			kzAdvert.update();
		}
		catch(Exception e){
		
		}
    	
        return redirect("/kzAdvert");
        
    }
    
    public static Result kzAdvertDel(String uuid) {
		
		KzAdvert kzAdvert = KzAdvert.findByUuid(uuid);
		
		try{
			kzAdvert.setStatus(1);
			kzAdvert.update();
		}
		catch(Exception e){
		
		}
		
        return redirect("/kzAdvert");
    }
    
    public static Result kzAdvertMoveUp(String uuid) {

		KzAdvert kzAdvert = KzAdvert.findByUuid(uuid);
		
		int advert_seq = kzAdvert.getSeq();
		
		List<KzAdvert> list = KzAdvertController.listByIdUp(advert_seq);
		
		KzAdvert ori = new KzAdvert();
		
		try{
			
			ori = list.get(1);
		}catch(Exception e){
			return redirect("/kzAdvert");
		}
		
		int ori_seq = ori.getSeq();
	
		try{
			kzAdvert.setSeq(ori_seq);
			kzAdvert.update();
		}
		catch(Exception e){
			
		}

		try{
			ori.setSeq(advert_seq);
			ori.update();
		}
		catch(Exception e){
		
		}
		
        return redirect("/kzAdvert");
    }
    
    public static Result kzAdvertMoveDown(String uuid) {
		
		KzAdvert kzAdvert = KzAdvert.findByUuid(uuid);
		
		int advert_seq = kzAdvert.getSeq();
		
		List<KzAdvert> list = KzAdvertController.listByIdDown(advert_seq);
		
		KzAdvert ori = new KzAdvert();
		
		try{
			
			ori = list.get(1);
		}catch(Exception e){
			return redirect("/kzAdvert");
		}
		
		int ori_seq = ori.getSeq();
		
		try{
			kzAdvert.setSeq(ori_seq);
			kzAdvert.update();
		}
		catch(Exception e){
		
		}
		
		try{
			ori.setSeq(advert_seq);
			ori.update();
		}
		catch(Exception e){
		
		}
		
        return redirect("/kzAdvert");
    }
    
}
