package cn.cainiaoshicai.crm;

import com.sunmi.peripheral.printer.SunmiPrinterService;

import android.os.Handler;

public class AppCache {
    private static Handler handler;
    private static boolean isConnectedSunmi;
    private static SunmiPrinterService sunmiPrinterService;

    public static Handler getHandler() {
        return handler;
    }

    public static void setHandler(Handler handler) {
        AppCache.handler = handler;
    }

    public static boolean isIsConnectedSunmi() {
        return isConnectedSunmi;
    }

    public static void setIsConnectedSunmi(boolean isConnectedSunmi) {
        AppCache.isConnectedSunmi = isConnectedSunmi;
    }

    public static SunmiPrinterService getSunmiPrinterService() {
        return sunmiPrinterService;
    }

    public static void setSunmiPrinterService(SunmiPrinterService sunmiPrinterService) {
        AppCache.sunmiPrinterService = sunmiPrinterService;
    }
}
