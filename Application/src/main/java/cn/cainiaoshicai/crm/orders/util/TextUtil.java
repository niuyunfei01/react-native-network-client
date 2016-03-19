package cn.cainiaoshicai.crm.orders.util;

public class TextUtil {
	
//	/**
//	 * 将text中@某人的字体加亮，匹配的表情文字以表情显示
//	 * @return
//	 */
//	public static void formatContent(TextView textView) {
//		SpannableString spannableString = new SpannableString(textView.getText());
//		/*
//		 * @[^\\s:：]+[:：\\s] 匹配@某人  \\[[^0-9]{1,4}\\] 匹配表情
//		 */
//		Pattern pattern = Pattern.compile("@[^\\s:：]+[:：\\s]|\\[[^0-9]{1,4}\\]");
//		Matcher matcher = pattern.matcher(spannableString);
//		while (matcher.find()) {
//			String match=matcher.group();
//			if(match.startsWith("@")){
//				spannableString.setSpan(new ForegroundColorSpan(0xff0077ff),
//						matcher.start(), matcher.end(),
//						Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
//			}
//		}

//	}

}
