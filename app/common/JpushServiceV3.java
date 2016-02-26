package common;

import java.util.List;

import cn.jpush.api.JPushClient;
import cn.jpush.api.common.TimeUnit;
import cn.jpush.api.common.Week;
import cn.jpush.api.common.resp.APIConnectionException;
import cn.jpush.api.common.resp.APIRequestException;
import cn.jpush.api.device.TagListResult;
import cn.jpush.api.push.PushResult;
import cn.jpush.api.push.model.Message;
import cn.jpush.api.push.model.Platform;
import cn.jpush.api.push.model.PushPayload;
import cn.jpush.api.push.model.PushPayload.Builder;
import cn.jpush.api.push.model.audience.Audience;
import cn.jpush.api.push.model.notification.Notification;
import cn.jpush.api.report.MessagesResult;
import cn.jpush.api.report.ReceivedsResult;
import cn.jpush.api.schedule.ScheduleClient;
import cn.jpush.api.schedule.ScheduleListResult;
import cn.jpush.api.schedule.ScheduleResult;
import cn.jpush.api.schedule.model.SchedulePayload;
import cn.jpush.api.schedule.model.TriggerPayload;

public class JpushServiceV3 {

	
	private final static String appKey="324ea30053859de59c209f07";
	
	private final static String masterSecret="4b04e0cbbbe8ad344fe1d03e";
	
	
	private final static String iosAppKey="e249f40c555660a7d47225df";
	
	private final static String iosMasterSecret="00f670c8454194094a5aa4a8";
	
//	private final static String appKey="09386cb96e68b0c453f51a30";
//	
//	private final static String masterSecret="b79de7794fc78ac2f6bc246a";
	
	private static JPushClient jClient=new JPushClient(masterSecret, appKey);
	
	private static JPushClient jClientIos=new JPushClient(iosMasterSecret, iosAppKey,true,86400);
	
	private static ScheduleClient sClient=new ScheduleClient(masterSecret, appKey);
	
	public static void pushMsg(String msg){
		
		
		try {
			PushResult result=  jClient.sendMessageAll(msg);
			
			System.out.println(result.getResponseCode());
			
			System.out.println(result.getOriginalContent());
			
		} catch (APIConnectionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (APIRequestException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public static void pushNotify(String alert){
		
		try {
			PushResult result=  jClient.sendNotificationAll(alert);
			
			System.out.println(result.getResponseCode());
			
			System.out.println(result.getOriginalContent());
			
		} catch (APIConnectionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (APIRequestException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	
	public  static <T extends JPushModel> String pushPayload(Audience audience,Platform platform,T o){
		PushPayload pushPayload=null;
		Builder builder= PushPayload.newBuilder();
		builder.setAudience(audience);
		
		builder.setPlatform(platform);
		if(o instanceof JMessage){
			builder.setMessage(Message.newBuilder().setMsgContent(((JMessage) o).getContent()).setTitle(((JMessage) o).getTitle()).build());
		}else if(o instanceof JNotification){
			builder.setNotification(Notification.newBuilder().setAlert(((JNotification) o).getAlert()).build());
		}
		pushPayload=builder.build();
		try {
			PushResult result= jClient.sendPush(pushPayload);
			return result.getOriginalContent();
		} catch (APIConnectionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (APIRequestException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
	
	public  static <T extends JPushModel> PushPayload getPushPayload(Audience audience,Platform platform,T o){
		
		PushPayload pushPayload=null;
		Builder builder= PushPayload.newBuilder();
		builder.setAudience(audience);
		
		builder.setPlatform(platform);
		if(o instanceof JMessage){
			builder.setMessage(Message.newBuilder().setMsgContent(((JMessage) o).getContent()).setTitle(((JMessage) o).getTitle()).build());
		}else if(o instanceof JNotification){
			builder.setNotification(Notification.newBuilder().setAlert(((JNotification) o).getAlert()).build());
		}
		pushPayload=builder.build();
		
		return pushPayload;
		
	}
	public static void scheduleReport(){
		try {
			ScheduleListResult listResult= jClient.getScheduleList();
			
			System.out.println(listResult.getOriginalContent());
		} catch (APIConnectionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (APIRequestException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public static <T extends JPushModel> void pushBySchedule(Audience audience,Platform platform,T o){
		SchedulePayload payload=null;
		cn.jpush.api.schedule.model.SchedulePayload.Builder builder= SchedulePayload.newBuilder();
		
		builder.setEnabled(true);
		
		builder.setName("我的任务");
		
		builder.setPush(getPushPayload(audience,platform,o));
		
		builder.setTrigger(TriggerPayload.newBuilder().setTimeFrequency(TimeUnit.WEEK, 1, new String[]{Week.TUE.toString(),Week.MON.toString()}).setPeriodTime("2015-10-28 12:00:00", "2015-11-28 12:00:00", "16:30:00").buildPeriodical());
		
		payload=builder.build();

		try {
			ScheduleResult result=  sClient.createSchedule(payload);
			System.out.println(result.getResponseCode());
			System.out.println(result.getOriginalContent());
			
			System.out.println(result.isResultOK());
		} catch (APIConnectionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (APIRequestException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public static void jReport(){
		try {
//			ScheduleListResult listResult= jClient.getScheduleList();
			TagListResult tagListResult= jClient.getTagList();
			List<String> tags=tagListResult.tags;
			System.out.println("tags:"+tags.size());
			for (String string : tags) {
				System.out.println("string:"+string);
			}
			
			
//			System.out.println(listResult.getOriginalContent());
		} catch (APIConnectionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (APIRequestException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public static void jReportByMsgid(String msgid){
		try {
			ReceivedsResult result= jClient.getReportReceiveds(msgid);
			
			System.out.println(result);
		} catch (APIConnectionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (APIRequestException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public  static <T extends JPushModel> String pushPayloadIos(Audience audience,Platform platform,T o){
		PushPayload pushPayload=null;
		Builder builder= PushPayload.newBuilder();
		builder.setAudience(audience);
		
		builder.setPlatform(platform);
		if(o instanceof JMessage){
			builder.setMessage(Message.newBuilder().setMsgContent(((JMessage) o).getContent()).setTitle(((JMessage) o).getTitle()).build());
		}else if(o instanceof JNotification){
			builder.setNotification(Notification.newBuilder().setAlert(((JNotification) o).getAlert()).build());
		}
		
		pushPayload=builder.build();
		try {
			
			PushResult result= jClientIos.sendPush(pushPayload);
			return result.getOriginalContent();
		} catch (APIConnectionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (APIRequestException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
	
	public static void main(String[] args) {
		JMessage msg= new JMessage();
		msg.setTitle("测试");
		msg.setContent("这样可以用么!");
//        JpushServiceV3.pushPayload(Audience.all(),Platform.all(),msg);
		JpushServiceV3.jReportByMsgid("482555225");
//		JpushServiceV3.pushBySchedule(Audience.all(),Platform.all(),msg);
		
	}
}
