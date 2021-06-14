package kjh.sns.manager.timeline;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.Calendar;
import java.util.Locale;

import javax.swing.JButton;
import javax.swing.JLayeredPane;
import javax.swing.JPanel;
import javax.swing.JTextArea;
import javax.swing.OverlayLayout;

import org.json.simple.JSONObject;

import kjh.sns.manager.FacebookClawlingManager;
import kjh.sns.manager.vo.TitleAndContentsVO;

public class PostPanel extends AbstractContentsPanel {
	TitleAndContentsVO contentsVO;
	JSONObject jsonObject;
	PostPanel me;
	
	JPanel normalToolbar;
	JPanel editToolbar;
	
	JButton btnSave, btnEdit, btnDelete, btnCancel;
	
	JTextArea textArea;
	
	// 새 게시물 작성모드일 때 메인 객체를 사용함
	FacebookClawlingManager facebookClawlingManager;
	boolean newPostMode;
	
	
	public PostPanel(TitleAndContentsVO contentsVO, TimelinePanel container) {
		super(contentsVO, container);
		this.contentsVO = contentsVO;
		this.container = container;
		this.me = this;
		
		normalToolbar = new JPanel();
		editToolbar = new JPanel();
		
		btnSave = new JButton("저장");
		btnEdit = new JButton("수정");
		btnDelete = new JButton("삭제");
		btnCancel = new JButton("취소");
		
		textArea = new JTextArea(contentsVO.getContents());		
		
		normalToolbar.setLayout(new FlowLayout(FlowLayout.RIGHT));
		normalToolbar.add(btnDelete);
		normalToolbar.add(btnEdit);
		
		editToolbar.setLayout(new FlowLayout(FlowLayout.RIGHT));
		editToolbar.add(btnCancel);
		editToolbar.add(btnSave);
		
		setLayout(new BorderLayout());
		add(textArea);
		
		setToNormalMode();
		this.setMinimumSize(new Dimension(500, 500));
		revalidate();
		
		
		btnEdit.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				setToEditMode();
			}
		});
		
		
		btnSave.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				setToNormalMode();
				if (facebookClawlingManager != null) {
					if (newPostMode) {
						// 새 포스트 작성 시
						// 지우고 facebookClawingManager가						
						fillJsonObject(jsonObject);
						facebookClawlingManager.saveNewPost(jsonObject);
						// 데이터를 저장하면서 다시 생성함
						container.deletePanel(me);
					} else {
						// 게시물 수정 시
					}
				}
				
			}
		});		
		
		btnCancel.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				setToNormalMode();
				textArea.setText(contentsVO.getContents());
			}
		});		
		
		btnDelete.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				container.deletePanel(me);
			}
		});
	}

	// Calendar와 JSONObject를 받아서 VO를 생성
	public PostPanel(
			TitleAndContentsVO contentsVO,
			JSONObject jsonObject,
			TimelinePanel container,
			FacebookClawlingManager facebookClawlingManager) {
		this(contentsVO, container);
		this.jsonObject = jsonObject;
		this.facebookClawlingManager = facebookClawlingManager;
	}

	public void setNewPostMode() {
		super.setTitle("새 게시물 작성칸");		
		setToEditMode();
		btnCancel.setVisible(false);		
		this.newPostMode = true;
//		setVisible(true);
	}

	private void setToEditMode() {
		textArea.setEditable(true);
		remove(normalToolbar);
		add(editToolbar, BorderLayout.NORTH);
		normalToolbar.setVisible(false);
		editToolbar.setVisible(true);
		revalidate();
	}
	
	
	private void setToNormalMode() {
		textArea.setEditable(false);
		remove(editToolbar);
		add(normalToolbar, BorderLayout.NORTH);
		normalToolbar.setVisible(true);
		editToolbar.setVisible(false);
		revalidate();
	}
	
	
	private void fillJsonObject(JSONObject jsonObject) {
		jsonObject.put("message", textArea.getText());
	}
	
	
	private void saveNewPost() {
		String am_pm_texts[] = { "오전", "오후" };
		Calendar calendar = Calendar.getInstance(Locale.KOREA);
		int am_pm, hour, minute;
		
		am_pm = calendar.get(Calendar.AM_PM);
    	hour = calendar.get(Calendar.HOUR);
    	minute = calendar.get(Calendar.MINUTE);
		
    	String timeFormat = "%s %d시 %d분";
    	String timeTitle = String.format(timeFormat, am_pm_texts[am_pm], hour, minute);
    	
    	setTitle(timeTitle);
	}
}


//setLayout(new OverlayLayout(this));
//add(normalToolbar);


//normalToolbar.setPreferredSize(new Dimension(500, 20));
//textArea.setPreferredSize(new Dimension(500, 200));		
//add(normalToolbar, new Integer(1), 0);
//add(textArea, new Integer(0), 0);

//setVisible(false);
