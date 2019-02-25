echo "编译正式版本！编译过程中会出现很多信息，请确认："

curr_branch=`git symbolic-ref --short -q HEAD`
echo "当前分支：$curr_branch"
build_branch='master'

if [[ "$curr_branch" != "$build_branch" ]];then
    echo "当前不是master分支，不编译"
    exit
fi

#xargs 实现 trim 功能
git pull --tags
latest_tag=$(git describe --tags `git rev-list --tags --max-count=1` | xargs)
app_version=`sed -n "6p" ./CainiaoCRM/src/main/AndroidManifest.xml | sed -e 's/android:versionName=\"\(.*\)\">/\1/' | xargs`
echo "最新tag：$latest_tag"
echo "当前app编译版本：$app_version"

if [[ "$latest_tag" != "$app_version" ]];then
    #确认版本号
    echo "当前App编译版本和Tag版本不同，是否继续编译(y/n)："
    read USER_CONFIRM_VERSION

    if [[ "$USER_CONFIRM_VERSION" = "n" ]] || [[ "$USER_CONFIRM_VERSION" = "N" ]] || [[ -z "$USER_CONFIRM_VERSION" ]];then
        echo "结束编译"
        exit
    fi

    #创建Tag
    echo "当前App编译版本和Tag版本不同，是否创建新版本Tag(y/n)："
    read USER_CONFIRM_CREATE_TAG

    if [[ "$USER_CONFIRM_CREATE_TAG" = "n" ]] || [[ "$USER_CONFIRM_CREATE_TAG" = "N" ]] || [[ -z "$USER_CONFIRM_CREATE_TAG" ]];then
        echo "结束编译"
        exit
    else
        git tag ${app_version}
        git push origin ${app_version}
    fi
fi


echo "开始编译...."

export BABEL_ENV=production

./release_rn.sh

echo "build android apk..."
./gradlew clean assembleRelease

export BABEL_ENV=dev

echo "编译完成，切换至工作分支"
git checkout dev