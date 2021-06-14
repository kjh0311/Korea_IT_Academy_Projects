package kjh.sns.manager.timeline;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.FontMetrics;
import java.awt.GridBagLayout;
import java.awt.GridLayout;
import java.awt.Rectangle;
import java.awt.event.ActionListener;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.util.Calendar;
import java.util.Vector;

import javax.swing.BorderFactory;
import javax.swing.BoxLayout;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.UIManager;
import javax.swing.border.Border;
import javax.swing.border.EtchedBorder;
import javax.swing.border.TitledBorder;

import org.json.simple.JSONObject;

import kjh.sns.manager.FacebookClawlingManager;
import kjh.sns.manager.vo.TitleAndContentsVO;
import kjh.sns.manager.vo.TitleVO;

// 생성자를 총 3가지로 해서, 두 번째 인자가 있는 경우 테두리를 추가한다.
public class TimelinePanel extends AbstractContentsPanel {
	private JLabel north_information_lable;	
	private JPanel timeline_container;
	private Vector<AbstractContentsPanel> timelinePanels;	
	
	public TimelinePanel(TimelinePanel container) { this("", container); }

	public TimelinePanel(String information, TimelinePanel container) {
		super(container);
		
		north_information_lable = new JLabel(information);
		timeline_container = new JPanel();
		timelinePanels = new Vector<AbstractContentsPanel>();
		
		setLayout(new BorderLayout());
		north_information_lable.setHorizontalAlignment((int) JLabel.CENTER_ALIGNMENT);
		add(north_information_lable, BorderLayout.NORTH);
		add(timeline_container, BorderLayout.CENTER);
		
		// 타임라인에 게시물은 세로로 정렬되게 한다.
		timeline_container.setLayout(new BoxLayout(timeline_container, BoxLayout.Y_AXIS));
	}
	
	
	// title이 있는 경우 테두리를 추가한다. (일단 멤버변수와 관련없게 작성)
	public TimelinePanel(String information, TitleVO titledVO, String tooltipText, boolean informationVisible, TimelinePanel container ) {
		this(information, container);
		
		super.setTitle(titledVO, tooltipText);
		this.addMouseListener(new MouseAdapter() {
			@Override
			public void mouseClicked(MouseEvent e) {
				super.mouseClicked(e);				
		        if (checkMouseInTitle(e)) {
//		        	System.out.println("제목 클릭함");
		        	timeline_container.setVisible(!timeline_container.isVisible());
		        } else {
//		        	System.out.println("제목이 아닌 곳을 클릭함");
		        }
			}
		});
		
		north_information_lable.setVisible(informationVisible);
	}	
	
	
	// 웹이나 DB로부터 정보를 가져와야 하므로 벡터로 받아서 한꺼번에 넣는 메서드를 만듬 
	public void setTitleVector(String information, Vector<TitleVO> titleVector) {
		for (TitleVO titledVO : titleVector) {
			addTimeline(information, titledVO);
		}
	}
	
	
	public void addContentsVector(Vector<TitleAndContentsVO> contentsVector) {
		for (TitleAndContentsVO contentsVO : contentsVector) {
			addPost(contentsVO);
		}
	}
	
	
	public void addTimeline(String information, String title) {
		TitleVO titleVO = new TitleVO(title);
		addTimeline(information, titleVO);
	}
	
	public void addTimeline(String information, TitleVO titleVO) {
		TimelinePanel newTimelinePanel = new TimelinePanel(
				information, titleVO,
				north_information_lable.getText(),
				north_information_lable.isVisible(), this);		
		timelinePanels.add(newTimelinePanel);
//		timeline_container.add(newTimelinePanel);
		timeline_container.add(newTimelinePanel, 0); // 역순
	}
	
	
	public void addPost(String title, String contents) {
		TitleAndContentsVO contentsVO = new TitleAndContentsVO(title, contents);
		addPost(contentsVO);
	}	
	
	public void addPost(TitleAndContentsVO contentsVO) {
		PostPanel newPostPanel = new PostPanel(contentsVO, this);
		
		timelinePanels.add(newPostPanel);
		timeline_container.add(newPostPanel);
	}
	
	
	public void addPost(String created_time, JSONObject jsonObject, FacebookClawlingManager facebookClawingManager) {
		String message = (String) jsonObject.get("message");
		TitleAndContentsVO contentsVO = new TitleAndContentsVO(created_time, message);
		PostPanel newPostPanel = new PostPanel(contentsVO, jsonObject, this, facebookClawingManager);
//		timelinePanels.add(newPostPanel);
//		timeline_container.add(newPostPanel);
		timelinePanels.add(newPostPanel);
		timeline_container.add(newPostPanel, 0);
	}
	
	
	public AbstractContentsPanel getLastPanel() {
		return timelinePanels.lastElement();
	}
	
	
	public TimelinePanel getLastSubTimeline() {
		return (TimelinePanel) getLastPanel();
	}


	// timelinePanels를 순회해서 titledVO 변수값을 얻어오고,
	// id가 일치하는지 조사하는 것을 '반복'해서 일치하는 패널을 리턴한다.
	public AbstractContentsPanel getSubpanelById(int id) {
		for (AbstractContentsPanel panel: timelinePanels) {
			if (panel.titleVO != null &&
				panel.titleVO.getId() == id) {
				return panel;
			}	
		}		
		return null;
	}
	
	public AbstractContentsPanel getSubpanelBySubstring(String string) {
		for (AbstractContentsPanel panel: timelinePanels) {
			if (panel.titleVO != null && 
				panel.titleVO.getTitle().contains(string)) {
				return panel;
			}
		}
		return null;
	}

	public void setInformationVisible(boolean b) {
		north_information_lable.setVisible(b);
		// vector가 null이 안 되도록 생성자에서 정의하였으므로
		// null 체크는 안 함
		for (AbstractContentsPanel panel: timelinePanels) {
			if (panel instanceof TimelinePanel) {
				((TimelinePanel) panel)
				.setInformationVisible(b);
			}
		}
	}

	public void deletePanel(AbstractContentsPanel abstractContentsPanel) {
		timeline_container.remove(abstractContentsPanel);
		timelinePanels.remove(abstractContentsPanel);
		timeline_container.revalidate();
		
		if (timelinePanels.size() == 0 && container != null) {
			container.deletePanel(this);
		}
	}	
}