//
//  IOSToReactNativeEventEmitter.h
//  APTest
//
//  Created by 汪志 on 2022/10/22.
//

#import <React/RCTEventEmitter.h>
@interface IOSToReactNativeEventEmitter : RCTEventEmitter <RCTBridgeModule>
+ (void)emitEventWithName:(NSString *)name andPayload:(NSDictionary *)payload;
@end
