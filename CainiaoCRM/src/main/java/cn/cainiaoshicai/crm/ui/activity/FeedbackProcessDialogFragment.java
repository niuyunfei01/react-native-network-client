package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
import android.app.Dialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.dao.UserFeedbackDao;
import cn.cainiaoshicai.crm.orders.domain.FeedbackLog;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.support.MyAsyncTask;

public class FeedbackProcessDialogFragment extends android.support.v4.app.DialogFragment {

    interface ProcessLogCallback {
        FeedbackLog done(String log);
        FeedbackLog cancel();
    }

    private ProcessLogCallback callback;

    public void setCallback(ProcessLogCallback callback) {
        this.callback = callback;
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        // Get the layout inflater
        LayoutInflater inflater = getActivity().getLayoutInflater();

        builder.setTitle("处理记录");
        // Inflate and set the layout for the dialog
        // Pass null as the parent view because its going in the dialog layout
        View processView = inflater.inflate(R.layout.user_feedback_process_dialog, null);
        final EditText et = (EditText) processView.findViewById(R.id.process_log);
        builder.setView(processView)
                // Add action buttons
                .setPositiveButton(R.string.ok, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int id) {
                        final String log = et.getText().toString();
                        if (callback != null) {
                            callback.done(log);
                        }
                    }
                })
                .setNegativeButton(R.string.cancel, new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        FeedbackProcessDialogFragment.this.getDialog().cancel();
                        if (callback != null) {
                            callback.cancel();
                        }
                    }
                });
        return builder.create();
    }
}