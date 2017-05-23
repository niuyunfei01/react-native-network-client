package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
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

import java.util.ArrayList;
import java.util.HashMap;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.ListType;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.dao.NewOrderDao;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.adapter.MineItemsAdapter;

public class MineActivity extends AbstractActionBarActivity {

	static private final int REQUEST_ENABLE_BT = 0x1000;
	private static final int TYPE_PRINT_SETTINGS = 1;
	private static final int TYPE_VERSION_UPDATE = 2;
	private static final int TYPE_VERSION_LOGOUT = 3;
	private static final int TYPE_STORE_PERF = 4;
	private static final int TYPE_PROD_MANAGEMENT = 5;
	private static final int TYPE_ORDER_SEARCH = 6;
	public static final int TYPE_USER_ITEMS = 7;
	private static final int TYPE_QUALITY_CASE = 8;
	public static final int TYPE_ORDER_DELAYED = 9;
	private static final int TYPE_TOTAL_SCORE = 10;
	private static final int TYPE_SYNC_STATUS = 11;
	private static final int TYPE_STORE_SELF_STORAGE = 12;
	private static final int TYPE_ORDER_LIST = 13;
	public static final int TYPE_USER_COMPLAINS = 14;
	private static final int TYPE_PROVIDE_LIST = 15;
	private static final int TYPE_COMMENT_WM = 16;
	private static final int TYPE_COMMENT_SELF = 17;
	private MineItemsAdapter<MineItemsAdapter.PerformanceItem> listAdapter;
	private ListView listView;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		this.setContentView(R.layout.mine_lists);
		listView = (ListView) findViewById(R.id.nav_list);
        listAdapter = new MineItemsAdapter(this);
        this.listView.setAdapter(listAdapter);
		listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
			@Override
			public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
				Log.d(GlobalCtx.ORDERS_TAG, "list item view clicked");
				MineItemsAdapter.PerformanceItem item = listAdapter.getItem(position);
				String token = GlobalCtx.getApplication().getSpecialToken();
				if (item.getType() == TYPE_PRINT_SETTINGS) {
					startActivity(new Intent(getApplicationContext(), SettingsPrintActivity.class));
				} else if (item.getType() == TYPE_VERSION_UPDATE) {
					Intent intent = new Intent(Intent.ACTION_VIEW,
							Uri.parse("http://www.cainiaoshicai.cn/cc.apk"));
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
									GlobalCtx.getApplication().setAccountBean(null);
									startActivity(new Intent(getApplicationContext(), LoginActivity.class));
								}

							})
							.setNegativeButton(R.string.no, null)
							.show();
				} else if (item.getType() == TYPE_STORE_PERF) {
					gotoWeb(Utility.append_token(String.format("%s/worker_stats_by_day.html", URLHelper.getStoresPrefix()), token));
				} else if (item.getType() == TYPE_PROVIDE_LIST) {
					gotoWeb(Utility.append_token(String.format("%s/provide_req_all.html", URLHelper.getStoresPrefix()), token));
				} else if (item.getType() == TYPE_SYNC_STATUS) {
					Intent intent = new Intent(Intent.ACTION_VIEW,
							Uri.parse(GlobalCtx.getApplication().getUrl("sync_monitor.main") + "access_token=" + token));
					startActivity(intent);
				} else if (item.getType() == TYPE_USER_COMPLAINS) {
					GlobalCtx.getApplication().toFeedbackActivity(MineActivity.this);
				} else if (item.getType() == TYPE_PROD_MANAGEMENT) {
					gotoWeb(Utility.append_token(String.format("%s/products.html", URLHelper.getStoresPrefix()), token));
				} else if (item.getType() == TYPE_STORE_SELF_STORAGE) {
					startActivity(new Intent(getApplicationContext(), StoreStorageActivity.class));
				} else if (item.getType() == TYPE_QUALITY_CASE) {
					startActivity(new Intent(getApplicationContext(), QualityCaseActivity.class));
				} else if (item.getType() == TYPE_ORDER_SEARCH) {
					onSearchRequested();
				} else if (item.getType() == TYPE_TOTAL_SCORE) {
					MineActivity.this.startActivity(new Intent(getApplicationContext(), MonthPerfActivity.class));
				} else if (item.getType() == TYPE_ORDER_DELAYED) {
					MineActivity.this.startActivity(new Intent(getApplicationContext(), InTimeStatsActivity.class));
				} else if (item.getType() == TYPE_ORDER_LIST) {
					Intent intent = new Intent(getApplicationContext(), OrderQueryActivity.class);
					intent.putExtra("list_type", ListType.INVALID.getValue());
					MineActivity.this.startActivity(intent);
				} else if (item.getType() == TYPE_USER_ITEMS) {
					gotoWeb(Utility.append_token(String.format("%s/market_tools/users.html", URLHelper.WEB_URL_ROOT), token));
				} else if (item.getType() == TYPE_COMMENT_SELF) {
					gotoWeb(String.format("%s/stores/show_evaluations.html", URLHelper.WEB_URL_ROOT));
				} else if (item.getType() == TYPE_COMMENT_WM) {
					gotoWeb(String.format("%s/stores/show_waimai_evaluations.html", URLHelper.WEB_URL_ROOT));
				}
			}

			private void gotoWeb(String url) {
				GeneralWebViewActivity.gotoWeb(MineActivity.this, url);
			}
		});

		initPerformList(new HashMap<String, String>());

		new MyAsyncTask<Void,HashMap<String, String>, HashMap<String, String>>() {
			@Override
			protected HashMap<String, String> doInBackground(Void... params) {
				return new NewOrderDao(GlobalCtx.getInstance().getSpecialToken()).getStatMap();
			}

			@Override
			protected void onPostExecute(final HashMap<String, String> performStat) {
				MineActivity.this.runOnUiThread(new Runnable() {
					@Override
					public void run() {
						listAdapter.clear();
						initPerformList(performStat);
						listAdapter.notifyDataSetChanged();
					}
				});
			}
		}.executeOnNormal();
	}

	private void initPerformList(HashMap<String, String> performStat) {

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

		Double todayAvgReadyTime = null;

		try {
			todayAvgReadyTime = Double.valueOf(performStat.get("inTimeReadyRatioT"));
		} catch (Exception ignore) {
		}

		Double lastWeekAvgReadyTime = null;
		try {
			lastWeekAvgReadyTime = Double.valueOf(performStat.get("inTimeReadyRatioW"));
		} catch (Exception ignore) {
		}

		ArrayList<Object> inTimeParams = new ArrayList<>();
		StatInTime statInTime = new StatInTime(lastWeekInTimeRatio, todayInTimeRatio, lastWeekAvgReadyTime, todayAvgReadyTime);
		statInTime.setTotalLate(performStat.containsKey("totalLate") ? Integer.parseInt(performStat.get("totalLate")) : 0);
		statInTime.setTotalSeriousLate(performStat.containsKey("totalSeriousLate") ? Integer.parseInt(performStat.get("totalSeriousLate")) : 0);
		inTimeParams.add(statInTime);

		listAdapter.add(new MineItemsAdapter.PerformanceItem("准点率", -1, TYPE_ORDER_DELAYED, inTimeParams));
		listAdapter.add(new MineItemsAdapter.PerformanceItem("产品维护", -1, TYPE_PROD_MANAGEMENT, null));
		listAdapter.add(new MineItemsAdapter.PerformanceItem("门店商品管理", -1, TYPE_STORE_SELF_STORAGE, null));
		listAdapter.add(new MineItemsAdapter.PerformanceItem("全部调货单", -1, TYPE_PROVIDE_LIST, null));
		listAdapter.add(new MineItemsAdapter.PerformanceItem(String.format("业绩 今日送%s单 打包%s 本月送%s单", performStat.get("myShipTotalD"), performStat.get("myPackageTotalD"), performStat.get("myShipTotal")), -1 /*Integer.parseInt(performStat.userTalkStatus("globalLateTotalD"))*/, TYPE_STORE_PERF, null));
		listAdapter.add(new MineItemsAdapter.PerformanceItem("外卖评价", -1, TYPE_COMMENT_WM, null));
		listAdapter.add(new MineItemsAdapter.PerformanceItem("菜鸟评价", -1, TYPE_COMMENT_SELF, null));
		listAdapter.add(new MineItemsAdapter.PerformanceItem("客  户", -1, TYPE_USER_ITEMS, null));

		String versionDesc = getVersionDesc();

		listAdapter.add(new MineItemsAdapter.PerformanceItem("设  置", -1, TYPE_PRINT_SETTINGS, null));
		listAdapter.add(new MineItemsAdapter.PerformanceItem("无效订单", -1, TYPE_ORDER_LIST, null));
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
			return String.valueOf(verCode);
//			String version = pInfo.versionName;
//			versionDesc = version + "-" + verCode;
		} catch (PackageManager.NameNotFoundException e) {
			AppLogger.e("error to userTalkStatus package info:" + e.getMessage(), e);
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
				GlobalCtx.getApplication().toTaskListActivity(this);
				return true;
			case R.id.menu_search:
				this.onSearchRequested();
				return true;
			case R.id.menu_mine:
				return true;
			case R.id.menu_user_feedback:
				GlobalCtx.getApplication().toFeedbackActivity(MineActivity.this);
				return true;
			default:
				return super.onOptionsItemSelected(item);
		}
	}

	static public class StatInTime {
		public final Double inTimeRatioLastWeek;
		public final Double inTimeRatioToday;
		public final Double avgReadyTimeLastWeek;
		public final Double avgReadyTimeToday;
		private Integer totalLate;
		private Integer totalSeriousLate;

		public StatInTime(Double inTimeRatioLastWeek, Double inTimeRatioToday, Double avgReadyTimeLastWeek, Double avgReadyTimeToday) {
			this.inTimeRatioLastWeek = inTimeRatioLastWeek;
			this.inTimeRatioToday = inTimeRatioToday;
			this.avgReadyTimeLastWeek = avgReadyTimeLastWeek;
			this.avgReadyTimeToday = avgReadyTimeToday;
		}

		public Integer getTotalLate() {
			return totalLate;
		}

		public void setTotalLate(Integer totalLate) {
			this.totalLate = totalLate;
		}

		public Integer getTotalSeriousLate() {
			return totalSeriousLate;
		}

		public void setTotalSeriousLate(Integer totalSeriousLate) {
			this.totalSeriousLate = totalSeriousLate;
		}
	}
}