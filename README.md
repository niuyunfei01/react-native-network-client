
编译和调试 RN
===================================

RN放在一个单独的目录下，可使用 Webstorm 或者其他工具单独编辑和调试。 在release 时，需要先将 release 输出到 src/main/assets 目录下。

调试
------------

 1. 在 rn/crm 下运行 npm start
 2. 在手机或者模拟器上设置调试端口 xxxx:8081

This Activity extends from ActionBarActivity, which provides all of the function 
necessary to display a compatible Action Bar on devices running Android v2.1+.
A custom application theme and styles are defined in XML.

Assets have been generated using the ['Android Action Bar Style Generator'][2].

[1]: http://developer.android.com/tools/support-com.andexert.calendarlistview.library/
[2]: http://jgilfelt.github.io/android-actionbarstylegenerator

发布
--------------

```
cd rn/crm

react-native bundle --platform android --dev false --entry-file index.android.js \
--bundle-output ../../CainiaoCRM/src/main/assets/index.android.bundle \
--sourcemap-output ../../CainiaoCRM/src/main/assets/index.android.map \
--assets-dest ../../CainiaoCRM/src/main/res/
```

设置 Node 使用 Taobao 的镜像
-------------

```yarn config set registry https://registry.npm.taobao.org --global
yarn config set disturl https://npm.taobao.org/dist --global```

在 ~/.bash_profile 中设置 cnpm 来替代 npm

```alias cnpm="npm --registry=https://registry.npm.taobao.org \
   --cache=$HOME/.npm/.cache/cnpm \
   --disturl=https://npm.taobao.org/dist \
   --userconfig=$HOME/.cnpmrc"
   ```

特殊情况
---------------

 - 目前React Navigation 已发布的 npm 上的版本不支持 tab 上点击跳转，需要使用 github 上的版本。
  ```
  npm install react-community/react-navigation#fe4b1e2
  ```

Support
-------

- Google+ Community: https://plus.google.com/communities/105153134372062985968
- Stack Overflow: http://stackoverflow.com/questions/tagged/android

If you've found an error in this sample, please file an issue:
https://github.com/googlesamples/android-ActionBarCompat-Styled

Patches are encouraged, and may be submitted by forking this project and
submitting a pull request through GitHub. Please see CONTRIBUTING.md for more details.

License
-------

Copyright 2014 The Android Open Source Project, Inc.

Licensed to the Apache Software Foundation (ASF) under one or more contributor
license agreements.  See the NOTICE file distributed with this work for
additional information regarding copyright ownership.  The ASF licenses this
file to you under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License.  You may obtain a copy of
the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
License for the specific language governing permissions and limitations under
the License.
