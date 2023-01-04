//
//  SpeechSynthesizerModule.h
//  wsb
//
//  Created by 汪志 on 2022/12/31.
//

#ifndef SpeechSynthesizerModule_h
#define SpeechSynthesizerModule_h

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
@interface SpeechSynthesizerModule : RCTEventEmitter <RCTBridgeModule>
+ (void)emitEventWithName: (NSDictionary *)payload;
@end

#endif /* SpeechSynthesizerModule_h */
