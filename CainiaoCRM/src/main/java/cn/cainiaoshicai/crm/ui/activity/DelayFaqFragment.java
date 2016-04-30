package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
import android.app.Dialog;
import android.app.DialogFragment;
import android.content.DialogInterface;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;

import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.util.Log;
import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;


public class DelayFaqFragment extends DialogFragment {

    String[] delayReasons = {"备货时间太长", "备货分拣后没有运力", "配送速度太慢", "配送人员未依合理顺序", "其他原因"};

    boolean[] delayReasonCheckState = new boolean[delayReasons.length];

    EditText editText = null;

    public HashSet<String> checkedReason = new HashSet<>();

    public ArrayList<String> getCheckedReasonStr() {
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

    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        String title = getArguments().getString("title");
        Arrays.fill(delayReasonCheckState, false);
        editText = new EditText(getActivity());
        editText.setVisibility(View.INVISIBLE);
        return new AlertDialog.Builder(getActivity())
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
                .setPositiveButton("提交", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        postDelayReason();
                    }
                })
                .setNegativeButton("取消", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {

                    }
                })
                .create();
    }

    public void postDelayReason() {
        Log.d("delay reason"+checkedReason.toString());
    }
}
