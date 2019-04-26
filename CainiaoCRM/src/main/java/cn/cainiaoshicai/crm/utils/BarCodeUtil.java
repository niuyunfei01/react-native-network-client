package cn.cainiaoshicai.crm.utils;

import com.google.common.collect.Maps;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class BarCodeUtil {

    private static String CODE_TYPE_RECEIVE = "IR";

    //类型 操作人 tag_code 重量 年月日时分秒 sku
    //IR-0000048-0019-00580-190416183857-0061
    public static Map<String, String> extractCode(String code) {
        Map<String, String> result = Maps.newHashMap();
        String[] codeInfo = code.split("-");
        String type = codeInfo[0];
        if (type.equals(CODE_TYPE_RECEIVE)) {
            result.put("workerId", Integer.parseInt(codeInfo[1]) + "");
            result.put("tagCode", Integer.parseInt(codeInfo[2]) + "");
            result.put("skuId", Integer.parseInt(codeInfo[5]) + "");

            String weightData = codeInfo[3];

            result.put("weight", insertString(weightData, ".", weightData.length() - 4));
            result.put("datetime", formatDate(codeInfo[4]));
            result.put("action", "InventoryMaterialPutIn");
        }
        result.put("type", type);
        result.put("barCode", code);
        return result;
    }


    public static List<String> splitEqually(String text, int size) {
        // Give the list the right capacity to start with. You could use an array
        // instead if you wanted.
        List<String> ret = new ArrayList<String>((text.length() + size - 1) / size);
        for (int start = 0; start < text.length(); start += size) {
            ret.add(text.substring(start, Math.min(text.length(), start + size)));
        }
        return ret;
    }

    public static String formatDate(String dateStr) {
        SimpleDateFormat dfFrom = new SimpleDateFormat("yyMMddHHmmss");
        SimpleDateFormat dfTo = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
        try {
            return dfTo.format(dfFrom.parse(dateStr));
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return dfTo.format(new Date());
    }

    public static String insertString(
            String originalString,
            String stringToBeInserted,
            int index) {
        // Create a new string
        String newString = new String();
        for (int i = 0; i < originalString.length(); i++) {
            // Insert the original string character
            // into the new string
            newString += originalString.charAt(i);
            if (i == index) {
                // Insert the string to be inserted
                // into the new string
                newString += stringToBeInserted;
            }
        }
        // return the modified String
        return newString;
    }

    public static boolean checkEAN13(String code) {
        if (code == null || code.length() != 13)
            return false;
        int a = 0, b = 0, c = 0, d = 0;
        for (int i = 0; i < 12; i += 2) {
            a += (code.charAt(i) - '0');
            b += (code.charAt(i + 1) - '0');
        }
        c = (a + b * 3) % 10;
        d = (10 - c) % 10;
        return (code.charAt(12) - '0') == d;
    }

    public static void main(String[] args) {
        String[] codes = {"6921204802204", "6942032700760"};
        for (String s : codes) {
            boolean r = checkEAN13(s);
            if (r) {
                System.out.println(s + " : 检查成功");
            } else {
                System.out.println(s + " : 检查失败");
            }
        }
    }
}
