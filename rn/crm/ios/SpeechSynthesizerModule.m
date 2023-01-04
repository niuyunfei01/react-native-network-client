//
//  SpeechSynthesizerModule.m
//  wsb
//
//  Created by 汪志 on 2022/12/31.
//
#import "SpeechSynthesizerModule.h"
@implementation SpeechSynthesizerModule
RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
  return @[@"onSynthesizerSpeakCompletedEvent"]; //这里返回的将是你要发送的消息名的数组。
}
- (void)startObserving
{
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(emitEventInternal:)
                                               name:@"onSynthesizerSpeakCompletedEvent"
                                             object:nil];
}
- (void)stopObserving
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)emitEventInternal:(NSDictionary *)notification
{
  [self sendEventWithName:@"onSynthesizerSpeakCompletedEvent"
                     body:notification];
}

+ (void)emitEventWithName:(NSDictionary *)payload
{
  [[NSNotificationCenter defaultCenter] postNotificationName:@"onSynthesizerSpeakCompletedEvent"
                                                      object:self
                                                    userInfo:payload];
}
@end
