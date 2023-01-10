#import <React/RCTEventEmitter.h>
#import <NewRelic/NewRelic.h>
#import "AppDelegate.h"
#import "SpeechSynthesizerModule.h"
#import "IFlyMSC/IFlyMSC.h"
#import "RNSplashScreen.h"  // 添加这一句
// 引入 JPush 功能所需头文件
#import <RCTJPushModule.h>
#import <AMapFoundationKit/AMapFoundationKit.h>
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

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

  [NewRelic startWithApplicationToken:@"AAd59d490bf07d0a6872263cb0bca7c7dad2277240-NRMA"];
  [AMapServices sharedServices].apiKey = @"48148de470831f4155abda953888a487";
#ifdef FB_SONARKIT_ENABLED
  InitializeFlipper(application);
#endif

//  [JPUSHService setupWithOption:launchOptions appKey:@"30073ab80a50534d39c84d3c"
//                        channel:@"app_store"
//               apsForProduction:YES
//          advertisingIdentifier:nil];
  JPUSHRegisterEntity *entity = [[JPUSHRegisterEntity alloc] init];
  if (@available(iOS 12.0, *)) {
    entity.types = JPAuthorizationOptionAlert | JPAuthorizationOptionBadge | JPAuthorizationOptionSound | JPAuthorizationOptionProvidesAppNotificationSettings;
  }
  [JPUSHService registerForRemoteNotificationConfig:entity delegate:self];
  [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
//
//  // 自定义消息
  NSNotificationCenter *defaultCenter = [NSNotificationCenter defaultCenter];
  [defaultCenter addObserver:self selector:@selector(networkDidReceiveMessage:) name:kJPFNetworkDidReceiveMessageNotification object:nil];

//  [JPUSHService registrationIDCompletionHandler:^(int resCode, NSString *registrationID) {
//    NSLog(@"resCode : %d,registrationID: %@", resCode, registrationID);
//  }];


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
  [IFlySetting showLogcat:NO];
  NSString *initString = [[NSString alloc] initWithFormat:@"appid=%@", @"58b571b2"];
  [IFlySpeechUtility createUtility:initString];

    //TTS singleton
  self.iFlySpeechSynthesizer = [IFlySpeechSynthesizer sharedInstance];

  self.iFlySpeechSynthesizer.delegate = self;
  [self.iFlySpeechSynthesizer setParameter:[IFlySpeechConstant TYPE_CLOUD]
                                    forKey:[IFlySpeechConstant ENGINE_TYPE]];
  self._notificationQueue = [NSMutableArray new];
  [RNSplashScreen show];  // 添加这一句，这一句一定要在最后
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else

  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,NSUserDomainMask, YES);
  NSString *docDir = [paths objectAtIndex:0];
  NSDictionary *infoDictionary = [[NSBundle mainBundle] infoDictionary];//获取app版本信息
  NSString *app_build = [infoDictionary objectForKey:@"CFBundleVersion"];
  NSString *pathString = [NSString stringWithFormat:@"/last.ios/%@.ios.bundle",app_build];
  NSString *bundlePath = [docDir stringByAppendingPathComponent:pathString];
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

UIBackgroundTaskIdentifier _bgTaskId;

//app进入后台后保持运行
- (void)beginTask {
  if(isBackground)
    {
//      NSLog(@"开启后台");
      _bgTaskId = [[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:^{
          //如果在系统规定时间3分钟内任务还没有完成，在时间到之前会调用到这个方法
          [self endBack];
      }];
    }
}
bool isBackground=false;
-(void)applicationDidEnterBackground:(UIApplication *)application{
  isBackground=true;
}
- (void)applicationWillEnterForeground:(UIApplication *)application {
  // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
//  [JPUSHService setBadge:0];
  isBackground=false;
  [[UIApplication sharedApplication] setApplicationIconBadgeNumber:1];
  [[UIApplication sharedApplication] setApplicationIconBadgeNumber:0];
  [self endBack];

}

//结束后台运行，让app挂起
- (void)endBack {
  if(isBackground)
    {
      //切记endBackgroundTask要和beginBackgroundTaskWithExpirationHandler成对出现
      [[UIApplication sharedApplication] endBackgroundTask:_bgTaskId];
//      NSLog(@"结束后台");
    }
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  //Optional
//   NSLog(@"did Fail To Register For Remote Notifications With Error: %@", error);
}

- (void) onCompleted: (IFlySpeechError *)error {
  [self endBack];
  
  NSMutableDictionary * result = [NSMutableDictionary new];
  if (error != nil) {
    result[@"error"] = @{
                        @"errorCode": [NSNumber numberWithInt: error.errorCode],
                        @"errorType": [NSNumber numberWithInt: error.errorType],
                        @"errorDesc": error.errorDesc,
                        };
//    NSLog(@"播放错误:%@",result[@"error"]);
  }
  
  NSUInteger length = [self._notificationQueue count];
//  NSLog(@"播放队列长度:%lu",(unsigned long)length);
  
  if(length > 0){
    NSDictionary *pushMessageInfo = [self._notificationQueue objectAtIndex:0];
//    NSLog(@"onCompleted 播放语音队列:%@",pushMessageInfo);
    [self._notificationQueue removeObjectAtIndex:0];
    [self addPushMessage:pushMessageInfo];
  }

  [SpeechSynthesizerModule emitEventWithName: @{@"success":@"1"}];
}

- (void)addPushMessage:(NSDictionary *)pushMessageInfo{
  if ([self.iFlySpeechSynthesizer isSpeaking]) {
//    NSLog(@"正在播放，添加到播放队列中");
    [self._notificationQueue addObject:pushMessageInfo];
    return;
  }
  [self beginTask];//开启后台任务
  NSString *speakWord = [pushMessageInfo objectForKey:@"speak_word"];
  
//  NSLog(@"addPushMessage 播放语音:%@",speakWord);
  [self.iFlySpeechSynthesizer startSpeaking:speakWord];
}

//iOS 7 APNS
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  
  [JPUSHService handleRemoteNotification:userInfo];
  NSString *speakWord = [userInfo objectForKey:@"speak_word"];
  if (speakWord != nil) {
    
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setActive:YES error:nil];
    [session setCategory:AVAudioSessionCategoryPlayback
             withOptions:AVAudioSessionCategoryOptionMixWithOthers | AVAudioSessionCategoryOptionDuckOthers | AVAudioSessionCategoryOptionAllowAirPlay | AVAudioSessionCategoryOptionAllowBluetooth
                   error:nil];
    [session setMode:AVAudioSessionModeSpokenAudio error:nil];
    [self addPushMessage:userInfo];
    }
    [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_ARRIVED_EVENT object:userInfo];
    completionHandler(UIBackgroundFetchResultNewData);
}

//iOS 10 前台收到消息
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center  willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(NSInteger))completionHandler {
  
  NSDictionary * userInfo = notification.request.content.userInfo;
  
  if([notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    // Apns
    
    [JPUSHService handleRemoteNotification:userInfo];
  }
  else {
    // 本地通知 todo
  
    [[NSNotificationCenter defaultCenter] postNotificationName:J_LOCAL_NOTIFICATION_ARRIVED_EVENT object:userInfo];
  }
  //需要执行这个方法，选择是否提醒用户，有 Badge、Sound、Alert 三种类型可以选择设置
  completionHandler(UNNotificationPresentationOptionAlert);
}


- (void)jpushNotificationAuthorization:(JPAuthorizationStatus)status withInfo:(NSDictionary *)info {
//    NSLog(@"jpushNotificationAuthorization");
}

//iOS 10 消息事件回调
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
    NSDictionary *userInfo = response.notification.request.content.userInfo;

    if ([response.notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
        // Apns
        NSLog(@"iOS 10 APNS 消息事件回调");
        [JPUSHService handleRemoteNotification:userInfo];
        // 保障应用被杀死状态下，用户点击推送消息，打开app后可以收到点击通知事件
        [[RCTJPushEventQueue sharedInstance]._notificationQueue insertObject:userInfo atIndex:0];
        [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_OPENED_EVENT object:userInfo];

    } else {
//        NSLog(@"iOS 10 本地通知 消息事件回调");
        // 保障应用被杀死状态下，用户点击推送消息，打开app后可以收到点击通知事件
        [[RCTJPushEventQueue sharedInstance]._localNotificationQueue insertObject:userInfo atIndex:0];
        [[NSNotificationCenter defaultCenter] postNotificationName:J_LOCAL_NOTIFICATION_OPENED_EVENT object:userInfo];

    }
    // 系统要求执行这个方法
    completionHandler();
}

//自定义消息
- (void)networkDidReceiveMessage:(NSNotification *)notification {
    NSDictionary *userInfo = [notification userInfo];
    [[NSNotificationCenter defaultCenter] postNotificationName:J_CUSTOM_NOTIFICATION_EVENT object:userInfo];
}

- (BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url {
    return [WXApi handleOpenURL:url delegate:self];
}

- (BOOL) application:(UIApplication *)application
continueUserActivity:(NSUserActivity *)userActivity
  restorationHandler:(void (^)(NSArray<id <UIUserActivityRestoring>> *__nullable
  restorableObjects))restorationHandler {
    // 触发回调方法
    [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];

//    NSLog(@"userActivity: %@, application: %@, restoreHandler: %@", userActivity, application, restorationHandler);
    return [WXApi handleOpenUniversalLink:userActivity delegate:self];
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
            options:(NSDictionary<NSString *, id> *)options {
    // Triggers a callback event.
    // 触发回调事件
//    NSLog(@"url: %@, application: %@, options: %@", url, application, options);
    [RCTLinkingManager application:application openURL:url options:options];
    return [WXApi handleOpenURL:url delegate:self];
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication
         annotation:(id)annotation {
//    NSLog(@"url: %@, sourceApplication: %@", url, sourceApplication);
    return [RCTLinkingManager application:application openURL:url
                        sourceApplication:sourceApplication annotation:annotation];
}

@end
