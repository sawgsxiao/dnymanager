package common;

public class JNotification implements JPushModel{

	private String alert;
	
	public JNotification() {
		// TODO Auto-generated constructor stub
	}

	public JNotification(String alert) {
		this.alert = alert;
	}

	public String getAlert() {
		return alert;
	}

	public void setAlert(String alert) {
		this.alert = alert;
	}
	
	
}
