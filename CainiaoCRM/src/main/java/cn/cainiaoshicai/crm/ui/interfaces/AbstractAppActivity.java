package cn.cainiaoshicai.crm.ui.interfaces;

import android.content.Intent;
import android.nfc.NdefMessage;
import android.nfc.NdefRecord;
import android.nfc.NfcAdapter;
import android.nfc.NfcEvent;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.view.ViewConfiguration;
import android.widget.Toast;

import java.lang.reflect.Field;
import java.nio.charset.Charset;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.service.ServiceException;

/**
 * User: Jiang Qi
 * Date: 12-7-31
 */
public class AbstractAppActivity extends FragmentActivity {

    @Override
    protected void onResume() {
        super.onResume();
        GlobalCtx.getInstance().setCurrentRunningActivity(this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (GlobalCtx.getInstance().getCurrentRunningActivity() == this) {
            GlobalCtx.getInstance().setCurrentRunningActivity(null);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        forceShowActionBarOverflowMenu();
        initNFC();
        GlobalCtx.getInstance().setActivity(this);
    }

    private void forceShowActionBarOverflowMenu() {
        try {
            ViewConfiguration config = ViewConfiguration.get(this);
            Field menuKeyField = ViewConfiguration.class.getDeclaredField("sHasPermanentMenuKey");
            if (menuKeyField != null) {
                menuKeyField.setAccessible(true);
                menuKeyField.setBoolean(config, false);
            }
        } catch (Exception ignored) {

        }
    }

    private void initNFC() {
        NfcAdapter mNfcAdapter = NfcAdapter.getDefaultAdapter(this);
        if (mNfcAdapter == null) {
            return;
        }

        mNfcAdapter.setNdefPushMessageCallback(new NfcAdapter.CreateNdefMessageCallback() {
            @Override
            public NdefMessage createNdefMessage(NfcEvent event) {
                String text = (GlobalCtx.getInstance().getCurrentAccountName());

                NdefMessage msg = new NdefMessage(
                        new NdefRecord[]{createMimeRecord(
                                "application/org.qii.weiciyuan.beam", text.getBytes()),
                                NdefRecord.createApplicationRecord(getPackageName())
                        });
                return msg;
            }
        }, this);
    }

    private NdefRecord createMimeRecord(String mimeType, byte[] payload) {
        byte[] mimeBytes = mimeType.getBytes(Charset.forName("US-ASCII"));
        NdefRecord mimeRecord = new NdefRecord(
                NdefRecord.TNF_MIME_MEDIA, mimeBytes, new byte[0], payload);
        return mimeRecord;
    }

    protected void dealWithException(ServiceException e) {
        Toast.makeText(this, e.getError(), Toast.LENGTH_SHORT).show();
    }
}
