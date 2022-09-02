#import <NewRelic/NewRelic.h>
#import "AppDelegate.h"
// 引入 JPush 功能所需头文件
#import <RCTJPushModule.h>
#import "IFlyMSC/IFlyMSC.h"
#import <AMapFoundationKit/AMapFoundationKit.h>
#import "Definition.h"
#import "TTSConfig.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>

#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>
// iOS10 注册 APNs 所需头文件
#ifdef NSFoundationVersionNumber_iOS_9_x_Max
#import <UserNotifications/UserNotifications.h>
#endif

static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{

  //Set log level
  [IFlySetting setLogFile:LVL_ALL];

  //Set whether to output log messages in Xcode console
  [IFlySetting showLogcat:YES];

  //Set the local storage path of SDK
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
  NSString *cachePath = [paths objectAtIndex:0];
  [IFlySetting setLogFilePath:cachePath];

  NSString *initString = [[NSString alloc] initWithFormat:@"appid=%@",APPID_VALUE];
  [IFlySpeechUtility createUtility:initString];

  //TTS singleton
  if (self.iFlySpeechSynthesizer == nil) {
      self.iFlySpeechSynthesizer = [IFlySpeechSynthesizer sharedInstance];
  }

  self.iFlySpeechSynthesizer.delegate = self;
  [self.iFlySpeechSynthesizer setParameter:[IFlySpeechConstant TYPE_CLOUD]
   forKey:[IFlySpeechConstant ENGINE_TYPE]];

  [NewRelic startWithApplicationToken:@"AAd59d490bf07d0a6872263cb0bca7c7dad2277240-NRMA"];
  [AMapServices sharedServices].apiKey = @"48148de470831f4155abda953888a487";
#ifdef FB_SONARKIT_ENABLED
  InitializeFlipper(application);
#endif

  [JPUSHService setupWithOption:launchOptions appKey:@"30073ab80a50534d39c84d3c"
                        channel:@"app_store"
               apsForProduction:YES
          advertisingIdentifier:nil];
  JPUSHRegisterEntity * entity = [[JPUSHRegisterEntity alloc] init];
    if (@available(iOS 12.0, *)) {
      entity.types = JPAuthorizationOptionAlert|JPAuthorizationOptionBadge|JPAuthorizationOptionSound|JPAuthorizationOptionProvidesAppNotificationSettings;
    }
  [JPUSHService registerForRemoteNotificationConfig:entity delegate:self];
  [launchOptions objectForKey: UIApplicationLaunchOptionsRemoteNotificationKey];

  // 自定义消息
  NSNotificationCenter *defaultCenter = [NSNotificationCenter defaultCenter];
  [defaultCenter addObserver:self selector:@selector(networkDidReceiveMessage:) name:kJPFNetworkDidReceiveMessageNotification object:nil];

  [JPUSHService registrationIDCompletionHandler:^(int resCode, NSString *registrationID) {
      NSLog(@"resCode : %d,registrationID: %@",resCode,registrationID);
  }];


  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"crm"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG

 return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,NSUserDomainMask, YES);
  NSString *docDir = [paths objectAtIndex:0];
  NSString *bundlePath = [docDir stringByAppendingPathComponent:@"/last.ios/last.ios.bundle"];
  NSFileManager *fileManager = [NSFileManager defaultManager];
  if([fileManager fileExistsAtPath:bundlePath])
  {
    return [NSURL URLWithString:bundlePath];
  }
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (void)application:(UIApplication *)application
didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {

  /// Required - 注册 DeviceToken
  [JPUSHService registerDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  //Optional
  NSLog(@"did Fail To Register For Remote Notifications With Error: %@", error);
}
//iOS 7 APNS
- (void)application:(UIApplication *)application didReceiveRemoteNotification:  (NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  // iOS 10 以下 Required
  NSLog(@"iOS 7 APNS");
  [JPUSHService handleRemoteNotification:userInfo];
  [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_ARRIVED_EVENT object:userInfo];
  completionHandler(UIBackgroundFetchResultNewData);
}

//iOS 10 前台收到消息
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center  willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(NSInteger))completionHandler {

  NSDictionary * userInfo = notification.request.content.userInfo;
  UNNotificationRequest *request = notification.request; // 收到推送的请求
  UNNotificationContent *content = request.content; // 收到推送的消息内容

  NSNumber *badge = content.badge;  // 推送消息的角标
  NSString *body = content.body;    // 推送消息体
  UNNotificationSound *sound = content.sound;  // 推送消息的声音
  NSString *subtitle = content.subtitle;  // 推送消息的副标题
  NSString *title = content.title;  // 推送消息的标题

  NSString *speakWord = [userInfo objectForKey:@"speak_word"];
  if(speakWord != nil) {
    [self.iFlySpeechSynthesizer startSpeaking:speakWord];
  }

  NSLog(@"iOS10 前台收到通知:{\nbody:%@，\ntitle:%@,\nsubtitle:%@,\nbadge：%@，\nsound：%@，\nuserInfo：%@\n}",body,title,subtitle,badge,sound,userInfo);

  if([notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    // Apns
    NSLog(@"iOS 10 APNS 前台收到消息");
    [JPUSHService handleRemoteNotification:userInfo];
    [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_ARRIVED_EVENT object:userInfo];
  }
  else {
    // 本地通知 todo
    NSLog(@"iOS 10 本地通知 前台收到消息");
    [[NSNotificationCenter defaultCenter] postNotificationName:J_LOCAL_NOTIFICATION_ARRIVED_EVENT object:userInfo];
  }
  //需要执行这个方法，选择是否提醒用户，有 Badge、Sound、Alert 三种类型可以选择设置
  completionHandler(UNNotificationPresentationOptionAlert);
}


- (void)jpushNotificationAuthorization:(JPAuthorizationStatus)status withInfo:(NSDictionary *)info {
    NSLog(@"jpushNotificationAuthorization");
}

//iOS 10 消息事件回调
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler: (void (^)(void))completionHandler {
  NSDictionary * userInfo = response.notification.request.content.userInfo;

  UNNotificationRequest *request = response.notification.request; // 收到推送的请求
  UNNotificationContent *content = request.content; // 收到推送的消息内容

  NSNumber *badge = content.badge;  // 推送消息的角标
  NSString *body = content.body;    // 推送消息体
  UNNotificationSound *sound = content.sound;  // 推送消息的声音
  NSString *subtitle = content.subtitle;  // 推送消息的副标题
  NSString *title = content.title;  // 推送消息的标题

  if([response.notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    // Apns
    NSLog(@"iOS 10 APNS 消息事件回调");
    [JPUSHService handleRemoteNotification:userInfo];
    // 保障应用被杀死状态下，用户点击推送消息，打开app后可以收到点击通知事件
    [[RCTJPushEventQueue sharedInstance]._notificationQueue insertObject:userInfo atIndex:0];
    [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_OPENED_EVENT object:userInfo];

    NSString *speakWord = [userInfo objectForKey:@"speak_word"];
    if(speakWord != nil) {
      [self.iFlySpeechSynthesizer startSpeaking:speakWord];
    }

    // 判断为本地通知
    NSLog(@"iOS10 收到远程通知:{\nbody:%@，\ntitle:%@,\nsubtitle:%@,\nbadge：%@，\nsound：%@，\nuserInfo：%@\n}",body,title,subtitle,badge,sound,userInfo);
  }
  else {
    // 本地通知
    NSLog(@"iOS 10 本地通知 消息事件回调");
    // 保障应用被杀死状态下，用户点击推送消息，打开app后可以收到点击通知事件
    [[RCTJPushEventQueue sharedInstance]._localNotificationQueue insertObject:userInfo atIndex:0];
    [[NSNotificationCenter defaultCenter] postNotificationName:J_LOCAL_NOTIFICATION_OPENED_EVENT object:userInfo];

    // 判断为本地通知
    NSLog(@"iOS10 收到本地通知:{\nbody:%@，\ntitle:%@,\nsubtitle:%@,\nbadge：%@，\nsound：%@，\nuserInfo：%@\n}",body,title,subtitle,badge,sound,userInfo);
  }
  // 系统要求执行这个方法
  completionHandler();
}

//自定义消息
- (void)networkDidReceiveMessage:(NSNotification *)notification {
  NSDictionary * userInfo = [notification userInfo];
  [[NSNotificationCenter defaultCenter] postNotificationName:J_CUSTOM_NOTIFICATION_EVENT object:userInfo];
}

- (BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url {
    return  [WXApi handleOpenURL:url delegate:self];
}

- (BOOL)application:(UIApplication *)application
  continueUserActivity:(NSUserActivity *)userActivity
  restorationHandler:(void(^)(NSArray<id<UIUserActivityRestoring>> * __nullable
  restorableObjects))restorationHandler {
  // 触发回调方法
  [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];

  NSLog(@"userActivity: %@, application: %@, restoreHandler: %@", userActivity, application, restorationHandler);
  return [WXApi handleOpenUniversalLink:userActivity delegate:self];
}
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
            options:(NSDictionary<NSString*, id> *)options
{
  // Triggers a callback event.
  // 触发回调事件
  NSLog(@"url: %@, application: %@, options: %@", url, application, options);
  [RCTLinkingManager application:application openURL:url options:options];
  return [WXApi handleOpenURL:url delegate:self];
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication
         annotation:(id)annotation
{
  NSLog(@"url: %@, sourceApplication: %@", url, sourceApplication);
  return [RCTLinkingManager application:application openURL:url
                      sourceApplication:sourceApplication annotation:annotation];
}

#pragma mark - IFlySpeechSynthesizerDelegate

/**
 callback of starting playing
 Notice：
    Only apply to normal TTS
 **/
- (void)onSpeakBegin
{
    NSLog(@"Speak begin");
}



/**
 callback of buffer progress
 Notice：
    Only apply to normal TTS
 **/
- (void)onBufferProgress:(int) progress message:(NSString *)msg
{
    NSLog(@"buffer progress %2d%%. msg: %@.", progress, msg);
}




/**
 callback of playback progress
 Notice：
    Only apply to normal TTS
 **/
- (void) onSpeakProgress:(int) progress beginPos:(int)beginPos endPos:(int)endPos
{
    NSLog(@"speak progress %2d%%, beginPos=%d, endPos=%d", progress,beginPos,endPos);
}


/**
 callback of pausing player
 Notice：
    Only apply to normal TTS
 **/
- (void)onSpeakPaused
{
    NSLog(@"speak paused");
}


/**
 callback of TTS completion
 **/
- (void)onCompleted:(IFlySpeechError *) error
{
    NSLog(@"%s,error=%d",__func__,error.errorCode);

    if (error.errorCode ==10102) {
        NSLog(@"%s,errorCode:%d",__func__,error.errorCode);
    }
    if (error.errorCode != 0) {
      //  [_popUpView showText:[NSString stringWithFormat:@"Error Code:%d",error.errorCode]];
        if(error.errorCode==10102){
            NSLog(@"%s,errorCode:%d",__func__,error.errorCode);
        }
        return;
    }

  NSLog(@"onCompleted");
}
@end
