package kjh.study.example;
import java.awt.*;
import javax.swing.*;
import javax.swing.border.Border;
import javax.swing.border.EtchedBorder;
import javax.swing.border.TitledBorder;

public class CustomPanel extends JPanel {

    public CustomPanel() {
    	Border lowerEtched = BorderFactory.createEtchedBorder(EtchedBorder.LOWERED);
        String titleText = "2021년 6월 26일";
        TitledBorder title = BorderFactory.createTitledBorder(lowerEtched, titleText);
    	setBorder(title);
    	
    	this.
    	
        setLayout(new GridBagLayout());
        add(new JLabel("TOP RIGHT"), new GridBagConstraints(
                0, // gridx
                0, // gridy
                1, // gridwidth
                1, // gridheight
                1, // weightx
                1, // weighty
                GridBagConstraints.NORTHEAST, // anchor <------------
                GridBagConstraints.NONE, // fill
                new Insets(0, // inset top
                0, // inset left
                0, // inset bottom
                0), // inset right
                0, // ipadx
                0)); // ipady
    }

    public static void main(String[] args) {
        JFrame frame = new JFrame();
        frame.setResizable(true);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.getContentPane().add(new CustomPanel());
        frame.setSize(400, 400);
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }
}