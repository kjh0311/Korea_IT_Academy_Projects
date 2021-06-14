package kjh.sns.manager;
import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.GridLayout;
import java.awt.Label;
import java.awt.TextField;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTextField;


public class LoginWindow extends JFrame {	
	
	LoginForm loginForm;
	
	LoginWindow () {
		setTitle("로그인");
		setDefaultCloseOperation ( EXIT_ON_CLOSE );
		setBounds(900, 600, 260, 150);
		setVisible(true);
		// 여기서 btnLogin, idField
		loginForm = new LoginForm(this);
	}
	
	class LoginForm {
		LoginWindow mainFrame;
		JButton btnLogin;
		JTextField idField, pwField;
		
		public LoginForm(LoginWindow snsManagerMain) {
			mainFrame = snsManagerMain;
			
			JPanel pLogin = new JPanel();
			JPanel pIdPw = new JPanel();
			
			JPanel pId = new JPanel();
			JPanel pPw = new JPanel();
			
			
			mainFrame.add(pLogin, BorderLayout.NORTH);
			mainFrame.add(pIdPw, BorderLayout.CENTER);
			
			pIdPw.setLayout(new BorderLayout());
			pIdPw.add(pId, BorderLayout.NORTH);
			pIdPw.add(pPw, BorderLayout.CENTER);
			
			
			JButton btnLogin = new JButton("로그인");
			pLogin.add(btnLogin);
			pLogin.setPreferredSize(new Dimension(200, 35));
			btnLogin.setVerticalAlignment(JButton.CENTER);

			
			JLabel la_id = new JLabel("ID");
			this.idField = new JTextField(15);
			JLabel la_pw = new JLabel("PW");
			this.pwField = new JTextField(15);
			
			la_id.setPreferredSize(new Dimension(30, 20));
			la_pw.setPreferredSize(new Dimension(30, 20));
			
			pId.add(la_id);
			pId.add(idField);
			pPw.add(la_pw);
			pPw.add(pwField);
			
			mainFrame.setMinimumSize(new Dimension(250, 145));
			mainFrame.revalidate();
		}
	}
	

	
	// 6월 3일 오후 2시 20분: 창 만들기 까지 시행함 (그럴 듯해보임)
	
	// 이젠 어려운 것을 할 차례:
	// 로그인 (이것을 소셜 로그인이라고 일컬음)
	
	// 로그인 기능 구현
	// 1. 로그인 버튼 필요 (로그인 버튼 옆에 아이콘 필요)
	// 2. 첫 로그인 시 로그인 화면에 필요하고, ID와 PW를 저장해야함
	// 3. ID, PW는 JSON 파일 형태로 저장
	//    (프로젝트 초기에는 서버 운영을 하지는 않음.
	//	  만약 서버 운영을 하면 그 때 DB 연동을 함)

	// 오후 4시 6분까지 로그인 버튼까지 완성
	// 로그인 폼은 배웠던 거 많이 활용함
	// 차이점은 나는 DB 연동이 아닌,
	// 소셜 연동이라는,
	// 독특한 방법을 사용한다는 점임.
	
	public static void main(String[] args) {
		new LoginWindow();
	}
}
