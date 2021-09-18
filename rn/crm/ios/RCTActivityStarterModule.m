//
//  RCTActivityStarterModule.m
//  APTest
//
//  Created by Liu Zhaoren on 2021/9/17.
//

#import <Foundation/Foundation.h>
#import "RCTActivityStarterModule.h"
#import <React/RCTLog.h>

@implementation RCTActivityStarterModule

// To export a module named RCTCalendarModule
RCT_EXPORT_MODULE(ActivityStarter);

RCT_EXPORT_METHOD(createCalendarEvent:(NSString *)name location:(NSString *)location)
{
 RCTLogInfo(@"Pretending to create an event %@ at %@", name, location);
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(getName)
{
return [[UIDevice currentDevice] name];
}

@end
