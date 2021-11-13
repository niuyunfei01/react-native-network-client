//
//  RCTActivityStarterModule.m
//  APTest
//
//  Created by Liu Zhaoren on 2021/9/17.
//

#import <Foundation/Foundation.h>
#import "RCTActivityStarterModule.h"
#import <React/RCTLog.h>

@implementation RCTActivityStarterModule

RCT_EXPORT_MODULE(ActivityStarter);

RCT_EXPORT_METHOD(createCalendarEvent:(NSString *)name location:(NSString *)location)
{
 RCTLogInfo(@"Pretending to create an event %@ at %@", name, location);
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(getName)
{
return [[UIDevice currentDevice] name];
}

RCT_EXPORT_METHOD(navigateToGoods) {
  RCTLogInfo(@"navigateToGoods");
}

RCT_EXPORT_METHOD(logout) {
//    SettingUtility.setDefaultAccountId("");
//    GlobalCtx.app().setAccountBean(null);
//    //Bootstrap.stopAlwaysOnService(GlobalCtx.app());
//    JPushInterface.deleteAlias(GlobalCtx.app(), (int) (System.currentTimeMillis() / 1000L));
  RCTLogInfo(@"logout");
}


RCT_EXPORT_METHOD(gotoPage:(NSString *)page) {
//    Context ctx = GlobalCtx.app().getCurrentRunningActivity();
//    if (ctx == null) {
//        ctx = GlobalCtx.app();
//    }
//    Intent intent = new Intent(ctx, GlobalCtx.app().pageToActivity(page).getClass());
//    ctx.startActivity(intent);
  RCTLogInfo(@"gotoPage");
}

RCT_EXPORT_METHOD(currentVersion: (RCTResponseSenderBlock)callback)
{
//  NSNumber *eventId = [NSNumber numberWithInt:123];
//  callback(@[[NSNull null], eventId]);
//    HashMap<String, String> m = new HashMap<>();
//    Context act = getReactApplicationContext().getApplicationContext();
//    if (act != null) {
//        m.put("version_code", Utility.getVersionCode(act));
//        m.put("version_name", Utility.getVersionName(act));
//    }
//    clb.invoke(DaoHelper.gson().toJson(m));
  RCTLogInfo(@"currentVersion");
}


RCT_EXPORT_METHOD(updateAfterTokenGot: (NSString *)token expiresInSeconds:(int) expiresInSeconds callback:(RCTResponseSenderBlock)callback) {
//    try {
//        LoginActivity.DBResult r = GlobalCtx.app().afterTokenUpdated(token, expiresInSeconds);
//        AccountBean ab = GlobalCtx.app().getAccountBean();
//
//        AppLogger.i("updateAfterTokenGot " + (ab == null ? "null" : ab.getInfo()));
//
//        if (ab != null && ab.getInfo() != null) {
//            callback.invoke(true, "ok", DaoHelper.gson().toJson(ab.getInfo()));
//        } else {
//            callback.invoke(false, "Account is null", null);
//        }
//
//        //Bootstrap.stopAlwaysOnService(GlobalCtx.app());
//
//        long store_id = SettingUtility.getListenerStore();
//        Map<String, String> serviceExtras = Maps.newHashMap();
//        String accessToken = "";
//        if (GlobalCtx.app().getAccountBean() != null) {
//            accessToken = GlobalCtx.app().getAccountBean().getAccess_token();
//        }
//        serviceExtras.put("accessToken", accessToken);
//        serviceExtras.put("storeId", store_id + "");
//        SettingHelper.setEditor(GlobalCtx.app(), "accessToken", accessToken);
//        SettingHelper.setEditor(GlobalCtx.app(), "storeId", store_id + "");
//        //Bootstrap.startAlwaysOnService(GlobalCtx.app(), "Crm", serviceExtras);
//    } catch (IOException | ServiceException e) {
//        e.printStackTrace();
//        String reason = e instanceof ServiceException ? ((ServiceException) e).getError() : "网络异常，稍后重试";
//        callback.invoke(false, reason, null);
//    }
  
  
  
  RCTLogInfo(@"updateAfterTokenGot");
}

RCT_EXPORT_METHOD(setCurrStoreId: (NSString*) currId callback:(RCTResponseSenderBlock)callback) {
//    try {
//        long selectedStoreId = Long.parseLong(currId);
//        if (selectedStoreId > 0) {
//            SettingUtility.setListenerStores(selectedStoreId);
//            callback.invoke(true, "ok:" + currId + "-" + System.currentTimeMillis(), null);
//        } else {
//            callback.invoke(false, "Account is null", null);
//        }
//    } catch (Exception e) {
//        e.printStackTrace();
//        callback.invoke(false, "exception:" + e.getMessage(), null);
//    }
  RCTLogInfo(@"setCurrStoreId");
}

RCT_EXPORT_METHOD(navigateToOrders) {
//    Context ctx = GlobalCtx.app().getCurrentRunningActivity();
//    if (ctx != null) {
//        Intent intent = new Intent(ctx, MainOrdersActivity.class);
//        ctx.startActivity(intent);
//    }
  RCTLogInfo(@"navigateToOrders");
}


RCT_EXPORT_METHOD(toSettings) {
//    Context activity = GlobalCtx.app().getCurrentRunningActivity();
//    if (activity != null) {
//        Intent intent = new Intent(activity, SettingsPrintActivity.class);
//        activity.startActivity(intent);
//    }
  RCTLogInfo(@"toSettings");
}

RCT_EXPORT_METHOD(toOrder: (NSString*) wm_id) {
//    Context activity = GlobalCtx.app().getCurrentRunningActivity();
//    if (activity != null) {
//        Intent intent = new Intent(activity, OrderSingleActivity.class);
//        intent.putExtra("order_id", Integer.parseInt(wm_id));
//        activity.startActivity(intent);
//    }
  RCTLogInfo(@"toSettings");
}

RCT_EXPORT_METHOD(toUserComments) {
//    Context activity = GlobalCtx.app().getCurrentRunningActivity();
//    if (activity != null) {
//        Intent intent = new Intent(activity, UserCommentsActivity.class);
//        activity.startActivity(intent);
//    }
  RCTLogInfo(@"toUserComments");
}

RCT_EXPORT_METHOD(ordersByMobileTimes: (NSString*)mobile times:(int)times) {
//    Context activity = GlobalCtx.app().getCurrentRunningActivity();
//    if (activity != null) {
//        Intent intent = new Intent(activity, OrderQueryActivity.class);
//        intent.setAction(Intent.ACTION_SEARCH);
//        intent.putExtra(SearchManager.QUERY, mobile);
//        intent.putExtra("times", times);
//        activity.startActivity(intent);
//    }
  RCTLogInfo(@"ordersByMobileTimes");
}

RCT_EXPORT_METHOD(searchOrders: (NSString*) term) {
//    Context activity = GlobalCtx.app().getCurrentRunningActivity();
//    if (activity != null) {
//        Intent intent = new Intent(activity, OrderQueryActivity.class);
//        intent.setAction(Intent.ACTION_SEARCH);
//
//        if ("invalid:".equals(term)) {
//            intent.putExtra("list_type", ListType.INVALID.getValue());
//        } else {
//            intent.putExtra(SearchManager.QUERY, term);
//        }
//
//        activity.startActivity(intent);
//    }
  RCTLogInfo(@"searchOrders");
}

RCT_EXPORT_METHOD(dialNumber: (NSString*)number) {
//    Context activity = GlobalCtx.app().getCurrentRunningActivity();
//    //商米设备不支持拨打电话
//    boolean supportSunMi = OrderPrinter.supportSunMiPrinter();
//    if (activity != null && !supportSunMi) {
//        Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + number));
//        activity.startActivity(intent);
//    }
  RCTLogInfo(@"dialNumber");
}

RCT_EXPORT_METHOD(getHost: (RCTResponseSenderBlock)callback) {
//    Context activity = GlobalCtx.app().getCurrentRunningActivity();
//    if (activity != null) {
//        callback.invoke(URLHelper.getHost());
//    }
  RCTLogInfo(@"getHost");
}

RCT_EXPORT_METHOD(getActivityName: (RCTResponseSenderBlock)callback) {
//    Context activity = GlobalCtx.app().getCurrentRunningActivity();
//    if (activity != null) {
//        callback.invoke(activity.getClass().getSimpleName());
//    }
  RCTLogInfo(@"getActivityName");
}

RCT_EXPORT_METHOD(clearScan: (NSString*) code callback:(RCTResponseSenderBlock)callback) {
//    GlobalCtx.ScanStatus ss = GlobalCtx.app().scanInfo();
//
//    try {
//        ss.clearCode(code);
//        callback.invoke(true);
//    } catch (Exception e) {
//        e.printStackTrace();
//    }
  RCTLogInfo(@"clearScan");
}

RCT_EXPORT_METHOD(listenScan: (RCTResponseSenderBlock)callback) {
//    GlobalCtx.ScanStatus ss = GlobalCtx.app().scanInfo();
//    List<Map<String, String>> results = ss.notConsumed();
//    ss.markTalking();
//    callback.invoke(true, DaoHelper.gson().toJson(results));
  RCTLogInfo(@"listenScan");
}


RCT_EXPORT_METHOD(speakText: (NSString*) text callback:(RCTResponseSenderBlock)callback) {
//    GlobalCtx.app().getSoundManager().play_by_xunfei(text);
//    clb.invoke(true, "");
  RCTLogInfo(@"speakText");
}

RCT_EXPORT_METHOD(reportRoute: (NSString*) routeName) {
   // GlobalCtx.app().logRouteTrace(routeName);
  RCTLogInfo(@"reportRoute");
}

RCT_EXPORT_METHOD(reportException:(NSString*) msg) {
//    GlobalCtx.app().handleUncaughtException(Thread.currentThread(), new Exception(msg));
  RCTLogInfo(@"reportException");
}

RCT_EXPORT_METHOD(playWarningSound) {
//    try{
//        GlobalCtx.app().getSoundManager().play_warning_order();
//    }catch (Exception e){
//
//    }
  RCTLogInfo(@"playWarningSound");
}

RCT_EXPORT_METHOD(printBtPrinter: (NSString*) orderJson callback:(RCTResponseSenderBlock)callback) {
//    Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
//    final Order o = gson.fromJson(orderJson, new TypeToken<Order>() {
//    }.getType());
//
//    ReactApplicationContext ctx = this.getReactApplicationContext();
//
//    if (!GlobalCtx.app().isConnectPrinter()) {
//        Intent intent = new Intent(ctx, SettingsPrintActivity.class);
//        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
//        ctx.startActivity(intent, new Bundle());
//        callback.invoke(false, "打印机未连接");
//        PrintQueue.getQueue(GlobalCtx.app()).addManual(o);
//    } else {
//        new MyAsyncTask<Void, Void, Void>() {
//            @Override
//            protected Void doInBackground(Void... params) {
//                PrintQueue.getQueue(GlobalCtx.app()).addManual(o);
//                return null;
//            }
//        }.executeOnNormal();
//    }
  RCTLogInfo(@"printBtPrinter");
}

RCT_EXPORT_METHOD(updatePidApplyPrice: (int) pid applyPrice:(int)applyPrice callback:(RCTResponseSenderBlock)callback)  {
//    boolean updated = GlobalCtx.app().updatePidApplyPrice(pid, applyPrice);
//    callback.invoke(updated, "");
  RCTLogInfo(@"updatePidApplyPrice");
}

RCT_EXPORT_METHOD(updatePidStorage: (int)pid storage:(float) storage callback:(RCTResponseSenderBlock)callback) {
//    boolean updated = GlobalCtx.app().updatePidStorage(pid, storage);
//    callback.invoke(updated, "");
  RCTLogInfo(@"updatePidStorage");
}

RCT_EXPORT_METHOD(printSmPrinter:(NSString*) orderJson callback:(RCTResponseSenderBlock)callback) {
//    Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
//    final Order o = gson.fromJson(orderJson, new TypeToken<Order>() {
//    }.getType());
//    int tryTimes = 3;
//    boolean success = false;
//    while (tryTimes > 0) {
//        AidlUtil.getInstance().connectPrinterService(this.getReactApplicationContext());
//        AidlUtil.getInstance().initPrinter();
//        boolean isEnable = GlobalCtx.smPrintIsEnable();
//        if (isEnable) {
//            AidlUtil.getInstance().initPrinter();
//            OrderPrinter.smPrintOrder(o);
//            success = true;
//            break;
//        }
//        tryTimes--;
//    }
//    if (!success) {
//        callback.invoke(false, "不支持该设备");
//    }
  RCTLogInfo(@"printSmPrinter");
}

RCT_EXPORT_METHOD(printInventoryOrder: (NSString*) orderJson callback:(RCTResponseSenderBlock)callback) {
//    Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
//    final SupplierOrder order = gson.fromJson(orderJson, new TypeToken<SupplierOrder>() {
//    }.getType());
//    int tryTimes = 3;
//    boolean success = false;
//
//    while (tryTimes > 0) {
//        AidlUtil.getInstance().connectPrinterService(this.getReactApplicationContext());
//        AidlUtil.getInstance().initPrinter();
//        boolean isEnable = GlobalCtx.smPrintIsEnable();
//        if (isEnable) {
//            AidlUtil.getInstance().initPrinter();
//            OrderPrinter.smPrintSupplierOrder(order);
//            success = true;
//            break;
//        }
//        tryTimes--;
//    }
//    if (!success) {
//        callback.invoke(false, "打印失败！");
//    }
//
  RCTLogInfo(@"printInventoryOrder");
}

RCT_EXPORT_METHOD(printSupplierSummaryOrder: (RCTResponseSenderBlock)callback) {
//    long nowTime = System.currentTimeMillis();
//    if (nowTime - mLastClickTime > TIME_INTERVAL) {
//        mLastClickTime = nowTime;
//        try {
//            int tryTimes = 3;
//            while (tryTimes > 0) {
//                AidlUtil.getInstance().connectPrinterService(this.getReactApplicationContext());
//                AidlUtil.getInstance().initPrinter();
//                boolean isEnable = GlobalCtx.smPrintIsEnable();
//                if (isEnable) {
//                    AidlUtil.getInstance().initPrinter();
//                }
//                tryTimes--;
//            }
//            Call<ResultBean<List<SupplierSummaryOrder>>> rbCall = GlobalCtx.app().dao.getSupplierOrderSummary();
//            rbCall.enqueue(new retrofit2.Callback<ResultBean<List<SupplierSummaryOrder>>>() {
//                @Override
//                public void onResponse(Call<ResultBean<List<SupplierSummaryOrder>>> call, Response<ResultBean<List<SupplierSummaryOrder>>> response) {
//                    ResultBean<List<SupplierSummaryOrder>> data = response.body();
//                    List<SupplierSummaryOrder> orders = data.getObj();
//                    for (SupplierSummaryOrder order : orders) {
//                        OrderPrinter.smPrintSupplierSummaryOrder(order);
//                    }
//                }
//
//                @Override
//                public void onFailure(Call<ResultBean<List<SupplierSummaryOrder>>> call, Throwable t) {
//                }
//            });
//        } catch (Exception e) {
//            android.util.Log.e("Error", e.getMessage());
//        }
//    } else {
//        try {
//            Toast.makeText(getReactApplicationContext(), "稍后重试", Toast.LENGTH_SHORT).show();
//        } catch (Exception e) {
//        }
//    }
  RCTLogInfo(@"printSupplierSummaryOrder");
}

RCT_EXPORT_METHOD(getActivityNameAsPromise: resolver:(RCTPromiseResolveBlock)resolve
                              rejecter:(RCTPromiseRejectBlock)reject) {
//    Context activity = GlobalCtx.app().getCurrentRunningActivity();
//    if (activity != null) {
//        promise.resolve(activity.getClass().getSimpleName());
//    }
  
  RCTLogInfo(@"getActivityNameAsPromise");
}

/**
 * @param mobile mobile could be null
 */
RCT_EXPORT_METHOD(gotoLoginWithNoHistory:(NSString* )mobile) {
//    Context act = GlobalCtx.app().getCurrentRunningActivity();
//    if (act != null) {
//        Intent intent = new Intent(act, LoginActivity.class);
//        if (!TextUtils.isEmpty(mobile)) {
//            intent.putExtra("mobile", mobile);
//        }
//        intent.addFlags(FLAG_ACTIVITY_CLEAR_TASK | FLAG_ACTIVITY_NEW_TASK);
//        act.startActivity(intent);
//    }
  
  RCTLogInfo(@"gotoLoginWithNoHistory");
}

RCT_EXPORT_METHOD(gotoActByUrl: (NSString* ) url) {
//    Context act = GlobalCtx.app().getCurrentRunningActivity();
//    if (act != null) {
//        Utility.handleUrlJump(act, null, url);
//    }
  RCTLogInfo(@"gotoActByUrl");
}

RCT_EXPORT_METHOD(callJavaScript) {
//    Activity activity = getCurrentActivity();
//    if (activity != null) {
//        ReactInstanceManager reactInstanceManager = GlobalCtx.app().getReactNativeHost().getReactInstanceManager();
//        ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
//        if (reactContext != null) {
//            CatalystInstance catalystInstance = reactContext.getCatalystInstance();
//            WritableNativeArray params = new WritableNativeArray();
//            params.pushString("Hello, JavaScript!");
//            catalystInstance.callFunction("JavaScriptVisibleToJava", "alert", params);
//        }
//    }
  RCTLogInfo(@"callJavaScript");
}

RCT_EXPORT_METHOD(navigateToNativeActivity: (NSString* )activityName putStack:(bool)putStack jsonData:(NSString* ) jsonData) {
//    Activity activity = getCurrentActivity();
//    if (activity != null) {
//        Class<?> cls = null;
//        try {
//            cls = Class.forName(activityName);
//            Intent intent = new Intent(activity, cls);
//            if (!putStack) {
//                intent.setFlags(intent.getFlags() | Intent.FLAG_ACTIVITY_NO_HISTORY);
//            }
//            Bundle bundle = new Bundle();
//            bundle.putString("jsonData", jsonData);
//            intent.putExtras(bundle);
//            activity.startActivity(intent);
//        } catch (ClassNotFoundException e) {
//            e.printStackTrace();
//        }
//    }
  RCTLogInfo(@"navigateToNativeActivity");
}

RCT_EXPORT_METHOD(nativeBack) {
//    final Activity activity = getCurrentActivity();
//    if (activity != null) {
//        final FragmentManager fm = activity.getFragmentManager();
//        if (fm.getBackStackEntryCount() > 0) {
//            activity.runOnUiThread(() -> {
//                Log.i("MainActivity popping backstack");
//                fm.popBackStack();
//            });
//        } else {
//            activity.runOnUiThread(new Runnable() {
//                @Override
//                public void run() {
//                    Log.i("MainActivity nothing on backstack, calling super");
//                    activity.onBackPressed();
//                }
//            });
//        }
//    }
  RCTLogInfo(@"nativeBack");
}

RCT_EXPORT_METHOD(navigateToRnView: (NSString*) action params:(NSString*) params) {
//    final Activity activity = getCurrentActivity();
//    if (activity != null) {
//        Gson gson = new Gson();
//        Map<String, String> p = gson.fromJson(params, Map.class);
//        GlobalCtx.app().toRnView(activity, action, p);
//    }
  RCTLogInfo(@"navigateToRnView");
}

RCT_EXPORT_METHOD(setDisableSoundNotify:(bool)disabled callback:(RCTResponseSenderBlock)callback) {
//    Log.i("setDisableSoundNotify:" + disabled);
//    SettingUtility.setDisableSoundNotify(disabled);
  RCTLogInfo(@"setDisableSoundNotify");
}

RCT_EXPORT_METHOD(getDisableSoundNotify: (RCTResponseSenderBlock)callback) {
//    boolean disabled = SettingUtility.isDisableSoundNotify();
//    Log.i("getDisableSoundNotify:" + disabled);
//    callback.invoke(disabled, "");
  RCTLogInfo(@"getDisableSoundNotify");
}

RCT_EXPORT_METHOD(setDisabledNewOrderNotify: (bool)disabled callback:(RCTResponseSenderBlock)callback) {
//    Log.i("setNewOrderNotifyDisabled:" + disabled);
//    SettingUtility.setDisableNewOrderSoundNotify(disabled);
  RCTLogInfo(@"setDisabledNewOrderNotify");
}

RCT_EXPORT_METHOD(getNewOrderNotifyDisabled: (RCTResponseSenderBlock)callback) {
//    boolean disabled = SettingUtility.isDisableNewOrderSoundNotify();
//    Log.i("getNewOrderNotifyDisabled:" + disabled);
//    callback.invoke(disabled, "");
  RCTLogInfo(@"getNewOrderNotifyDisabled");
}

RCT_EXPORT_METHOD(setAutoBluePrint: (bool) autoPrint callback:(RCTResponseSenderBlock)callback) {
//    Log.i("setAutoBluePrint:" + autoPrint);
//    SettingUtility.setAutoPrint(autoPrint);
  RCTLogInfo(@"setAutoBluePrint");
}

RCT_EXPORT_METHOD(getAutoBluePrint:(RCTResponseSenderBlock)callback) {
//    boolean auto = SettingUtility.getAutoPrintSetting();
//    Log.i("getAutoBluePrint:" + auto);
//    callback.invoke(auto, "");
  RCTLogInfo(@"getAutoBluePrint");
}

RCT_EXPORT_METHOD(showInputMethod) {
//    final Activity activity = getCurrentActivity();
//    InputMethodManager imm = (InputMethodManager) activity.getSystemService(Context.INPUT_METHOD_SERVICE);
//    imm.toggleSoftInput(InputMethodManager.SHOW_FORCED, 0);
  RCTLogInfo(@"showInputMethod");
}


@end
