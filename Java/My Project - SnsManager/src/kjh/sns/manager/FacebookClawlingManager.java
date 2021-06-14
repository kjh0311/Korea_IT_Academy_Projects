package kjh.sns.manager;
import java.awt.BorderLayout;
import java.awt.event.ItemEvent;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Locale;
import java.util.Map.Entry;
import java.util.Properties;
import java.util.TimeZone;
import java.util.Vector;

import javax.net.ssl.HttpsURLConnection;
import javax.swing.JCheckBox;
import javax.swing.JFrame;
import javax.swing.JScrollPane;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import kjh.sns.manager.timeline.PostPanel;
import kjh.sns.manager.timeline.TimelinePanel;
import kjh.sns.manager.vo.DateVO;
import kjh.sns.manager.vo.TitleAndContentsVO;
import kjh.sns.manager.vo.TitleVO;

/*
 * UI 구현 절차
 * 
 * 1. 북쪽에 설명, 센터에 내용
 * 2. 설명은 생략 가능
 * 3. 설명 내용: 연도/월/일을 클릭하면 해당 시기의 게시물을 숨길 수 있습니다. 
 * 4. 설명 표시/숨기기 레이블은 맨 밑에 두고, 링크처럼 파란 글씨에 밑 줄이 있으면 좋을 듯
 * 5. 1~4의 내용은 JPanel을 extends해서 구현한다.
 *    (클래스 이름은 TimelinePanel 정도로 하면 될 듯)
 * 6. 레이아웃 구성은 JFrame 안에 JScrollPane, 그 안에 TimelinePanel을 넣고,
 *    TimelinePanel 안에 여러개의 TimelinePanel이 들어갈 수 있게한다. 
*/

public class FacebookClawlingManager extends JFrame {
	
	private static final String
		configFileName = "config.properties",
		configInformationHide = "hide-information",
		configInformationHideComment = "Hide information",
		informationHide = "설명 숨기기",
		informationYear = "연도를 클릭하여 해당 연도의 게시물을 보거나 숨길 수 있습니다.",
		informationMonth = "월을 클릭하여 해당 월의 게시물을 보거나 숨길 수 있습니다.",
		informationWeek = "주간 게시물을 보거나 숨길 수 있습니다.",
		informationDay = "특정 날짜의 게시물을 보거나 숨길 수 있습니다.",
		informationPost = "특정 게시물을 보거나 숨길 수 있습니다.";
		
	private static final String
		API_URL = "https://graph.facebook.com/";
	
	private static final SimpleDateFormat timeFormatter = 
			new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
	
	
	private static final String access_token = "EAA4fBMfF3E0BAMvmYgZA3REgg8FQAvbNGbLFFuEgAzcRPMGCqHAkroS9PCZAqIZB8PxYMCNM7ZAy7dycGdfhZCQHJm4k7cQp19Q4SbyW2NDzQaZAoNdgfz8GngHp3eYh3f1H6AWHUSqGs1iWn9Vv8Vv2dRDDZAYJz4wLRz5ujsD32khrkiASZBC0";
	private static final String getPostUri = API_URL + "me/posts?access_token="+access_token;
//	private static final String getPostUri = API_URL + "109243094715083/posts?access_token="+access_token;
	private static final String postCreateUri = API_URL + "me/feed";
	
	
	
	// 분석중인 날짜를 기록함 (값이 바뀔 때마다 객체 생성)
	// 생성 시 모든 int형 멤버변수 값은 0
	DateVO prevDate = new DateVO();
	
	TimelinePanel yearPanel, monthPanel, weekPanel, dayPanel;	
	
	private Properties prop;
	private JScrollPane scrollPane;
	private TimelinePanel timelinePanel;
	private JCheckBox chkInformationHide;
	
	
	public static void main(String[] args) throws FileNotFoundException, IOException {
		new FacebookClawlingManager();
	}
	
	FacebookClawlingManager() throws FileNotFoundException, IOException {
		File propertiesFile = new File(configFileName);
		
		prop = new Properties();
		timelinePanel = new TimelinePanel(informationYear, null);
		scrollPane = new JScrollPane(timelinePanel);
		chkInformationHide = new JCheckBox(informationHide);		
		
		
		if (propertiesFile.exists()) {
			prop.load(new FileReader(configFileName));
			String hideInformationString = prop.getProperty(configInformationHide, false+"");
			
			boolean hideInformation = Boolean.parseBoolean(hideInformationString);
			chkInformationHide.setSelected(hideInformation);
			timelinePanel.setInformationVisible(!hideInformation);
			timelinePanel.revalidate();
		} else {
			propertiesFile.createNewFile();
		}
		
		
		setTitle("페이스북 크롤링");
		setDefaultCloseOperation ( EXIT_ON_CLOSE );
		setBounds(800, 550, 800, 640);
		setVisible(true);
				
		
		chkInformationHide.setHorizontalAlignment(JCheckBox.RIGHT);
		
		// 체크 해제시 설명 보여주기
		chkInformationHide.addItemListener((event)->{
			
			boolean informationHide = event.getStateChange() == ItemEvent.SELECTED;			
			timelinePanel.setInformationVisible(!informationHide);
			
			prop.setProperty(configInformationHide, informationHide+"");			
			try {
				prop.store(new FileWriter(configFileName), configInformationHideComment);
			} catch (IOException e) {
				e.printStackTrace();
			}
		});
		
		
		add(chkInformationHide, BorderLayout.NORTH);
		add(scrollPane);
		
		
		// 아래서부터는 기능 확인 테스트 코드
//		String id = "100069089655857";
//		String target = "me/posts";
//		String target = "me/posts?fields=id,attachments,message,picture,link,name,caption,description";
//		String target = id + "/feed";
//		String target = "me";
//		String access_token = "EAA4fBMfF3E0BAMvmYgZA3REgg8FQAvbNGbLFFuEgAzcRPMGCqHAkroS9PCZAqIZB8PxYMCNM7ZAy7dycGdfhZCQHJm4k7cQp19Q4SbyW2NDzQaZAoNdgfz8GngHp3eYh3f1H6AWHUSqGs1iWn9Vv8Vv2dRDDZAYJz4wLRz5ujsD32khrkiASZBC0";
//		String requestUrl = API_URL + target +
//			"?access_token=" + access_token;
//			"&access_token=" + access_token;
		
		String response = requestGet(getPostUri);
        String converted = convertString(response);
        System.out.println("converted: " + converted);
        // 여기까지 리퀘스트 얻어오는 거
        
        // 제이슨 분석하기
        // 1. 제이슨 분석기 객체 생성
        JSONParser jsonParser=new JSONParser();
        try {
            // 2. parse 메서드로 제이슨 오브젝트 얻어오기
        	JSONObject packet=(JSONObject)jsonParser.parse(converted);
//        	System.out.println(packet.toString());
            // 3. get 메서드로 내부 제이슨 오브젝트 얻어오기
        	// get 메서드 반환 결과 인스턴스는 내용물에 근거해서 나타남
        	JSONArray data = (JSONArray) packet.get("data");
        	System.out.println(data.toString());
        	
        	// 마지막 원소는 생일 정보이므로 삭제
        	data.remove(data.size() - 1);        	
//        	dataToHashMap(data);
        	
        	dataToTimeline(data);
        } catch (ParseException e) {
			e.printStackTrace();
		}
        
        // 게시물 칸 생성
        createNewPostSlot();
//		testLayout();		
	}
	
	
	
	private String requestGet(String requestUrl) throws MalformedURLException, ProtocolException, UnsupportedEncodingException, IOException {
		return request(requestUrl, "GET", null);
	}
	

	private String request(String requestUrl, String method, HashMap<String, String> dataParams)
			throws MalformedURLException, IOException, ProtocolException, UnsupportedEncodingException {
		URL url = new URL(requestUrl);
		HttpURLConnection connection = (HttpURLConnection) url.openConnection();		
		
//		connection.setRequestMethod("GET");
		connection.setRequestMethod(method);
		connection.setDoInput(true);
		connection.setDoOutput(true);
		
		System.out.println(connection.getRequestMethod());
		if (connection.getRequestMethod().equals("POST")) {
	        OutputStream os = connection.getOutputStream();
	        BufferedWriter writer = new BufferedWriter(
	                new OutputStreamWriter(os, "UTF-8"));
	        writer.write(getPostDataString(dataParams));

	        writer.flush();
	        writer.close();
	        os.close();
		}
		int responseCode = connection.getResponseCode();
//		String contentType = connection.getContentType();
//		System.out.println(contentType);
		System.out.println("responseCode: " + responseCode);
		String response = "";
		if (responseCode == HttpsURLConnection.HTTP_OK) {
	        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(connection.getInputStream(), "UTF-8"));
	        StringBuffer stringBuffer = new StringBuffer();
	        String inputLine;

	        while ((inputLine = bufferedReader.readLine()) != null)  {
	            stringBuffer.append(inputLine);
	        }
	        bufferedReader.close();
	        response = stringBuffer.toString();
		}
		return response;
	}
	
	
	private String getPostDataString(HashMap<String, String> params) throws UnsupportedEncodingException{
        StringBuilder result = new StringBuilder();
        
        boolean first = true;
        for(Entry<String, String> entry : params.entrySet()){
            if (first)
                first = false;
            else
                result.append("&");

            result.append(URLEncoder.encode(entry.getKey(), "UTF-8"));
            result.append("=");
            result.append(URLEncoder.encode(entry.getValue(), "UTF-8"));
        }

        return result.toString();
    }
	
	
	// 포스트에서 게시물 저장 버튼을 누를 때 실행되는 메서드
	public void saveNewPost(JSONObject jsonObject) {
		JSONArray data = new JSONArray();
		JSONObject newPost = createNewPostObject();
		data.add(newPost);
		
		String messageKey = "message";
		String messageValue = (String) jsonObject.get(messageKey);
		
		// newPost에 jsonObject 내용 병합
		newPost.put(messageKey, messageValue);
		
		HashMap<String, String> params = new HashMap<String, String>();
		
		params.put(messageKey, messageValue);
		params.put("access_token", access_token);
		
//		try {
//			String response = request(postCreateUri, "POST", params);
//		} catch (IOException e) {
//			e.printStackTrace();
//		}
		
		
		// 아래 메서드는 UI와 멤버변수를 대폭 수정함 
		dataToTimeline(data);
		
		// 빈 칸 추가
		createNewPostSlot();
	}
	
	
	public void createNewPostSlot() {
		JSONArray data = new JSONArray();
		JSONObject newPost = createNewPostObject();
		data.add(newPost);
		
		// 아래 메서드는 UI와 멤버변수를 대폭 수정함 
		dataToTimeline(data);
		
		// timelinePanel이 최상단
    	yearPanel = (TimelinePanel) timelinePanel.getLastPanel();
    	monthPanel = (TimelinePanel) yearPanel.getLastPanel();
    	weekPanel = (TimelinePanel) monthPanel.getLastPanel();
    	dayPanel = (TimelinePanel) weekPanel.getLastPanel();    	
    	PostPanel newPostPanel = (PostPanel) dayPanel.getLastPanel();
    	newPostPanel.setNewPostMode();
	}
	
	
	private JSONObject createNewPostObject() {
		JSONObject newPost = new JSONObject();
    	
    	Date now = new Date();
        TimeZone.setDefault( TimeZone.getTimeZone("UTC"));
//        System.out.println(now);        	
        timeFormatter.setTimeZone(TimeZone.getTimeZone("UTC"));
    	String utcTime = timeFormatter.format(now) + "+0000";
//    	System.out.println("UTC time: " + utcTime);
    	
    	timeFormatter.setTimeZone(TimeZone.getTimeZone("Asia/Seoul"));
    	TimeZone.setDefault( TimeZone.getTimeZone("Asia/Seoul"));
    	
    	newPost.put("created_time", utcTime);
    	newPost.put("message", "");
    	newPost.put("id", "");
    	
    	return newPost;
	}	
	
	private void dataToTimeline(JSONArray data) {
		
		String am_pm_texts[] = { "오전", "오후" };
        
        // 다음은 게시물 당 날짜를 기록하는 변수
        DateVO date = new DateVO();
        // 현재 날짜를 기록
//        DateVO nowDate = new DateVO();
        int am_pm, hour, minute;
//        setToNowDate(nowDate);
        
//        for (Object obj : data) {
        for (int i = data.size()-1; i >= 0 ; i--) {
        	JSONObject jsonObject = (JSONObject) data.get(i);
//        	System.out.println(jsonObject);            	
        	
        	String created_time = (String) jsonObject.get("created_time");
        	System.out.println(created_time);
//        	Calendar calendar = setDate(date, created_time);
        	
//        	TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
    		// 타임존 로케일 설정        	
//        	Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("GMT"), Locale.KOREA);
        	Calendar calendar = Calendar.getInstance(Locale.KOREA);
        	if (created_time != null) {
        		try {
//        			timeFormatter.setTimeZone(TimeZone.getTimeZone("UTC"));
        			created_time = convertUtcToLocal(created_time);
        			calendar.setTime(timeFormatter.parse(created_time));
        		} catch (java.text.ParseException e) {
        			e.printStackTrace();
        		}
        	}
        	
        	// 한국 시간으로 변환
//        	calendar.setTimeZone(TimeZone.getTimeZone("Asia/Seoul"));
//        	calendar.setTimeZone(TimeZone.getTimeZone("GMT"));
        	// month 값은 + 1을 붙혀야함 
        	date.year = calendar.get(Calendar.YEAR);
        	date.month = calendar.get(Calendar.MONTH) + 1;
        	date.week = calendar.get(Calendar.WEEK_OF_MONTH);
        	date.day = calendar.get(Calendar.DATE);        	
        	
        	am_pm = calendar.get(Calendar.AM_PM);
        	hour = calendar.get(Calendar.HOUR);
        	minute = calendar.get(Calendar.MINUTE);
//        	System.out.println("변환이후 - am_pm: " + am_pm + ", hour: " + hour + ", minute: " + minute);
//        	System.out.println(date);
        	
        	if ( !date.dayEquals(prevDate) ) {
        		
        		if ( !date.weekEquals(prevDate) ) {
        			
        			if ( !date.monthEquals(prevDate) ) {
        				
        				if ( !date.yearEquals(prevDate) ) {
        					
        					timelinePanel.addTimeline(informationMonth, date.year+"년");
        					yearPanel = (TimelinePanel) timelinePanel.getLastPanel();
        					prevDate.year = date.year;
        				}
        				
        				// yearPanel 생성이 확실히 보장된 후 넣음
        				yearPanel.addTimeline(informationWeek, date.month+"월");
    					monthPanel = (TimelinePanel) yearPanel.getLastPanel();
    					prevDate.month = date.month;
        			}
        			
        			monthPanel.addTimeline(informationDay, date.week+"주");
					weekPanel = (TimelinePanel) monthPanel.getLastPanel();
					prevDate.week = date.week;
        		}
        		
        		String dayTitle = date.toDayTitle();
        		weekPanel.addTimeline(informationPost, dayTitle);
				dayPanel = (TimelinePanel) weekPanel.getLastPanel();
				prevDate.day = date.day;
        	}
        	
        	String timeFormat = "%s %d시 %d분";
        	String timeTitle = String.format(timeFormat, am_pm_texts[am_pm], hour, minute);
        	
        	// 모든 게시물은 메인 클래스를 가지도록 함
        	dayPanel.addPost(timeTitle, jsonObject, this);
        }        
        revalidate();
	}
	
	
    private static String convertUtcToLocal(String utcTime){  
        String localTime = "";  
          
        // 표준시를 Date 포맷으로 변경  
		Date dateUtcTime;
		try {
			dateUtcTime = timeFormatter.parse(utcTime);
			// 표준시 Date 포맷을 long 타입의 시간으로 변경  
			long longUtcTime = dateUtcTime.getTime();  
			  
			// TimeZone을 통해 시간차이 계산 (썸머타임 고려 getRawOffset 대신 getOffset 함수 활용)  
			TimeZone zone = TimeZone.getDefault();  
			int offset = zone.getOffset(longUtcTime);  
			long longLocalTime = longUtcTime + offset;  
			  
			// long 타입의 로컬 시간을 Date 포맷으로 변경  
			Date dateLocalTime = new Date();  
			dateLocalTime.setTime(longLocalTime);  
			  
			// 로컬 시간을 문자열로 변경하여 리턴   
			localTime = timeFormatter.format(dateLocalTime);   
		} catch (java.text.ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
        return localTime;  
    }  
	

//	private void setToNowDate(DateVO nowDate) {
//		setDate(nowDate, null);
//	}
//
//	private Calendar setDate(DateVO date, String created_time) {
//		// 타임존 로케일 설정
//    	TimeZone.setDefault(TimeZone.getTimeZone("GMT"));
//    	Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("GMT"), Locale.KOREA);
//    	SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
////    	SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
//    	
//    	if (created_time != null) {
//    		try {
//    			calendar.setTime(formatter.parse(created_time));
//    		} catch (java.text.ParseException e) {
//    			e.printStackTrace();
//    		}
//    	}    	
//    	calendar.setTimeZone(TimeZone.getTimeZone("Asia/Seoul"));
//    	
//    	// month 값은 + 1을 붙혀야함 
//    	date.year = calendar.get(Calendar.YEAR);
//    	date.month = calendar.get(Calendar.MONTH) + 1;
//    	date.week = calendar.get(Calendar.WEEK_OF_MONTH);
//    	date.day = calendar.get(Calendar.DATE);
//		return calendar;
//	}

	private void dataToHashMap(JSONArray data) throws java.text.ParseException {
        // 분석한 내용을 모두 리스트에 담는다. (Integer: 연, 월, 주, 일, 그리고 각 날짜별로 JSONObject의 LinkedList를 가짐)
        // LinkedList<HashMap<Integer, HashMap<Integer, HashMap<Integer, HashMap<Integer, LinkedList<JSONObject>>>>>> yearList;        
        // 위와 같이 작성하면 번거로우므로 아래와 같이 풀어씀 
        
        class DayList extends LinkedList<JSONObject>{};
        class WeekList extends HashMap<Integer, DayList>{};
        class MonthList extends HashMap<Integer, WeekList>{};
        class YearList extends HashMap<Integer, MonthList>{};
        class AllYearList extends HashMap<Integer, YearList>{};
        
        
        // 분석중인 날짜를 기록함 (값이 바뀔 때마다 객체 생성)
        Integer year = 0, month = 0, week = 0, day = 0;
        // 모든 해에 대한 정보
        AllYearList allYearList = new AllYearList();
        YearList yearList = null;	// 한 해에 대한 정보
        MonthList monthList = null; // 월에 대한 정보
        WeekList weekList = null;	// 주간 정보
        DayList dayList = null;		// 일간 정보
        
        // allYearList 사용법
        // allYearList.put(연도, 한 해에 대한 정보);
        // 사용하기 위해선 dayList 부터 차곡차곡 위로 올라가야함
        
        for (Object obj : data) {
        	JSONObject jsonObject = (JSONObject) obj;
//        	System.out.println(jsonObject);            	
        	
        	String created_time = (String) jsonObject.get("created_time");
//        	System.out.println(created_time);
        	
        	Calendar calendar = Calendar.getInstance();
//        	SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        	SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        	calendar.setTime(formatter.parse(created_time));
//        	System.out.println(calendar.toString());
        	
        	// month 값은 + 1을 붙혀야함 
        	int y = calendar.get(Calendar.YEAR);
        	int m = calendar.get(Calendar.MONTH) + 1;
        	int w = calendar.get(Calendar.WEEK_OF_MONTH);
        	int d = calendar.get(Calendar.DATE);
//        	System.out.println("y: "+y+", m: "+m+", d: "+d);
        	
        	// 넷 중 하나라도 다른 경우 일별 게시물 목록 생성
        	// 예를들어 6월 5일과 5월 5일은 같은 날이 아니므로
        	if ( y != year || m != month || w != week || d != day) {
        		dayList = new DayList();
        		// 주가 바뀔 때는 날짜만 다를 수 있음 (6월 첫 주와 5월 첫 주는 다른 주임)
        		if ( y != year || m != month || w != week ) {
        			weekList = new WeekList();
        			if ( y != year || m != month ) {
        				monthList = new MonthList();
        				if ( y != year ) {
        					yearList = new YearList();
        					// 생성하였으면 리스트에 넣음
        					allYearList.put(y, yearList);
        					year = y;
        				}
        				// yearList가 확실히 생성이 보장된 후 넣음
        				yearList.put(m, monthList);
    					month = m;
        			}
        			monthList.put(w, weekList);
					week = w;
        		}
        		weekList.put(d, dayList);
				day = d;
        	}            	
        	dayList.add(jsonObject);
        }
	}

	private void testLayout() {
		Vector<TitleVO> titleVector = new Vector<TitleVO>();
		titleVector.add(new TitleVO("2021년"));
		titleVector.add(new TitleVO("2020년"));
		titleVector.add(new TitleVO("2019년"));
		
		timelinePanel.setTitleVector(informationMonth, titleVector);
		
		
		// 2021년에 대한 레이아웃
		TimelinePanel year2021Panel = (TimelinePanel) timelinePanel.getSubpanelBySubstring("2021년");
		
		titleVector = new Vector<TitleVO>();
		titleVector.add(new TitleVO("6월"));
		titleVector.add(new TitleVO("5월"));
		titleVector.add(new TitleVO("4월"));		
		
		year2021Panel.setTitleVector(informationWeek, titleVector);
		
		
		// 6월에 대한 레이아웃
		TimelinePanel month6Panel = (TimelinePanel) year2021Panel.getSubpanelBySubstring("6월");
		
		titleVector = new Vector<TitleVO>();
		titleVector.add(new TitleVO("2주"));
		titleVector.add(new TitleVO("1주"));		
		
		month6Panel.setTitleVector(informationDay, titleVector);
		
		
		// 6월 둘째 주에 대한 레이아웃
		TimelinePanel week2Panel = (TimelinePanel) month6Panel.getSubpanelBySubstring("2주");
		
		titleVector = new Vector<TitleVO>();
		titleVector.add(new TitleVO("2021년 6월 6일"));
		titleVector.add(new TitleVO("2021년 6월 5일"));
		
		week2Panel.setTitleVector(informationPost, titleVector);
		
		
		TimelinePanel day6Panel = (TimelinePanel) week2Panel.getSubpanelBySubstring("6월 6일");
		
		Vector<TitleAndContentsVO> contentsVector = new Vector<TitleAndContentsVO>();
		contentsVector.add(new TitleAndContentsVO("1분전", "가나다라"));
		contentsVector.add(new TitleAndContentsVO("1시간전", "마바사아"));
		
		day6Panel.addContentsVector(contentsVector);
		
		revalidate();
	}

	// 유니코드에서 String으로 변환
	public static String convertString(String val) {
		// 변환할 문자를 저장할 버퍼 선언
		StringBuffer sb = new StringBuffer();
		// 글자를 하나하나 탐색한다.
		for (int i = 0; i < val.length(); i++) {
			if ('\\' == val.charAt(i) && 'u' == val.charAt(i + 1)) {
				// 그 뒤 네글자는 유니코드의 16진수 코드이다. int형으로 바꾸어서 다시 char 타입으로 강제 변환한다.
				Character r = (char) Integer.parseInt(val.substring(i + 2, i + 6), 16);
				// 변환된 글자를 버퍼에 넣는다.
				sb.append(r);
				// for의 증가 값 1과 5를 합해 6글자를 점프
				i += 5;
			} else {
				// ascii코드면 그대로 버퍼에 넣는다.
				sb.append(val.charAt(i));
			}
		}
		// 결과 리턴
		return sb.toString();
	}
	// 출처: https://nowonbun.tistory.com/686 [명월 일지]
}



