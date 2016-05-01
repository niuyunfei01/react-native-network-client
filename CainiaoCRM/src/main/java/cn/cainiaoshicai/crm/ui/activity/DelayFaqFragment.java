package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
import android.app.Dialog;
import android.app.DialogFragment;
import android.content.DialogInterface;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;

import cn.cainiaoshicai.crm.Constants;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.util.TextUtil;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;


public class DelayFaqFragment extends DialogFragment {

    String[] delayReasons = {"备货时间太长", "备货分拣后没有运力", "配送速度太慢", "配送人员未依合理顺序", "其他原因"};

    boolean[] delayReasonCheckState = new boolean[delayReasons.length];

    EditText editText = null;

    private int platform;

    private String platformOid;

    public HashSet<String> checkedReason = new HashSet<>();

    public ArrayList<String> setCheckedReasonStr() {
        ArrayList<String> reasons = new ArrayList<>();
        int i = 0;
        while (i < delayReasonCheckState.length) {
            if (delayReasonCheckState[i]) {
                if (i + 1 == delayReasonCheckState.length) {
                    checkedReason.add(editText.getText().toString());
                } else {
                    checkedReason.add(delayReasons[i]);
                }
            }
            i++;
        }
        return reasons;
    }

    public static DelayFaqFragment newInstance(String title) {
        DelayFaqFragment delayFaqFragment = new DelayFaqFragment();
        Bundle args = new Bundle();
        args.putString("title", title);
        delayFaqFragment.setArguments(args);
        return delayFaqFragment;
    }

    public void setPlatform(int platform) {
        this.platform = platform;
    }

    public void setPlatformOid(String platformOid) {
        this.platformOid = platformOid;
    }

    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        String title = getArguments().getString("title");
        Arrays.fill(delayReasonCheckState, false);
        editText = new EditText(getActivity());
        editText.setVisibility(View.INVISIBLE);
        final AlertDialog dialog = new AlertDialog.Builder(getActivity())
                .setIcon(R.drawable.ic_launcher)
                .setTitle(title)
                .setMultiChoiceItems(delayReasons, delayReasonCheckState, new DialogInterface.OnMultiChoiceClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which, boolean isChecked) {
                        if (which == delayReasons.length - 1) {
                            if (isChecked) {
                                editText.setVisibility(View.VISIBLE);
                                editText.requestFocus();
                            } else {
                                editText.setVisibility(View.INVISIBLE);
                            }
                        }
                    }
                })
                .setView(editText)
                .setPositiveButton(R.string.submit, null)
                .setNegativeButton(R.string.cancel, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {

                    }
                })
                .create();

        dialog.setOnShowListener(new DialogInterface.OnShowListener() {
            @Override
            public void onShow(DialogInterface dialogInterface) {
                Button button = dialog.getButton(AlertDialog.BUTTON_POSITIVE);
                button.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        setCheckedReasonStr();
                        if(validateDelayReason()){
                            postDelayReason();
                            dialog.dismiss();
                        }
                    }
                });
            }
        });

        return dialog;
    }

    private boolean validateDelayReason(){
        if(checkedReason.size()==0){
            Toast.makeText(GlobalCtx.getInstance(), "选择延误原因",Toast.LENGTH_LONG).show();
            return false;
        }
        String customReason = editText.getText().toString();
        if(delayReasonCheckState[delayReasonCheckState.length-1]&& TextUtil.isBlank(customReason)){
            Toast.makeText(GlobalCtx.getInstance(), "填写其他延误原因",Toast.LENGTH_LONG).show();
            editText.requestFocus();
            return false;
        }
        return true;
    }

    public void postDelayReason() {
        new MyAsyncTask<Void, ResultBean, ResultBean>(){
            @Override
            protected ResultBean doInBackground(Void... params) {
                String token = GlobalCtx.getInstance().getSpecialToken();
                try {
                    StringBuffer reason = new StringBuffer();
                    int index = 0;
                    for (String item : checkedReason) {
                        index = index + 1;
                        reason.append(index + " : " + item + " ");
                    }
                    HashMap<String, String> postData = new HashMap<>();
                    postData.put("delay_reason", reason.toString());
                    return new OrderActionDao(token).saveDelayReason(Constants.Platform.find(platform), platformOid, postData);
                } catch (Exception ex) {
                    AppLogger.e("error on handle click save delay reason action: ", ex);
                    return ResultBean.exception();
                }
            }
            @Override
            protected void onPostExecute(final ResultBean oc) {
                super.onPostExecute(oc);
                Toast.makeText(GlobalCtx.getInstance(), oc.isOk() ? "操作成功" : "操作失败：" + oc.getDesc(), Toast.LENGTH_LONG).show();
            }

        }.executeOnNormal();
    }


}
