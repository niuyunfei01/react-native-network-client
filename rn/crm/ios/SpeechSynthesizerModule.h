#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <IFlyMSC/IFlyMSC.h>

@interface SpeechSynthesizerModule : RCTEventEmitter <RCTBridgeModule, IFlySpeechSynthesizerDelegate> {
    BOOL hasListeners;
}

@property (nonatomic, strong) IFlySpeechSynthesizer * iFlySpeechSynthesizer;
@property (nonatomic) NSTimeInterval startTime;
@property (nonatomic) NSTimeInterval endTime;
@property (nonatomic, strong) NSString * content;
@property (nonatomic, strong) NSString * filename;

@end

