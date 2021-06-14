package kjh.sns.manager.vo;


//DB나 HTTP 요청으로 부터 얻어온 정보를 담아서 화면에 보여줄 목적의 VO
public class TitleVO {
	protected static int idCount = 0;
	protected int id;
	protected String title;
	
	public TitleVO(String title) {
		this.id = idCount;
		this.title = title;
		idCount++;
	}
	
	public TitleVO(int id, String title) {
		this.id = id;
		this.title = title;
	}

	public int getId() {
		return id;
	}

	public String getTitle() {
		return title;
	}
}