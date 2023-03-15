package com.mattermost.networkclient;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.facebook.react.bridge.ReactApplicationContext;
import com.qiniu.android.dns.DnsManager;
import com.qiniu.android.dns.Domain;
import com.qiniu.android.dns.IResolver;
import com.qiniu.android.dns.NetworkInfo;
import com.qiniu.android.dns.Record;
import com.qiniu.android.dns.dns.DnsUdpResolver;
import com.qiniu.android.dns.local.AndroidDnsServer;

import androidx.annotation.NonNull;
import okhttp3.Dns;

public class ApiDns implements Dns {

    private final DnsManager dnsManager;

    public ApiDns(ReactApplicationContext reactApplicationContext) {
        IResolver[] resolvers = new IResolver[5];
        resolvers[0] = new DnsUdpResolver("180.76.76.76"); //自定义 DNS 服务器地址
        resolvers[1] = new DnsUdpResolver("223.5.5.5"); //自定义 DNS 服务器地址
        resolvers[2] = new DnsUdpResolver("119.29.29.29"); //自定义 DNS 服务器地址
        resolvers[3] = new DnsUdpResolver("114.114.114.114"); //自定义 DNS 服务器地址
        resolvers[4] = AndroidDnsServer.defaultResolver(reactApplicationContext); //系统默认 DNS 服务器
        dnsManager = new DnsManager(NetworkInfo.normal, resolvers);
    }

    @NonNull
    @Override
    public List<InetAddress> lookup(@NonNull String hostname) throws UnknownHostException {
        if (null == dnsManager)
            return Dns.SYSTEM.lookup(hostname);
        try {
            Record[] ips = dnsManager.queryRecords(hostname);
            List<InetAddress> addresses = new ArrayList<>();
            for (Record ip : ips)
                addresses.addAll(Arrays.asList(dnsManager.queryInetAdress(new Domain(ip.value))));
            return addresses;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return Dns.SYSTEM.lookup(hostname);
    }
}
