package cn.cainiaoshicai.crm.ui.activity;

import android.app.Dialog;
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v4.app.DialogFragment;

import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.support.MyAsyncTask;

/**
 * Created by liuzhr on 4/25/16.
 */
public class ProgressFragment extends DialogFragment {

    MyAsyncTask asyncTask = null;

    public static ProgressFragment newInstance(int messageResId) {
        ProgressFragment frag = new ProgressFragment();
        frag.setRetainInstance(true);
        Bundle args = new Bundle();
        args.putInt("msgResId", messageResId);
        frag.setArguments(args);
        return frag;
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        ProgressDialog dialog = new ProgressDialog(getActivity());
        int messageResId = getArguments().getInt("msgResId");
        dialog.setMessage(getString(messageResId));
        dialog.setIndeterminate(false);
        dialog.setCancelable(true);
        return dialog;
    }

    @Override
    public void onCancel(DialogInterface dialog) {
        if (asyncTask != null) {
            asyncTask.cancel(true);
        }
        super.onCancel(dialog);
    }

    public void setAsyncTask(MyAsyncTask task) {
        asyncTask = task;
    }
}
