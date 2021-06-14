package kjh.sns.manager.vo;

// TitleVO에 contents 필드를 추가한 개념
public class TitleAndContentsVO extends TitleVO {
	private String contents;
	
	public TitleAndContentsVO(String title, String contents) {
		super(title);
		this.contents = contents;
	}
	
	public TitleAndContentsVO(int id, String title, String contents) {
		super(id, title);
		this.contents = contents;
	}
	
	public String getContents() {
		return contents;
	}
}
//VO에서 ID는 주로 DB에 ID로 접근하기 전 얻어온 정보