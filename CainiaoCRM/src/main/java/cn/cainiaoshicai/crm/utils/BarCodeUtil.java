package cn.cainiaoshicai.crm.utils;

import com.google.common.collect.Maps;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class BarCodeUtil {

    public static String CODE_TYPE_RECEIVE = "IR";

    //类型 店铺 供货商 sku编号 重量 年月日时分秒
    //IR 00 01 0001 00610 190013155014
    public static Map<String, String> extractCode(String code) {
        Map<String, String> result = Maps.newHashMap();
        String[] codeInfo = code.split("-");
        String type = codeInfo[0];
        if (type.equals(CODE_TYPE_RECEIVE)) {
            result.put("type", type);
            List<String> storeSupplierInfo = splitEqually(codeInfo[1], 2);
            result.put("storeId", Integer.parseInt(storeSupplierInfo.get(0)) + "");
            result.put("supplierId", Integer.parseInt(storeSupplierInfo.get(1)) + "");
            result.put("skuId", Integer.parseInt(codeInfo[2]) + "");
            result.put("weight", insertString(codeInfo[3], ".", 2));
            result.put("datetime", formatDate(codeInfo[4]));
            result.put("action", "InventoryMaterialPutIn");
            result.put("barCode", code);
        }
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
}
