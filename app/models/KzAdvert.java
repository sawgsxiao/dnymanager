package models;

import play.db.ebean.Model;

import java.io.IOException;

import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Id;
import java.util.Date;

@Entity
@Table(name="kz_advert")
public class KzAdvert extends Model{
	
	private static final long serialVersionUID = 1L;
	
    @Id
    private int id;
	
	private String uuid;
    private String title;
    private String content;
    private String image;
    private String url;
    private Date createtime;
    private int status;
    private String remark;
    
    private int seq;
    
    public KzAdvert() {

    }

    public static Finder<Integer,KzAdvert> find = new Finder<Integer,KzAdvert>(
    	Integer.class, KzAdvert.class
  	); 
  	
  	public static KzAdvert findById(int id) {
        return find.where().eq("id", id).findUnique();
    }
    
    public static KzAdvert findByUuid(String uuid) {
        return find.where().eq("uuid", uuid).findUnique();
    }
    
    public static KzAdvert findByIdAndStatus(String id) {
        return find.where().eq("id", id).eq("STATUS", 0).findUnique();
    }
    
    public static KzAdvert findByUuidAndStatus(String uuid) {
        return find.where().eq("uuid", uuid).eq("STATUS", 0).findUnique();
    }

    // Getter and Setter removed for brevity
    public int getId() {
  		return id;
	}
	
	// public void setId(int id) {
// 		this.id = id;
// 	}
	
	public String getUuid() {
  		return uuid;
	}
	
	public void setUuid(String uuid) {
		this.uuid = uuid;
	}
	
	public String getTitle() {
  		return title;
	}
	
	public void setTitle(String title) {
		this.title = title;
	}
	 
	public String getContent() {
		return content;
	}
	
	public void setContent(String content) {
		this.content = content;
	}

	public String getUrl() {
		return url;
	}
	
	public void setUrl(String url) {
		this.url = url;
	}
	
	public String getImage() {
		return image;
	}
	
	public void setImage(String image) {
		this.image = image;
	}
	 
	public Date getCreatetime() {
  		return createtime;
	}
	
	public void setCreatetime(Date createtime) {
		this.createtime = createtime;
	}
	
	public int getStatus() {
		return status;
	}
	
	public void setStatus(int status) {
		this.status = status;
	}
	
	public String getRemark() {
		return remark;
	}
	
	public void setRemark(String remark) {
		this.remark = remark;
	}
	 
	public int getSeq() {
		return seq;
	}
	
	public void setSeq(int seq) {
		this.seq = seq;
	}
}
