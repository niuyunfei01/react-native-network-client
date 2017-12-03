package cn.cainiaoshicai.crm.ui.activity;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import android.app.ListActivity;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.support.v4.content.ContextCompat;
import android.text.TextUtils;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.CompoundButton;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.RelativeLayout;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import cn.cainiaoshicai.crm.CrashReportHelper;
import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.util.AlertUtil;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingHelper;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.print.BluetoothConnector;
import cn.cainiaoshicai.crm.support.print.BluetoothPrinters;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.adapter.BluetoothItemAdapter;
import cn.cainiaoshicai.crm.ui.helper.StoreSelectedListener;

public class SettingsPrintActivity extends ListActivity {

    static public final int REQUEST_CONNECT_BT = 0x2300;

	static private final int REQUEST_ENABLE_BT = 0x1000;

	static private android.bluetooth.BluetoothAdapter btAdapter = null;

    static private BluetoothItemAdapter<BluetoothPrinters.DeviceStatus> listAdapter;

	private static final UUID SPP_UUID = UUID.fromString("8ce255c0-200a-11e0-ac64-0800200c9b66");
    private BluetoothPrinters.DeviceStatus lastDevice;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		this.setContentView(R.layout.settings_print);

		setTitle(R.string.title_setting);
        listAdapter = new BluetoothItemAdapter<>(this, R.layout.print_list, R.id.text1, R.id.storage_item_status);
        setListAdapter(listAdapter);

		Switch toggleSoundNotify = (Switch) findViewById(R.id.toggleSoundNotify);
		toggleSoundNotify.setChecked(!SettingUtility.isDisableSoundNotify());
		toggleSoundNotify.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
			@Override
			public void onCheckedChanged(CompoundButton buttonView, boolean reading) {
				SettingUtility.setDisableSoundNotify(!reading);
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

		final Switch toggleAutoPrint = (Switch) findViewById(R.id.toggleAutoPrint);
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


		final TextView list_store_filter_values = findViewById(R.id.list_store_filter_values);
		((ImageView)findViewById(R.id.list_store_filter_arrow)).setImageDrawable(ContextCompat.getDrawable(this, R.drawable.arrow));


		final long selectedStores = SettingUtility.getListenerStore();
		HashSet<Long> longs = new HashSet<>();
		longs.add(selectedStores);
		updateStoreFilterText(list_store_filter_values, longs);

		try {
			if (initDevicesList() != 0) {
				this.finish();
				return;
			}
		} catch (Exception ex) {
			this.finish();
			return;
		}

		IntentFilter btIntentFilter = new IntentFilter(BluetoothDevice.ACTION_FOUND);
		registerReceiver(mBTReceiver, btIntentFilter);

		connectToLastOne();
	}

	private void updateStoreFilterText(TextView list_store_filter_values, Set<Long> selectedStores) {
		if (selectedStores.isEmpty()) {
			list_store_filter_values.setText("全部店铺");
		} else {
			String[] storeNames = new String[selectedStores.size()];
			int i = 0;
			for(Long storeId : selectedStores) {
                storeNames[i++] = GlobalCtx.app().getStoreName(storeId);
			}
			list_store_filter_values.setText(TextUtils.join(",", storeNames));
		}
	}

	private void connectToLastOne() {
		String lastAddress = SettingUtility.getLastConnectedPrinterAddress();
		if (!TextUtils.isEmpty(lastAddress)) {
			for (int pos = 0; pos < listAdapter.getCount(); pos++) {
				BluetoothPrinters.DeviceStatus item = listAdapter.getItem(pos);
				if (item != null && lastAddress.equals(item.getAddr())) {
					connectPrinter(item);
					break;
				}
			}
		}
	}

	public static boolean isPrinterConnected() {
		String lastAddress = SettingUtility.getLastConnectedPrinterAddress();
		if (!TextUtils.isEmpty(lastAddress) && listAdapter != null) {
			for (int pos = 0; pos < listAdapter.getCount(); pos++) {
				BluetoothPrinters.DeviceStatus item = listAdapter.getItem(pos);
				if (item != null && lastAddress.equals(item.getAddr())) {
					boolean connected = item.isConnected();
					GlobalCtx.app().setPrinterConnected(connected);
					return connected;
				}
			}
		}

		GlobalCtx.app().setPrinterConnected(false);
		return false;
	}

	private void flushData() {
		try {
			if (btAdapter != null) {
				btAdapter.cancelDiscovery();
			}

			if (listAdapter != null) {
                listAdapter.clear();
                listAdapter.notifyDataSetChanged();
                listAdapter.notifyDataSetInvalidated();
			}
		} catch (Throwable e) {
            AppLogger.e("exception to flush data:" + e.getMessage(), e);
		}

	}

	private int initDevicesList() {

		flushData();

		btAdapter = android.bluetooth.BluetoothAdapter.getDefaultAdapter();
		if (btAdapter == null) {
			Toast.makeText(getApplicationContext(),
					"手机没有开启蓝牙，请先开启", Toast.LENGTH_LONG).show();
			return -1;
		}

		if (btAdapter.isDiscovering()) {
			btAdapter.cancelDiscovery();
		}

		Intent enableBtIntent = new Intent(android.bluetooth.BluetoothAdapter.ACTION_REQUEST_ENABLE);
		try {
			startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
		} catch (Exception ex) {
            AppLogger.e("error to enable bluetooth:", ex);
			return -2;
		}

		Toast.makeText(getApplicationContext(),
				"正在查找蓝牙打印机...", Toast.LENGTH_SHORT)
				.show();

		return 0;

	}

	@Override
	protected void onActivityResult(int reqCode, int resultCode, Intent intent) {
		super.onActivityResult(reqCode, resultCode, intent);

		switch (reqCode) {
		case REQUEST_ENABLE_BT:
			if (resultCode == RESULT_OK) {
				Set<BluetoothDevice> btDeviceList = btAdapter.getBondedDevices();
				try {
					if (btDeviceList.size() > 0) {
						for (BluetoothDevice device : btDeviceList) {
							BluetoothPrinters.DeviceStatus deviceStatus = new BluetoothPrinters.DeviceStatus(device);
							if (listAdapter.getPosition(deviceStatus) < 0) {
								listAdapter.add(deviceStatus);
							}
						}

						connectToLastOne();
                        listAdapter.notifyDataSetInvalidated();
					}
				} catch (Exception ex) {
					AppLogger.e("error to enable bluebooth", ex);
				}
			}

			break;
		}

		btAdapter.startDiscovery();

	}

    private final BroadcastReceiver mBTReceiver = new BroadcastReceiver() {

        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (BluetoothDevice.ACTION_FOUND.equals(action)) {
                BluetoothDevice device = intent
                        .getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);

                try {
                    BluetoothPrinters.DeviceStatus ds = new BluetoothPrinters.DeviceStatus(device);
                    if (listAdapter.getPosition(ds) < 0) {
                        listAdapter.add(ds);
                        listAdapter.notifyDataSetInvalidated();
                    }
                } catch (Exception ex) {
                     ex.fillInStackTrace();
                    throw ex;
                }
            }
        }
    };

	@Override
	protected void onListItemClick(ListView l, View v, final int position, long id) {
		super.onListItemClick(l, v, position, id);

		connectPrinter(listAdapter.getItem(position));
	}

	private ProgressFragment progressFragment;

	private void connectPrinter(final BluetoothPrinters.DeviceStatus item) {
		if (btAdapter == null) {
			return;
		}

		if (btAdapter.isDiscovering()) {
			btAdapter.cancelDiscovery();
		}

		String connecting = String.format("正在连接打印机 %s,%s", item.getName(), item.getAddr());
		Toast.makeText(getApplicationContext(),
				connecting,
				Toast.LENGTH_SHORT).show();

		Thread connectThread = new Thread(new Runnable() {
			@Override
			public void run() {
				final BluetoothDevice device = item.getDevice();
				try {
					final BluetoothConnector btConnector = new BluetoothConnector(device, false, btAdapter, null);
					final BluetoothConnector.BluetoothSocketWrapper socketWrapper = btConnector.connect();
					item.resetSocket(socketWrapper);

                    final SettingsPrintActivity act = SettingsPrintActivity.this;
                    SettingUtility.setLastConnectedPrinterAddress(device.getAddress());
                    act.lastDevice = item;

                    AppLogger.e("connect with wrapper: connected");
                    final String msg = String.format("已连接到 %s", item.getName());

                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            showTestDlg(act, msg, item.getSocket());
                        }
                    });

				} catch (IOException ex) {
					AppLogger.e("exception to connect BT device:" + device.getName(), ex);
					CrashReportHelper.handleUncaughtException(null, ex);
					runOnUiThread(socketErrorRunnable);
				} finally {
					runOnUiThread(new Runnable() {
						@Override
						public void run() {
							listAdapter.notifyDataSetChanged();
							if (progressFragment != null) {
								progressFragment.dismissAllowingStateLoss();
							}
						}
					});
				}
			}
		});

		connectThread.start();
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

    private Runnable socketErrorRunnable = new Runnable() {

		@Override
		public void run() {
			Toast.makeText(getApplicationContext(),
					"连接打印机时发生错误", Toast.LENGTH_SHORT).show();
			btAdapter.startDiscovery();

		}
	};

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		super.onCreateOptionsMenu(menu);

		menu.add(0, Menu.FIRST, Menu.NONE, "查找附近打印机");

		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		super.onOptionsItemSelected(item);

		switch (item.getItemId()) {
		case Menu.FIRST:
			initDevicesList();
			break;
		}

		return true;
	}
}