package cn.cainiaoshicai.crm.orders.util;

public class TextUtil {
    public static String replaceWhiteStr(String str) {
        return str == null ? "" : str.replaceAll("\n ", "");
    }


    /**
     * <p>Checks if a CharSequence is whitespace, empty ("") or null.</p>
     *
     * <pre>
     * StringUtils.isBlank(null)      = true
     * StringUtils.isBlank("")        = true
     * StringUtils.isBlank(" ")       = true
     * StringUtils.isBlank("bob")     = false
     * StringUtils.isBlank("  bob  ") = false
     * </pre>
     *
     * @param cs  the CharSequence to check, may be null
     * @return {@code true} if the CharSequence is null, empty or whitespace
     * @since 2.0
     * @since 3.0 Changed signature from isBlank(String) to isBlank(CharSequence)
     */
    public static boolean isBlank(final CharSequence cs) {
        int strLen;
        if (cs == null || (strLen = cs.length()) == 0) {
            return true;
        }
        for (int i = 0; i < strLen; i++) {
            if (Character.isWhitespace(cs.charAt(i)) == false) {
                return false;
            }
        }
        return true;
    }

    /**
     * <p>Checks if a CharSequence is empty ("") or null.</p>
     *
     * <pre>
     * StringUtils.isEmpty(null)      = true
     * StringUtils.isEmpty("")        = true
     * StringUtils.isEmpty(" ")       = false
     * StringUtils.isEmpty("bob")     = false
     * StringUtils.isEmpty("  bob  ") = false
     * </pre>
     *
     * <p>NOTE: This method changed in Lang version 2.0.
     * It no longer trims the CharSequence.
     * That functionality is available in isBlank().</p>
     *
     * @param cs  the CharSequence to check, may be null
     * @return {@code true} if the CharSequence is empty or null
     * @since 3.0 Changed signature from isEmpty(String) to isEmpty(CharSequence)
     */
    public static boolean isEmpty(final CharSequence cs) {
        return cs == null || cs.length() == 0;
    }

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
