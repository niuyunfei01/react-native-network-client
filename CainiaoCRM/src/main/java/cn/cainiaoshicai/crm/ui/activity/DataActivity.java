package cn.cainiaoshicai.crm.ui.activity;

import android.os.Bundle;
import android.widget.GridView;
import android.widget.SimpleAdapter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cn.cainiaoshicai.crm.R;

/**
 * Created by liuzhr on 6/30/17.
 */

public class DataActivity extends AbstractActionBarActivity {
    private GridView gview;
    private List<Map<String, Object>> data_list;
    private SimpleAdapter sim_adapter;
    // 图片封装为一个数组
    private int[] icon = { R.drawable.mq_evaluate_good, R.drawable.ic_widgets_black_24dp,
            R.drawable.ic_supervisor_account_black_24dp, R.drawable.ic_pie_chart_black_24dp,
            R.drawable.ic_account_balance_wallet_black_24dp,  };

    private String[] iconName = { "运营指标", "商品管理", "员工绩效", "营业分析", "结算单"};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.data_grid);
        gview = (GridView) findViewById(R.id.gview);
        //新建List
        data_list = new ArrayList<Map<String, Object>>();
        //获取数据
        getData();
        //新建适配器
        String [] from ={"image","text"};
        int [] to = {R.id.image,R.id.text};
        sim_adapter = new SimpleAdapter(this, data_list, R.layout.data_grid_item, from, to);
        //配置适配器
        gview.setAdapter(sim_adapter);
    }



    public List<Map<String, Object>> getData(){
        //cion和iconName的长度是相同的，这里任选其一都可以
        for(int i=0;i<icon.length;i++){
            Map<String, Object> map = new HashMap<String, Object>();
            map.put("image", icon[i]);
            map.put("text", iconName[i]);
            data_list.add(map);
        }

        return data_list;
    }
}
