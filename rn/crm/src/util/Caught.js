import React from 'react-native';
import stacktraceParser from 'stacktrace-parser';
// import _ from 'underscore';

/*
  * The instance of our singleton
  * Setting up block level variable to store class state
  * , set's to null by default.
*/
let instance = null;
let exceptionID = 0;

//exception report timeout
const timeoutPromise = new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, 1000);
});

const parseErrorStack = (error) => {
  if (!error || !error.stack) {
    return [];
  }
  return Array.isArray(error.stack) ? error.stack :
    stacktraceParser.parse(error.stack);
}


export default class Caught {

  /**
   * ## Constructor
   */
  constructor(props) {

    //Singleton pattern, see here(http://amanvirk.me/singleton-classes-in-es6/)
    if (!instance) {
      //Initializing singleton instance
      instance = this;

      //intercept react-native error handling
      if (ErrorUtils._globalHandler) {
        this.defaultHandler = ErrorUtils.getGlobalHandler && ErrorUtils.getGlobalHandler() || ErrorUtils._globalHandler;
        //feed errors directly to our wrapGlobalHandler function
        ErrorUtils.setGlobalHandler(this.wrapGlobalHandler.bind(this));
      }
    }

    return instance;
  }

  async wrapGlobalHandler(error, isFatal) {
    let currentExceptionID = ++exceptionID;
    const stack = parseErrorStack(error);
    //submit the exception to our native part
    // const reportExceptionPromise = native.reportException(error.message, stack, currentExceptionID, {}, isFatal);
    // return Promise.race([reportExceptionPromise, timeoutPromise])   //whatever finishes first
    //     .then(() => {  //afterwards call the default error handler
    //         this.defaultHandler(error, isFatal);
    //     });
  }

};
