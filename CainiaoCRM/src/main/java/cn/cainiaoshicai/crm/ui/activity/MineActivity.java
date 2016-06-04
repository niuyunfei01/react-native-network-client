package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
import android.app.SearchManager;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.dao.NewOrderDao;
import cn.cainiaoshicai.crm.orders.domain.PerformStat;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.ui.adapter.MineItemsAdapter;

public class MineActivity extends AbstractActionBarActivity {

	static private final int REQUEST_ENABLE_BT = 0x1000;
	private static final int TYPE_PRINT_SETTINGS = 1;
	private static final int TYPE_VERSION_UPDATE = 2;
	private static final int TYPE_VERSION_LOGOUT = 3;
	private static final int TYPE_STORE_PERF = 4;
	private static final int TYPE_STORE_STORAGE = 5;
	private static final int TYPE_ORDER_SEARCH = 6;
	private static final int TYPE_USER_COMMENTS = 7;
	private static final int TYPE_QUALITY_CASE = 8;
	public static final int TYPE_ORDER_DELAYED = 9;
	private static final int TYPE_TOTAL_SCORE = 10;
	private MineItemsAdapter<MineItemsAdapter.PerformanceItem> listAdapter;
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
				} else if (item.getType() == TYPE_USER_COMMENTS) {
					startActivity(new Intent(getApplicationContext(), UserCommentsActivity.class));
				} else if (item.getType() == TYPE_STORE_STORAGE) {
					startActivity(new Intent(getApplicationContext(), StoreStorageActivity.class));
				} else if (item.getType() == TYPE_QUALITY_CASE) {
					startActivity(new Intent(getApplicationContext(), QualityCaseActivity.class));
				} else if (item.getType() == TYPE_ORDER_SEARCH) {
					onSearchRequested();
				} else if (item.getType() == TYPE_TOTAL_SCORE) {
					MineActivity.this.startActivity(new Intent(getApplicationContext(), MonthPerfActivity.class));
				}
			}
		});
		new MyAsyncTask<Void,HashMap<String, String>, HashMap<String, String>>() {

			@Override
			protected HashMap<String, String> doInBackground(Void... params) {
				return new NewOrderDao(GlobalCtx.getInstance().getSpecialToken()).getStatMap();
			}

			@Override
			protected void onPostExecute(HashMap<String, String> performStat) {
				initPerformList(performStat);
			}
		}.executeOnNormal();
	}

	private void initPerformList(HashMap<String, String> performStat) {
		listAdapter.add(new MineItemsAdapter.PerformanceItem(String.format("本月积分 %s, 今日送单%s 打包%s", performStat.get("totalMonthScore"), performStat.get("myShipTotalD"), performStat.get("myPackageTotalD")), -1, TYPE_TOTAL_SCORE, null));

		listAdapter.add(new MineItemsAdapter.PerformanceItem("今日业绩", -1 /*Integer.parseInt(performStat.get("globalLateTotalD"))*/, TYPE_STORE_PERF, null));

		Double lastWeekInTimeRatio = null;
		try {
			lastWeekInTimeRatio = Double.valueOf(performStat.get("lastWeekInTimeRatio"));
		} catch (Exception ignored) {
		}
		Double todayInTimeRatio = null;
		try {
			todayInTimeRatio = Double.valueOf(performStat.get("todayInTimeRatio"));
		} catch (Exception ignored) {
		}

		Integer todayAvgReadyTime = null;

		try {
			todayAvgReadyTime = Integer.valueOf(performStat.get("todayAvgReadyTime"));
		} catch (Exception ignore) {
		}

		Integer lastWeekAvgReadyTime = 0;
		try {
			lastWeekAvgReadyTime = Integer.valueOf(performStat.get("lastWeekAvgReadyTime"));
		} catch (Exception ignore) {
		}

		ArrayList<Object> inTimeParams = new ArrayList<>();
		inTimeParams.add(new StatInTime(lastWeekInTimeRatio, todayInTimeRatio, lastWeekAvgReadyTime, todayAvgReadyTime));
		listAdapter.add(new MineItemsAdapter.PerformanceItem("准点率", -1, TYPE_ORDER_DELAYED, inTimeParams));

		listAdapter.add(new MineItemsAdapter.PerformanceItem("库存盘点", -1, TYPE_STORE_STORAGE, null));

		listAdapter.add(new MineItemsAdapter.PerformanceItem("用户评价", -1, TYPE_USER_COMMENTS, null));

		listAdapter.add(new MineItemsAdapter.PerformanceItem("案例跟踪", -1, TYPE_QUALITY_CASE, null));

		String versionDesc = getVersionDesc();

		listAdapter.add(new MineItemsAdapter.PerformanceItem("打印设置", -1, TYPE_PRINT_SETTINGS, null));
		listAdapter.add(new MineItemsAdapter.PerformanceItem(String.format("版本更新 (当前版本:%s)", versionDesc), -1, TYPE_VERSION_UPDATE, null));
		listAdapter.add(new MineItemsAdapter.PerformanceItem("退出登录", -1, TYPE_VERSION_LOGOUT, null));
	}

	@NonNull
	public String getVersionDesc() {
		String versionDesc = "unknown";
		try {
			PackageInfo pInfo;
			pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
			int verCode = pInfo.versionCode;
			String version = pInfo.versionName;
			versionDesc = version + "-" + verCode;
		} catch (PackageManager.NameNotFoundException e) {
			AppLogger.e("error to get package info:" + e.getMessage(), e);
		}
		return versionDesc;
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate menu from menu resource (res/menu/print)
		getMenuInflater().inflate(R.menu.main_menu, menu);

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

	static public class StatInTime {
		public final Double inTimeRatioLastWeek;
		public final Double inTimeRatioToday;
		public final Integer avgReadyTimeLastWeek;
		public final Integer avgReadyTimeToday;

		public StatInTime(Double inTimeRatioLastWeek, Double inTimeRatioToday, Integer avgReadyTimeLastWeek, Integer avgReadyTimeToday) {
			this.inTimeRatioLastWeek = inTimeRatioLastWeek;
			this.inTimeRatioToday = inTimeRatioToday;
			this.avgReadyTimeLastWeek = avgReadyTimeLastWeek;
			this.avgReadyTimeToday = avgReadyTimeToday;
		}
	}
}