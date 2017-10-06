'use strict';

export default  {
    focusNextInput(context,ref){
        if(context&&context.refs&&context.refs[ref]){
            context.refs[ref].focus();
        }
    },
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};