package kjh.sns.manager.timeline;

import java.awt.Color;
import java.awt.FontMetrics;
import java.awt.Rectangle;
import java.awt.event.MouseEvent;

import javax.swing.BorderFactory;
import javax.swing.JLayeredPane;
import javax.swing.JPanel;
import javax.swing.UIManager;
import javax.swing.border.Border;
import javax.swing.border.EtchedBorder;
import javax.swing.border.TitledBorder;

import kjh.sns.manager.vo.TitleVO;


// 기간 패널 (TimelinePanel)과 게시물 패널 (PostPanel)의 공통 기능을 모아둔 클래스
public abstract class AbstractContentsPanel extends JPanel {
	protected TitleVO titleVO;
	
	protected TimelinePanel container;
	
	protected AbstractContentsPanel(TimelinePanel container) {
		super();
		this.container = container;
	}
	
	protected AbstractContentsPanel(String title, TimelinePanel container) {
		this(container);
		setTitle(title);
	}
	
	protected AbstractContentsPanel(TitleVO titleVO, TimelinePanel container) {
		this(container);
		setTitle(titleVO);
	}
	
	protected void setTitle(String title) {		
		UIManager.getDefaults().put("TitledBorder.titleColor", Color.BLACK);
		Border lowerEtched = BorderFactory.createEtchedBorder(EtchedBorder.LOWERED);
		TitledBorder titleBorder = BorderFactory.createTitledBorder(title);
		this.setBorder( titleBorder );
	}
	
	protected void setTitle(TitleVO titleVO) {
		this.titleVO = titleVO;		
		UIManager.getDefaults().put("TitledBorder.titleColor", Color.BLACK);
		Border lowerEtched = BorderFactory.createEtchedBorder(EtchedBorder.LOWERED);
//		TitledBorder titleBorder = BorderFactory.createTitledBorder(title);
		TitledBorder titleBorder = BorderFactory.createTitledBorder(lowerEtched, titleVO.getTitle());
		this.setBorder( titleBorder );
	}
	
	protected void setTitle(TitleVO titleVO, String tooltipText) {
		setTitle(titleVO);
		setToolTipText(tooltipText);
	}
	
	
	// 제목에 닿아야지만 툴팁이 발생하게끔 오버라이드
    @Override
    public String getToolTipText(MouseEvent e) {
//        Border border = getBorder();
//        if (border instanceof TitledBorder) {
//            TitledBorder tb = (TitledBorder)border;
//            FontMetrics fm = getFontMetrics( getFont() );
//            int titleWidth = fm.stringWidth(tb.getTitle()) + 20;
//            Rectangle bounds = new Rectangle(0, 0, titleWidth, fm.getHeight());
//            return bounds.contains(e.getPoint()) ? super.getToolTipText() : null;
//        } else {
//        	return super.getToolTipText(e);
//        }
    	return checkMouseInTitle(e) ? super.getToolTipText() : null;
    }
    
    
    protected boolean checkMouseInTitle(MouseEvent e) {
    	Border border = getBorder();
        if (border instanceof TitledBorder) {
            TitledBorder tb = (TitledBorder)border;
            FontMetrics fm = getFontMetrics( getFont() );
            int titleWidth = fm.stringWidth(tb.getTitle()) + 20;
            Rectangle bounds = new Rectangle(0, 0, titleWidth, fm.getHeight());
            
            if (bounds.contains(e.getPoint())) {
            	return true;
            }            
        }        
        return false;        
    }
}
