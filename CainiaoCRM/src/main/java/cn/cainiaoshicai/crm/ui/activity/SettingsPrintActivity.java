package cn.cainiaoshicai.crm.ui.activity;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.bluetooth.BluetoothAdapter;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.ImageView;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import com.xdandroid.hellodaemon.IntentWrapper;

import org.greenrobot.eventbus.EventBus;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.bt.BluetoothActivity;
import cn.cainiaoshicai.crm.bt.BluetoothController;
import cn.cainiaoshicai.crm.orders.util.AlertUtil;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingHelper;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.print.BluetoothConnector;
import cn.cainiaoshicai.crm.support.print.BluetoothPrinters;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;
import cn.cainiaoshicai.crm.support.utils.Utility;


public class SettingsPrintActivity extends BluetoothActivity implements View.OnClickListener {

    static public final int REQUEST_CONNECT_BT = 0x2300;
    private static final String TAG = SettingsPrintActivity.class.getSimpleName();

    private static final int REQUEST_CODE_OPEN_GPS = 1;
    private static final int REQUEST_CODE_PERMISSION_LOCATION = 2;

    /**
     *
     */
    BluetoothAdapter mAdapter;

    boolean mBtEnable = true;

    private Button btn_scan;

    int PERMISSION_REQUEST_COARSE_LOCATION = 2;

    TextView tv_bluename;
    TextView tv_blueadress;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.setContentView(R.layout.settings_print);
        setTitle(R.string.title_setting);
        initView();

        //6.0以上的手机要地理位置权限
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            requestPermissions(new String[]{Manifest.permission.ACCESS_COARSE_LOCATION}, PERMISSION_REQUEST_COARSE_LOCATION);
        }
    }

    private void initView() {
        Switch toggleSoundNotify = findViewById(R.id.toggleSoundNotify);
        toggleSoundNotify.setChecked(!SettingUtility.isDisableSoundNotify());
        toggleSoundNotify.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean reading) {
                SettingUtility.setDisableSoundNotify(!reading);
            }
        });

        Switch toggleNewSoundNotify = findViewById(R.id.toggleNewSoundNotify);
        toggleNewSoundNotify.setChecked(!SettingUtility.isDisableNewOrderSoundNotify());
        toggleNewSoundNotify.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean reading) {
                SettingUtility.setDisableNewOrderSoundNotify(!reading);
            }
        });

        GlobalCtx app = GlobalCtx.app();
        boolean isDirect = app.getVendor() != null && Cts.BLX_TYPE_DIRECT.equals(app.getVendor().getVersion());

        findViewById(R.id.label_use_preview).setVisibility(isDirect ? View.VISIBLE : View.GONE);
        final Switch toggleUsePreview = findViewById(R.id.toggleUsePreview);
        toggleUsePreview.setVisibility(isDirect ? View.VISIBLE : View.GONE);

        toggleUsePreview.setChecked(SettingHelper.usePreviewHost());
        toggleUsePreview.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                SettingHelper.setUserPreviewHost(isChecked);
            }
        });

        final Switch toggleAutoPrint = findViewById(R.id.toggleAutoPrint);
        toggleAutoPrint.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                if (isChecked && SettingUtility.getListenerStores().isEmpty()) {
                    Utility.toast("您必须先指定【待处理订单显示店铺】", SettingsPrintActivity.this, new Runnable() {
                        @Override
                        public void run() {
                            toggleAutoPrint.setChecked(false);
                        }
                    });
                } else {
                    SettingUtility.setAutoPrint(isChecked);
                }
            }
        });
        toggleAutoPrint.setChecked(SettingUtility.getAutoPrintSetting());

        findViewById(R.id.label_printer_status).setVisibility(isDirect ? View.VISIBLE : View.GONE);
        final TextView printerStatus = findViewById(R.id.printer_status);
        printerStatus.setVisibility(isDirect ? View.VISIBLE : View.GONE);

        if (isDirect) {
            BluetoothPrinters.DeviceStatus p = BluetoothPrinters.INS.getCurrentPrinter();
            boolean connected = GlobalCtx.app().isPrinterConnected() || (p != null && p.isConnected());
            printerStatus.setText(SettingUtility.getLastConnectedPrinterAddress() + ":" + (connected ? "已连接" : "未连接"));
            printerStatus.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    BluetoothPrinters.DeviceStatus printer = BluetoothPrinters.INS.getCurrentPrinter();
                    if (printer == null || !printer.isConnected()) {
                        AppLogger.e("skip to print for printer is not connected!");
                    }
                    showTestDlg(SettingsPrintActivity.this, printer == null ? "打印机未连接？" : "点击测试", printer != null ? printer.getSocket() : null);
                }
            });
        }


        final boolean supportSunMi = OrderPrinter.supportSunMiPrinter();
        final TextView labelSunMiPrinterStatus = findViewById(R.id.label_sun_mi_printer_status);
        final TextView sunMiPrinterStatus = findViewById(R.id.sun_mi_printer_status);

        if (supportSunMi) {
            sunMiPrinterStatus.setText("已经连接商米");
            sunMiPrinterStatus.setVisibility(View.VISIBLE);
            labelSunMiPrinterStatus.setVisibility(View.VISIBLE);
        } else {
            labelSunMiPrinterStatus.setVisibility(View.GONE);
            sunMiPrinterStatus.setVisibility(View.GONE);
        }

        final TextView list_store_filter_values = findViewById(R.id.list_store_filter_values);
        ((ImageView) findViewById(R.id.list_store_filter_arrow)).setImageDrawable(ContextCompat.getDrawable(this, R.drawable.arrow));

        final long selectedStores = SettingUtility.getListenerStore();
        HashSet<Long> longs = new HashSet<>();
        longs.add(selectedStores);
        updateStoreFilterText(list_store_filter_values, longs);

        final Switch toggleSetAppWhiteList = findViewById(R.id.toggleSetAppWhiteList);
        toggleSetAppWhiteList.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                if (isChecked) {
                    IntentWrapper.whiteListMatters(SettingsPrintActivity.this, "外送帮后台运行");
                }
            }
        });


        btn_scan = findViewById(R.id.btn_scan);
        btn_scan.setOnClickListener(this);

        tv_bluename = findViewById(R.id.tv_bluename);
        tv_blueadress = findViewById(R.id.tv_blueadress);
    }

    private void updateStoreFilterText(TextView list_store_filter_values, Set<Long> selectedStores) {
        if (selectedStores.isEmpty()) {
            list_store_filter_values.setText("全部店铺");
        } else {
            String[] storeNames = new String[selectedStores.size()];
            int i = 0;
            for (Long storeId : selectedStores) {
                storeNames[i++] = GlobalCtx.app().getStoreName(storeId);
            }
            list_store_filter_values.setText(TextUtils.join(",", storeNames));
        }
    }

    public void showTestDlg(final SettingsPrintActivity act, String msg, final BluetoothConnector.BluetoothSocketWrapper socket) {
        AlertUtil.showAlert(act, R.string.tip_dialog_title, msg, "确定", null,
                "打印测试", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        try {
                            if (socket != null) {
                                OrderPrinter.printTest(socket);
                            } else {
                                Utility.toast("打印机端口状态为null", act);
                            }
                        } catch (IOException e) {
                            e.printStackTrace();
                            //TODO: 应该自动尝试连接！
                            Utility.toast("打印错误，请关闭App重新连接！", act);
                        }
                    }
                });
    }


    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.btn_scan:
                if (btn_scan.getText().equals(getString(R.string.start_scan))) {
                    checkPermissions();
                    startActivity(new Intent(SettingsPrintActivity.this, SearchBluetoothActivity.class));
                }
                break;
        }
    }


    @Override
    public final void onRequestPermissionsResult(int requestCode,
                                                 @NonNull String[] permissions,
                                                 @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        switch (requestCode) {
            case REQUEST_CODE_PERMISSION_LOCATION:
                if (grantResults.length > 0) {
                    for (int i = 0; i < grantResults.length; i++) {
                        if (grantResults[i] == PackageManager.PERMISSION_GRANTED) {
                            onPermissionGranted(permissions[i]);
                        }
                    }
                }
                break;
        }
    }

    private void checkPermissions() {
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (!bluetoothAdapter.isEnabled()) {
            Toast.makeText(this, getString(R.string.please_open_blue), Toast.LENGTH_LONG).show();
            return;
        }

        String[] permissions = {Manifest.permission.ACCESS_FINE_LOCATION};
        List<String> permissionDeniedList = new ArrayList<>();
        for (String permission : permissions) {
            int permissionCheck = ContextCompat.checkSelfPermission(this, permission);
            if (permissionCheck == PackageManager.PERMISSION_GRANTED) {
                onPermissionGranted(permission);
            } else {
                permissionDeniedList.add(permission);
            }
        }
        if (!permissionDeniedList.isEmpty()) {
            String[] deniedPermissions = permissionDeniedList.toArray(new String[permissionDeniedList.size()]);
            ActivityCompat.requestPermissions(this, deniedPermissions, REQUEST_CODE_PERMISSION_LOCATION);
        }
    }

    private void onPermissionGranted(String permission) {
        switch (permission) {
            case Manifest.permission.ACCESS_FINE_LOCATION:
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !checkGPSIsOpen()) {
                    new AlertDialog.Builder(this)
                            .setTitle(R.string.notifyTitle)
                            .setMessage(R.string.gpsNotifyMsg)
                            .setNegativeButton(R.string.cancel,
                                    new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface dialog, int which) {
                                            finish();
                                        }
                                    })
                            .setPositiveButton(R.string.setting,
                                    new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface dialog, int which) {
                                            Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
                                            startActivityForResult(intent, REQUEST_CODE_OPEN_GPS);
                                        }
                                    })

                            .setCancelable(false)
                            .show();
                }
                break;
        }
    }

    private boolean checkGPSIsOpen() {
        LocationManager locationManager = (LocationManager) this.getSystemService(Context.LOCATION_SERVICE);
        if (locationManager == null)
            return false;
        return locationManager.isProviderEnabled(android.location.LocationManager.GPS_PROVIDER);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_CODE_OPEN_GPS) {
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
        BluetoothController.init(this);
    }

    @Override
    public void btStatusChanged(Intent intent) {
        super.btStatusChanged(intent);
        BluetoothController.init(this);
    }

    public BluetoothAdapter getmAdapter() {
        return mAdapter;
    }

    public void setmAdapter(BluetoothAdapter mAdapter) {
        this.mAdapter = mAdapter;
    }

    public TextView getTv_bluename() {
        return tv_bluename;
    }

    public TextView getTv_blueadress() {
        return tv_blueadress;
    }

    public boolean ismBtEnable() {
        return mBtEnable;
    }

    public void setmBtEnable(boolean mBtEnable) {
        this.mBtEnable = mBtEnable;
    }
}