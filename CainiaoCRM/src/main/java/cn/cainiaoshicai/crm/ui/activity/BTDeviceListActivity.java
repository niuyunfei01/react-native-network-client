package cn.cainiaoshicai.crm.ui.activity;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

import android.app.ListActivity;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.CompoundButton;
import android.widget.ListView;
import android.widget.Switch;
import android.widget.Toast;
import android.widget.ToggleButton;

import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.print.BluetoothConnector;
import cn.cainiaoshicai.crm.support.print.BluetoothPrinters;
import cn.cainiaoshicai.crm.ui.adapter.BluetoothItemAdapter;

public class BTDeviceListActivity extends ListActivity {

    static public final int REQUEST_CONNECT_BT = 0x2300;

	static private final int REQUEST_ENABLE_BT = 0x1000;

	static private android.bluetooth.BluetoothAdapter btAdapter = null;

    static private BluetoothItemAdapter<BluetoothPrinters.DeviceStatus> listAdapter;

	private static final UUID SPP_UUID = UUID.fromString("8ce255c0-200a-11e0-ac64-0800200c9b66");
	// UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		this.setContentView(R.layout.settings_print);

		setTitle(R.string.title_bluetooth_setting);
        listAdapter = new BluetoothItemAdapter<>(this, R.layout.listview_btd_list, R.id.text1, R.id.image1);
        setListAdapter(listAdapter);

		Switch toggleSoundNotify = (Switch) findViewById(R.id.toggleSoundNotify);
		toggleSoundNotify.setChecked(SettingUtility.isDisableSoundNotify());
		toggleSoundNotify.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
			@Override
			public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
				SettingUtility.setDisableSoundNotify(isChecked);
			}
		});

		Switch toggleHLG = (Switch) findViewById(R.id.togglePrintHLG);
		Switch toggleYYC = (Switch) findViewById(R.id.togglePrintYYC);
		toggleHLG.setChecked(SettingUtility.isAutoPrintHLG());
		toggleYYC.setChecked(SettingUtility.isAutoPrintYYC());

		toggleHLG.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
			public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
				SettingUtility.setAutoPrintHLG(isChecked);
			}
		});
		toggleYYC.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
			@Override
			public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
				SettingUtility.setAutoPrintYYC(isChecked);
			}
		});

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

	private void connectToLastOne() {
		String lastAddress = SettingUtility.getLastConnectedPrinterAddress();
		if (!TextUtils.isEmpty(lastAddress)) {
			for (int pos = 0; pos < listAdapter.getCount(); pos++) {
				BluetoothPrinters.DeviceStatus item = listAdapter.getItem(pos);
				if (lastAddress.equals(item.getAddr())) {
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
				if (lastAddress.equals(item.getAddr())) {
					return item.isConnected();
				}
			}
		}

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
					"Bluetooth not supported!!", Toast.LENGTH_LONG).show();
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
				"Getting all available Bluetooth Devices", Toast.LENGTH_SHORT)
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
							BluetoothPrinters.DeviceStatus deviceStatus = new BluetoothPrinters.DeviceStatus(device, false);
							if (listAdapter.getPosition(deviceStatus) < 0) {
								listAdapter.add(deviceStatus);
								listAdapter.notifyDataSetInvalidated();
							}
						}

						connectToLastOne();
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
                    BluetoothPrinters.DeviceStatus ds = new BluetoothPrinters.DeviceStatus(device, false);
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

	private void connectPrinter(final BluetoothPrinters.DeviceStatus item) {
		if (btAdapter == null) {
			return;
		}

		if (btAdapter.isDiscovering()) {
			btAdapter.cancelDiscovery();
		}

		Toast.makeText(getApplicationContext(),
				String.format("Connecting to %s,%s", item.getName(), item.getAddr()),
				Toast.LENGTH_SHORT).show();

		Thread connectThread = new Thread(new Runnable() {
			@Override
			public void run() {
				final BluetoothDevice device = item.getDevice();
				try {
					final BluetoothConnector btConnector = new BluetoothConnector(device, false, btAdapter, null);
					final BluetoothConnector.BluetoothSocketWrapper socketWrapper = btConnector.connect();
					item.resetSocket(socketWrapper);
					SettingUtility.setLastConnectedPrinterAddress(device.getAddress());
					AppLogger.e("connect with wrapper: connected");
					runOnUiThread(new Runnable() {
						@Override
						public void run() {
							Toast.makeText(getApplicationContext(),
									String.format("已连接到 %s", item.getName()),
									Toast.LENGTH_SHORT).show();
						}
					});
				} catch (IOException ex) {
					AppLogger.e("exception to connect BT device:" + device.getName(), ex);
					runOnUiThread(socketErrorRunnable);
				} finally {
					runOnUiThread(new Runnable() {
						@Override
						public void run() {
							listAdapter.notifyDataSetChanged();
						}
					});
				}
			}
		});

		connectThread.start();
	}

	private static void connectPrinterNoUI(final BluetoothPrinters.DeviceStatus item) {
		if (btAdapter == null) {
			return;
		}

		if (btAdapter.isDiscovering()) {
			btAdapter.cancelDiscovery();
		}

		Thread connectThread = new Thread(new Runnable() {
			@Override
			public void run() {
				final BluetoothDevice device = item.getDevice();
				try {
					final BluetoothConnector btConnector = new BluetoothConnector(device, false, btAdapter, null);
					final BluetoothConnector.BluetoothSocketWrapper socketWrapper = btConnector.connect();
					item.resetSocket(socketWrapper);
					SettingUtility.setLastConnectedPrinterAddress(device.getAddress());
					AppLogger.e("connect with wrapper: connected");
				} catch (IOException ex) {
					AppLogger.e("exception to connect BT device:" + device.getName(), ex);
				}
			}
		});

		connectThread.start();
	}

	private Runnable socketErrorRunnable = new Runnable() {

		@Override
		public void run() {
			Toast.makeText(getApplicationContext(),
					"Cannot establish connection", Toast.LENGTH_SHORT).show();
			btAdapter.startDiscovery();

		}
	};

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		super.onCreateOptionsMenu(menu);

		menu.add(0, Menu.FIRST, Menu.NONE, "Refresh Scanning");

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