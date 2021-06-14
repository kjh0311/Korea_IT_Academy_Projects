package kjh.study.example;
import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.Container;

import javax.swing.DefaultListCellRenderer;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JList;
import javax.swing.JScrollPane;
import javax.swing.ListCellRenderer;
import javax.swing.border.Border;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import javax.swing.border.TitledBorder;

public class CustomBorderSample {
  public static void main(String args[]) {
    String labels[] = { "A", "B", "C", "D","E", "F", "G", "H","I", "J" };
    
    
    JFrame frame = new JFrame("Custom Border");
    frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    Container contentPane = frame.getContentPane();    
    
    JList jlist = new JList(labels);    
    
    ListCellRenderer renderer = new FocusedTitleListCellRenderer();    
    jlist.setCellRenderer(renderer);
    
    JScrollPane sp = new JScrollPane(jlist);    
    contentPane.add(sp, BorderLayout.CENTER);
    
    frame.setSize(300, 200);
    frame.setVisible(true);
  }
}


class FocusedTitleListCellRenderer implements ListCellRenderer {
	
  protected static Border noFocusBorder = new EmptyBorder(15, 1, 1, 1);

  protected static TitledBorder focusBorder = new TitledBorder(LineBorder
      .createGrayLineBorder(), "Focused");

  protected DefaultListCellRenderer defaultRenderer = new DefaultListCellRenderer();

  public String getTitle() {
    return focusBorder.getTitle();
  }

  public void setTitle(String newValue) {
    focusBorder.setTitle(newValue);
  }
  

  public Component getListCellRendererComponent(JList list, Object value,
      int index, boolean isSelected, boolean cellHasFocused) {
    JLabel renderer = (JLabel) defaultRenderer
        .getListCellRendererComponent(list, value, index, isSelected,
            cellHasFocused);
//    renderer.setBorder(cellHasFocused ? focusBorder : noFocusBorder);
    renderer.setBorder(cellHasFocused ? focusBorder : focusBorder);
    return renderer;
  }
  
  
}



