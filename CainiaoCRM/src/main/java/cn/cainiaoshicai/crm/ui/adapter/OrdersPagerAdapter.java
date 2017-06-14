package cn.cainiaoshicai.crm.ui.adapter;

import android.content.Context;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentStatePagerAdapter;

import cn.cainiaoshicai.crm.ListType;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.orders.OrderListFragment;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

public class OrdersPagerAdapter extends FragmentStatePagerAdapter {

    private String tabTitles[] = new String[] {
            ListType.WAITING_READY.getName(),
            ListType.WAITING_SENT.getName(),
            ListType.WAITING_ARRIVE.getName(),
            ListType.ARRIVED.getName(),
    };
    private OrderListFragment[] fragments = new OrderListFragment[tabTitles.length];
    private int[] counts = new int[]{0, 0, 0, 0};

    private Context context;

    @Override
    public int getCount() {
        return tabTitles.length;
    }

    @Override
    public Fragment getItem(int position) {
        ListType listType = MainActivity.getListTypeByTab(position);
        OrderListFragment fragment = OrderListFragment.newInstance(listType);
        AppLogger.d("position=" + position + ", listType=" + listType);
        return fragment;
    }

    @Override
    public CharSequence getPageTitle(int position) {
        String numbers = position == 3 ? "" : "(" + counts[position] + ")";
        return tabTitles[position] + numbers;
    }

    public OrdersPagerAdapter(FragmentManager fm, MainActivity context) {
        super(fm);
        this.context = context;
    }

    public void setCount(ListType listType, Integer count) {
        counts[listType.getValue() - 1] = count;
    }
}
