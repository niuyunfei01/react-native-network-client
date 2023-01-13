#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

// 引入 JPush 功能所需头文件
#import <RCTJPushModule.h>
#ifdef NSFoundationVersionNumber_iOS_9_x_Max
#import <UserNotifications/UserNotifications.h>
#import "WXApi.h"
#import <React/RCTLinkingManager.h>
#endif
#import "IFlyMSC/IFlyMSC.h"
@class IFlySpeechSynthesizer;
@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, JPUSHRegisterDelegate, WXApiDelegate, IFlySpeechSynthesizerDelegate>

@property (nonatomic, strong) UIWindow * _Nonnull window;
@property (nonatomic, strong) IFlySpeechSynthesizer * _Nonnull iFlySpeechSynthesizer;
@property (nonatomic, strong) NSMutableArray<NSDictionary *> * _Nullable _notificationQueue;

@end
