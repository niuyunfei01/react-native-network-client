//
//  Restart.m
//  APTest
//
//  Created by admin on 2022/6/29.
//

#import "Restart.h"

@implementation Restart

RCT_EXPORT_MODULE(RNRestart)

- (void)loadBundle
{
    RCTTriggerReloadCommandListeners(@"react-native-restart: Restart");
}

RCT_EXPORT_METHOD(Restart) {
    if ([NSThread isMainThread]) {
        [self loadBundle];
    } else {
        dispatch_sync(dispatch_get_main_queue(), ^{
            [self loadBundle];
        });
    }
    return;
}

@end
