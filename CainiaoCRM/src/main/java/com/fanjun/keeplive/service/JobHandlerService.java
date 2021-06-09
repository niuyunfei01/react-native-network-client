package com.fanjun.keeplive.service;

import android.app.ActivityManager;
import android.app.job.JobInfo;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.annotation.RequiresApi;
import java.util.Iterator;
import java.util.List;

/**
 * 定时器
 * 安卓5.0及以上
 */
@SuppressWarnings(value={"unchecked", "deprecation"})
@RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
public final class JobHandlerService extends JobService {
    private JobScheduler mJobScheduler;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        //启动本地服务
        startService(new Intent(this, LocalService.class));
        //启动守护进程
        startService(new Intent(this, RemoteService.class));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mJobScheduler = (JobScheduler) getSystemService(Context.JOB_SCHEDULER_SERVICE);
            int jobId = startId + 1;
            if (jobId <= 100) {
                JobInfo.Builder builder = new JobInfo.Builder(jobId, new ComponentName(getPackageName(), JobHandlerService.class.getName()));
                if (Build.VERSION.SDK_INT >= 24) {
                    builder.setMinimumLatency(JobInfo.DEFAULT_INITIAL_BACKOFF_MILLIS); //执行的最小延迟时间
                    builder.setOverrideDeadline(JobInfo.DEFAULT_INITIAL_BACKOFF_MILLIS);  //执行的最长延时时间
                    builder.setMinimumLatency(JobInfo.DEFAULT_INITIAL_BACKOFF_MILLIS);
                    builder.setBackoffCriteria(JobInfo.DEFAULT_INITIAL_BACKOFF_MILLIS, JobInfo.BACKOFF_POLICY_LINEAR);//线性重试方案
                } else {
                    builder.setPeriodic(JobInfo.DEFAULT_INITIAL_BACKOFF_MILLIS);
                }
                builder.setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY);
                builder.setRequiresCharging(true); // 当插入充电器，执行该任务
                mJobScheduler.schedule(builder.build());
            }
        }
        return START_STICKY;
    }

    @Override
    public boolean onStartJob(JobParameters jobParameters) {
        if (!isServiceRunning(getApplicationContext(), "com.fanjun.keeplive.service.AcquireService") || !isServiceRunning(getApplicationContext(), getPackageName()+":remote")) {
            startService(new Intent(this, LocalService.class));
            startService(new Intent(this, RemoteService.class));
        }
        return false;
    }

    @Override
    public boolean onStopJob(JobParameters jobParameters) {
        if (!isServiceRunning(getApplicationContext(), "com.fanjun.keeplive.service.AcquireService") || !isServiceRunning(getApplicationContext(), getPackageName()+":remote")) {
            startService(new Intent(this, LocalService.class));
            startService(new Intent(this, RemoteService.class));
        }
        return false;
    }
    private boolean isServiceRunning(Context ctx, String className) {
        boolean isRunning = false;
        ActivityManager activityManager = (ActivityManager) ctx
                .getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningServiceInfo> servicesList = activityManager
                .getRunningServices(Integer.MAX_VALUE);
        Iterator<ActivityManager.RunningServiceInfo> l = servicesList.iterator();
        while (l.hasNext()) {
            ActivityManager.RunningServiceInfo si = l.next();
            if (className.equals(si.service.getClassName())) {
                isRunning = true;
            }
        }
        return isRunning;
    }
}
