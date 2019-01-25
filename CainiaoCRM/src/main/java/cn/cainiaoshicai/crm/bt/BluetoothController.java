package cn.cainiaoshicai.crm.bt;

import android.bluetooth.BluetoothAdapter;
import android.text.TextUtils;

import cn.cainiaoshicai.crm.print.PrintUtil;
import cn.cainiaoshicai.crm.ui.activity.SettingsPrintActivity;

public class BluetoothController {

    public static void init(SettingsPrintActivity activity) {
        if (null == activity.getmAdapter()) {
            activity.setmAdapter(BluetoothAdapter.getDefaultAdapter());
        }
        if (null == activity.getmAdapter()) {
            activity.getTv_bluename().setText("该设备没有蓝牙模块");
            activity.setmBtEnable(false);
            return;
        }
        if (!activity.getmAdapter().isEnabled()) {
            if (activity.getmAdapter().getState() == BluetoothAdapter.STATE_OFF) {//蓝牙被关闭时强制打开
                activity.getmAdapter().enable();

            } else {
                activity.getTv_bluename().setText("蓝牙未打开");
                return;
            }
        }
        String address = PrintUtil.getDefaultBluethoothDeviceAddress(activity.getApplicationContext());
        if (TextUtils.isEmpty(address)) {
            activity.getTv_bluename().setText("尚未绑定蓝牙设备");
            return;
        }
        String name = PrintUtil.getDefaultBluetoothDeviceName(activity.getApplicationContext());
        activity.getTv_bluename().setText("已绑定蓝牙：" + name);
        activity.getTv_blueadress().setText(address);

    }

    public static boolean turnOnBluetooth() {
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter
                .getDefaultAdapter();
        if (bluetoothAdapter != null) {
            return bluetoothAdapter.enable();
        }
        return false;
    }
}