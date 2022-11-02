//
//  IOSToReactNativeEventEmitter.m
//
//  Created by 汪志 on 2022/10/22.
//

#import "IOSToReactNativeEventEmitter.h"
#import "Constants.h"
@implementation IOSToReactNativeEventEmitter
RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
  return @[NotifyName]; //这里返回的将是你要发送的消息名的数组。
}
- (void)startObserving
{
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(emitEventInternal:)
                                               name:NotifyName
                                             object:nil];
}
- (void)stopObserving
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)emitEventInternal:(NSNotification *)notification
{
  [self sendEventWithName:NotifyName
                     body:notification.userInfo];
}

+ (void)emitEventWithName:(NSString *)name andPayload:(NSDictionary *)payload
{
  [[NSNotificationCenter defaultCenter] postNotificationName:name
                                                      object:self
                                                    userInfo:payload];
}
@end
