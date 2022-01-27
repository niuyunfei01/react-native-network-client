#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

// 引入 JPush 功能所需头文件
#import <RCTJPushModule.h>
#import "IFlyMSC/IFlyMSC.h"
#ifdef NSFoundationVersionNumber_iOS_9_x_Max
#import <UserNotifications/UserNotifications.h>
#import "WXApi.h"
#import <React/RCTLinkingManager.h>
#endif

@class IFlySpeechSynthesizer;

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, JPUSHRegisterDelegate, WXApiDelegate, IFlySpeechSynthesizerDelegate>

@property (nonatomic, strong) IFlySpeechSynthesizer * iFlySpeechSynthesizer;
@property (nonatomic, strong) UIWindow *window;

@end
