package cn.cainiaoshicai.crm.scan;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothClass;
import android.bluetooth.BluetoothDevice;
import android.os.Handler;
import android.view.InputDevice;
import android.view.KeyEvent;

import com.google.common.collect.Lists;

import java.util.Iterator;
import java.util.List;
import java.util.Set;


public class BluetoothScanGunKeyEventHelper {

    private final static long MESSAGE_DELAY = 300;             //延迟300ms，判断扫码是否完成。
    private StringBuffer mStringBufferResult;                  //扫码内容
    private boolean mCaps;                                     //大小写区分
    private final Handler mHandler;
    private final BluetoothAdapter mBluetoothAdapter;
    private final Runnable mScanningFishedRunnable;
    private OnScanSuccessListener mOnScanSuccessListener;
    private String mDeviceName;
    private List<String> deviceNameList;

    public BluetoothScanGunKeyEventHelper(OnScanSuccessListener onScanSuccessListener) {
        mOnScanSuccessListener = onScanSuccessListener;
        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        mStringBufferResult = new StringBuffer();
        mHandler = new Handler();
        mScanningFishedRunnable = new Runnable() {
            @Override
            public void run() {
                performScanSuccess();
            }
        };
        deviceNameList = Lists.newArrayList();
    }


    /**
     * 返回扫码成功后的结果
     */
    private void performScanSuccess() {
        String barcode = mStringBufferResult.toString();
        if (mOnScanSuccessListener != null)
            mOnScanSuccessListener.onScanSuccess(barcode);
        mStringBufferResult.setLength(0);
    }


    /**
     * 扫码枪事件解析
     *
     * @param event
     */
    public void analysisKeyEvent(KeyEvent event) {
        int keyCode = event.getKeyCode();
        //字母大小写判断
        checkLetterStatus(event);
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            char aChar = getInputCode(event);
            if (aChar != 0) {
                mStringBufferResult.append(aChar);
            }
            if (keyCode == KeyEvent.KEYCODE_ENTER) {
                //若为回车键，直接返回
                mHandler.removeCallbacks(mScanningFishedRunnable);
                mHandler.post(mScanningFishedRunnable);
            } else {
                //延迟post，若500ms内，有其他事件
                mHandler.removeCallbacks(mScanningFishedRunnable);
                mHandler.postDelayed(mScanningFishedRunnable, MESSAGE_DELAY);
            }

        }
    }

    //检查shift键
    private void checkLetterStatus(KeyEvent event) {
        int keyCode = event.getKeyCode();
        if (keyCode == KeyEvent.KEYCODE_SHIFT_RIGHT || keyCode == KeyEvent.KEYCODE_SHIFT_LEFT) {
            if (event.getAction() == KeyEvent.ACTION_DOWN) {
                //按着shift键，表示大写
                mCaps = true;
            } else {
                //松开shift键，表示小写
                mCaps = false;
            }
        }
    }


    //获取扫描内容
    private char getInputCode(KeyEvent event) {
        char aChar = (char) event.getUnicodeChar();
        return aChar;
    }


    public interface OnScanSuccessListener {
        void onScanSuccess(String barcode);
    }


    public void onDestroy() {
        mHandler.removeCallbacks(mScanningFishedRunnable);
        mOnScanSuccessListener = null;
    }


    /**
     * 扫描枪是否连接
     *
     * @return
     */
    public boolean hasScanGun() {
        if (mDeviceName != null) {
            return true;
        }
        if (mBluetoothAdapter == null) {
            return false;
        }
        Set<BluetoothDevice> blueDevices = mBluetoothAdapter.getBondedDevices();
        if (blueDevices == null || blueDevices.size() <= 0) {
            return false;
        }
        for (Iterator<BluetoothDevice> iterator = blueDevices.iterator(); iterator.hasNext(); ) {
            BluetoothDevice bluetoothDevice = iterator.next();
            if (bluetoothDevice.getBluetoothClass().getMajorDeviceClass() == BluetoothClass.Device.Major.PERIPHERAL) {
                mDeviceName = bluetoothDevice.getName();
                return isInputDeviceExist(mDeviceName);
            }
        }
        return false;
    }


    /**
     * 输入设备是否存在
     *
     * @param deviceName
     * @return
     */
    private boolean isInputDeviceExist(String deviceName) {
        int[] deviceIds = InputDevice.getDeviceIds();
        for (int id : deviceIds) {
            if (InputDevice.getDevice(id).getName().equals(deviceName)) {
                return true;
            }
        }
        return false;
    }

    private void setDeviceNameList() {
        deviceNameList.clear();
        int[] deviceIds = InputDevice.getDeviceIds();
        for (int id : deviceIds) {
            InputDevice device = InputDevice.getDevice(id);
            if (device != null && !device.isVirtual()) {
                deviceNameList.add(InputDevice.getDevice(id).getName());
            }
        }
    }

    /**
     * 是否为扫码枪事件(部分机型KeyEvent获取的名字错误)
     *
     * @param event
     * @return
     */
    public boolean isScanGunEvent(KeyEvent event) {
        if (deviceNameList.isEmpty()) {
            setDeviceNameList();
        }
        String deviceName = event.getDevice().getName();
        return deviceNameList.contains(deviceName);
    }
}
