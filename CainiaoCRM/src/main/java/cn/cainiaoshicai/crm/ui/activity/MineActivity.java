package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.dao.NewOrderDao;
import cn.cainiaoshicai.crm.orders.domain.PerformStat;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.ui.adapter.MineItemsAdapter;

public class MineActivity extends ActionBarActivity {

	static private final int REQUEST_ENABLE_BT = 0x1000;
	private static final int TYPE_PRINT_SETTINGS = 1;
	private static final int TYPE_VERSION_UPDATE = 2;
	private static final int TYPE_VERSION_LOGOUT = 3;
	private static final int TYPE_STORE_PERF = 4;
	private static final int TYPE_STORE_STORAGE = 5;
	private static final int TYPE_ORDER_SEARCH = 6;
	private MineItemsAdapter listAdapter;
	private ListView listView;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		this.setContentView(R.layout.listview_btd_list);
		listView = (ListView) findViewById(android.R.id.list);
        listAdapter = new MineItemsAdapter(this, R.layout.listview_btd_list, R.id.text1, R.id.image1);
        this.listView.setAdapter(listAdapter);
		listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
			@Override
			public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
				Log.d(GlobalCtx.ORDERS_TAG, "list item view clicked");
				MineItemsAdapter.PerformanceItem item = (MineItemsAdapter.PerformanceItem) listAdapter.getItem(position);
				if (item.getType() == TYPE_PRINT_SETTINGS) {
					startActivity(new Intent(getApplicationContext(), BTDeviceListActivity.class));
				} else if (item.getType() == TYPE_VERSION_UPDATE) {
					Intent intent = new Intent(Intent.ACTION_VIEW,
							Uri.parse("http://www.cainiaoshicai.cn/CainiaoCRM-release.apk"));
					startActivity(intent);
				} else if (item.getType() == TYPE_VERSION_LOGOUT) {
					new AlertDialog.Builder(MineActivity.this)
							.setIcon(android.R.drawable.ic_dialog_alert)
							.setTitle(R.string.quit)
							.setMessage(R.string.really_quit)
							.setPositiveButton(R.string.yes, new DialogInterface.OnClickListener() {

								@Override
								public void onClick(DialogInterface dialog, int which) {
									SettingUtility.setDefaultAccountId("");
									startActivity(new Intent(getApplicationContext(), LoginActivity.class));
								}

							})
							.setNegativeButton(R.string.no, null)
							.show();
				} else if (item.getType() == TYPE_STORE_PERF) {
					startActivity(new Intent(getApplicationContext(), StorePerformActivity.class));
				} else if (item.getType() == TYPE_STORE_STORAGE) {
					startActivity(new Intent(getApplicationContext(), StoreStorageActivity.class));
				} else if (item.getType() == TYPE_ORDER_SEARCH) {
					onSearchRequested();
				}
			}
		});
		new MyAsyncTask<Void,PerformStat, PerformStat>() {

			@Override
			protected PerformStat doInBackground(Void... params) {
				return new NewOrderDao(GlobalCtx.getInstance().getSpecialToken()).getStat();
			}

			@Override
			protected void onPostExecute(PerformStat performStat) {
				initPerformList(performStat);
			}
		}.executeOnNormal();
	}

	private void initPerformList(PerformStat performStat) {
		listAdapter.add(new MineItemsAdapter.PerformanceItem("个人送单(今日)", performStat.getMyShipTotalD(), 0));
		listAdapter.add(new MineItemsAdapter.PerformanceItem("个人打包(今日)", performStat.getMyPackageTotalD(), 0));

		listAdapter.add(new MineItemsAdapter.PerformanceItem("个人送单(本月)", performStat.getMyShipTotal(), 0));
		listAdapter.add(new MineItemsAdapter.PerformanceItem("个人打包(本月)", performStat.getMyPackageTotal(), 0));

		listAdapter.add(new MineItemsAdapter.PerformanceItem("今日业绩", performStat.getGlobalLateTotalD(), TYPE_STORE_PERF));
		listAdapter.add(new MineItemsAdapter.PerformanceItem("全店延单(本月)", performStat.getGlobalLateTotal(), 0));

		listAdapter.add(new MineItemsAdapter.PerformanceItem("库存盘点", -1, TYPE_STORE_STORAGE));
		listAdapter.add(new MineItemsAdapter.PerformanceItem("订单搜索", -1, TYPE_ORDER_SEARCH));

		listAdapter.add(new MineItemsAdapter.PerformanceItem("打印设置", -1, TYPE_PRINT_SETTINGS));
		listAdapter.add(new MineItemsAdapter.PerformanceItem("版本更新", -1, TYPE_VERSION_UPDATE));
		listAdapter.add(new MineItemsAdapter.PerformanceItem("退出登录", -1, TYPE_VERSION_LOGOUT));
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate menu from menu resource (res/menu/print)
		getMenuInflater().inflate(R.menu.main, menu);

		return super.onCreateOptionsMenu(menu);
	}

	public boolean onOptionsItemSelected(MenuItem item) {
		// Handle item selection
		switch (item.getItemId()) {
			case R.id.menu_process:
				startActivity(new Intent(getApplicationContext(), MainActivity.class));
				return true;
			case R.id.menu_accept:
				startActivity(new Intent(getApplicationContext(), RemindersActivity.class));
				return true;
			case R.id.menu_search:
				this.onSearchRequested();
				return true;
			case R.id.menu_mine:
				return true;
			default:
				return super.onOptionsItemSelected(item);
		}
	}
}