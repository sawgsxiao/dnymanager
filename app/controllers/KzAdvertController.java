package controllers;

import play.*;
import play.api.libs.ws.Response;
import play.api.libs.ws.WS;
import play.db.ebean.Model;
import play.libs.Json;
import play.mvc.*;
import play.data.DynamicForm;
import scala.concurrent.Await;
import scala.concurrent.Future;
import scala.concurrent.duration.Duration;
import com.avaje.ebean.*;

import play.libs.Json;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.ObjectMapper;  
import com.fasterxml.jackson.databind.JsonMappingException;  
import com.fasterxml.jackson.core.JsonParseException;  
import java.io.IOException;

import common.*;
import models.*;

import java.util.Date;
import java.text.SimpleDateFormat;
import java.util.Map;
import java.io.File;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.TimeUnit;

public class KzAdvertController extends Controller{
	
	//查询-列表-显示全部
    public static ObjectNode controller(Map in) throws JsonParseException, JsonMappingException, IOException{
		
		ObjectNode resultJson = Json.newObject();
		
		List<KzAdvert> list = KzAdvertController.listAll(in);
      	
		ObjectMapper listMapper = new ObjectMapper(); 
		
		if(list.size()==0){
			
			resultJson.put("code", "1");
			resultJson.put("msg", "没有数据！");
			return resultJson;
		}
		
		ArrayNode arrayList = listMapper.createArrayNode();    
		
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

		for (KzAdvert kzAdvert : list) {  

    		String createtimeStr="";
       		try{
       			createtimeStr = format.format(kzAdvert.getCreatetime());
       		}catch (Exception e) {
			}
						
    		ObjectNode obj= Json.newObject();
			
			obj.put("uuid", kzAdvert.getUuid());
       		obj.put("title", kzAdvert.getTitle());
//        		obj.put("content", kzAdvert.getContent());
       		obj.put("image", Play.application().configuration().getString("imageurl")+kzAdvert.getImage());
       		obj.put("url", Play.application().configuration().getString("serverurl")+kzAdvert.getUrl());
       		obj.put("createtime", createtimeStr);
       		obj.put("status", kzAdvert.getStatus());
       		obj.put("remark", kzAdvert.getRemark());
       		
       		arrayList.add(obj);
		}

      	resultJson.put("code", "0");
      	resultJson.put("list", arrayList);
      	resultJson.put("msg", "查询数据成功！");

        return resultJson;
    }
    
    //查询-列表
    public static ObjectNode controllerWeb(Map in) throws JsonParseException, JsonMappingException, IOException{
		
		ObjectNode resultJson = Json.newObject();
		
		String pageSizeIn = (String)in.get("pagesize");
		
		//每页显示数据
		int pageSize = 0;
		
		if(pageSizeIn==null||pageSizeIn.equals("")){
			
			pageSize = Integer.parseInt(Play.application().configuration().getString("pagesize"));
		}else{
			
			pageSize = Integer.parseInt(pageSizeIn);
		}
		
		//当前第N页
		int pageNow = 1;
		
		String pageNowIn = (String)in.get("pagenow");
		if(pageNowIn!=null&&!pageNowIn.equals("0")){
		
			pageNow = Integer.parseInt(pageNowIn);
		}
		
		List<KzAdvert> list =KzAdvertController.list(in,pageSize,pageNow);
		//总页数
		int countAll = KzAdvertController.count(in);
		
		//第N页
		int pageCount = 0;
		
		if (countAll % pageSize == 0) {
       		pageCount = countAll / pageSize;
      	} else {
       		pageCount = countAll / pageSize + 1;
      	}
      	
		ObjectMapper listMapper = new ObjectMapper();   
		
      	resultJson.put("code", "0");
      	resultJson.put("list", listMapper.writeValueAsString(list));
      	resultJson.put("countall", countAll);
      	resultJson.put("pagenow", pageNow);
      	resultJson.put("pagecount", pageCount);
      	resultJson.put("pagesize", pageSize);
      	resultJson.put("msg", "查询数据成功！");

        return resultJson;
    }
    
    /**
	 *	查询查询-分页
	 **/
    public static List<KzAdvert> list(Map in,int pageSize,int pageNow){
		
		StringBuffer buf = new StringBuffer(); 
		
		buf.append(" and status = 0 ");
// 		buf.append(" and type = " +type);
		
    	int start=(pageNow-1)*pageSize;

		//sql语句       
	 	String sql = "select id from kz_advert where 1=1 "+buf.toString()+" order by seq desc "+" limit " +(start)+" , "+(pageSize);  

  		RawSql rawSql = RawSqlBuilder.unparsed(sql)
  		.columnMapping("id",  "id")
  		.create();
  		
  		Query<KzAdvert> eQ = Ebean.find(KzAdvert.class);
  		eQ.setRawSql(rawSql);
  		
  		List<KzAdvert> list = eQ.findList();
		
		return list;
    }
    
    /**
     *  查询列表总数量
     **/
    public static int count(Map in){
		
		StringBuffer buf = new StringBuffer(); 
		
		buf.append(" and status = 0 ");
// 		buf.append(" and type = " +type);
		
     	String sql = "select count(id) as count from kz_advert where 1=1 "+buf.toString();
        SqlRow row = Ebean.createSqlQuery(sql).findUnique(); 
        
        int i = row.getInteger("count");  
       	
     	return i;
    }
    
    /**
     *  查询seq排序字段最大值+1
     **/
    public static int querySeqNext(){
		
		StringBuffer buf = new StringBuffer(); 
		
		buf.append(" and status = 0 ");
// 		buf.append(" and type = " +type);
		
     	String sql = "select max(seq) as count from kz_advert where 1=1 "+buf.toString();

        SqlRow row = Ebean.createSqlQuery(sql).findUnique(); 
        
        int i = 1;
        
        try{
        	i = row.getInteger("count")+1;  
        }catch(Exception e){
        
        }
       
     	return i;
    }
    
    /**
	 *	查询查询-分页-总量
	 **/
    public static List<KzAdvert> listAll(Map in){
		
		StringBuffer buf = new StringBuffer(); 
		
		buf.append(" and status = 0 ");
// 		buf.append(" and type = " +type);

		//sql语句       
	 	String sql = "select id from kz_advert where 1=1 "+buf.toString()+" order by seq desc ";  

  		RawSql rawSql = RawSqlBuilder.unparsed(sql)
  		.columnMapping("id",  "id")
  		.create();
  		
  		Query<KzAdvert> eQ = Ebean.find(KzAdvert.class);
  		eQ.setRawSql(rawSql);
  		
  		List<KzAdvert> list = eQ.findList();
		
		return list;
    }
    
    /**
	 *	上移-查询两条数据进行互换
	 **/
    public static List<KzAdvert> listByIdUp(int seq){
		
		StringBuffer buf = new StringBuffer(); 
		
		buf.append(" and status = 0 ");
		buf.append(" and seq >= " + seq);

		//sql语句       
	 	String sql = "select id from kz_advert where 1=1 "+buf.toString()+" order by seq limit 0,2 ";  

  		RawSql rawSql = RawSqlBuilder.unparsed(sql)
  		.columnMapping("id",  "id")
  		.create();
  		
  		Query<KzAdvert> eQ = Ebean.find(KzAdvert.class);
  		eQ.setRawSql(rawSql);
  		
  		List<KzAdvert> list = eQ.findList();
		
		return list;
    }
    
     /**
	 *	下移-查询两条数据进行互换
	 **/
    public static List<KzAdvert> listByIdDown(int seq){
		
		StringBuffer buf = new StringBuffer(); 
		
		buf.append(" and status = 0 ");
		buf.append(" and seq <= " + seq);

		//sql语句       
	 	String sql = "select id from kz_advert where 1=1 "+buf.toString()+" order by seq desc limit 0,2 ";  

  		RawSql rawSql = RawSqlBuilder.unparsed(sql)
  		.columnMapping("id",  "id")
  		.create();
  		
  		Query<KzAdvert> eQ = Ebean.find(KzAdvert.class);
  		eQ.setRawSql(rawSql);
  		
  		List<KzAdvert> list = eQ.findList();
		
		return list;
    }
    
	/**
     *  查询单个数据-详情
     **/
     public static ObjectNode findById(Map in) throws JsonParseException, JsonMappingException, IOException{
     	
     	ObjectNode resultJson = Json.newObject();
     	
     	String uuid = (String)in.get("uuid");
    		
    	if(uuid==null||uuid.equals("")){
			resultJson.put("code", "1");
    		resultJson.put("msg", "参数错误!");
    		return resultJson;
		}
				
     	KzAdvert kzAdvert = KzAdvert.findByUuid(uuid);;
     	
     	if(kzAdvert==null){
     		
     		resultJson.put("code", "-1");
     		resultJson.put("msg", "没有数据！");
     		return resultJson;
     	}
     	
     	ObjectMapper objMapper = new ObjectMapper(); 
     	
     	resultJson.put("code", "0");
     	resultJson.put("datas", kzAdvert==null?null:objMapper.writeValueAsString(kzAdvert));
     	resultJson.put("msg", "获取数据成功！");
     	
     	return resultJson;
     }
     
}
