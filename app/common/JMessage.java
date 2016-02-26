package common;

public class JMessage implements JPushModel{

	private String title;

	private String content;
	
	public JMessage() {
		// TODO Auto-generated constructor stub
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}
	
	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public JMessage(String title, String content) {
		this.title = title;
		this.content = content;
	}


	
	
}
