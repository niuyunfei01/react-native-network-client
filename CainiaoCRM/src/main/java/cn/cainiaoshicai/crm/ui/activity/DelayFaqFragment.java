package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
import android.app.Dialog;
import android.app.DialogFragment;
import android.content.DialogInterface;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.Arrays;

import cn.cainiaoshicai.crm.R;


public class DelayFaqFragment extends DialogFragment {

    static String[] delayReasons = {"备货时间太长", "备货分拣后没有运力", "配送速度太慢", "配送人员未依合理顺序", "其他原因"};

    static boolean[] delayReasonCheckState = new boolean[delayReasons.length];

    static {
        Arrays.fill(delayReasonCheckState, false);
    }

    public ArrayList<String> checkedReason = new ArrayList<String>();

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
        EditText editText = new EditText(this.getActivity());
        editText.setVisibility(View.INVISIBLE);
        return new AlertDialog.Builder(getActivity())
                .setIcon(R.drawable.ic_launcher)
                .setTitle(title)
                .setMultiChoiceItems(delayReasons, delayReasonCheckState, new DialogInterface.OnMultiChoiceClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which, boolean isChecked) {

                    }
                })
                .setView(editText)
                .setPositiveButton("提交", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {

                    }
                })
                .setNegativeButton("取消", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {

                    }
                })
                .create();
    }
}
