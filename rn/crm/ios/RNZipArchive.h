//
//  RNZipArchive.h
//  APTest
//
//  Created by admin on 2022/6/29.
//

#import "SSZipArchive/SSZipArchive.h"
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNZipArchive : RCTEventEmitter<RCTBridgeModule, SSZipArchiveDelegate>

@property (nonatomic) NSString *processedFilePath;
@property (nonatomic) float progress;
@property (nonatomic, copy) void (^progressHandler)(NSUInteger entryNumber, NSUInteger total);

@end
