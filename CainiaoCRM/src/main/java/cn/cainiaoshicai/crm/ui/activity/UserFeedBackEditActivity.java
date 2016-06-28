package cn.cainiaoshicai.crm.ui.activity;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.TextView;

import java.util.Calendar;

import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;

/**
 * Created by liuzhr on 6/23/16.
 */
public class UserFeedBackEditActivity extends AbstractActionBarActivity {

    private String feedback_source;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        this.setContentView(R.layout.user_feedback_add);

        this.getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        this.getSupportActionBar().setTitle(R.string.title_user_feedback);

        TextView orderId = (TextView) findViewById(R.id.order_id);
        TextView platformWithId = (TextView) findViewById(R.id.order_platform_no);

        Spinner spinner = (Spinner) findViewById(R.id.feedback_source);
        final ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(this,
                R.array.feedback_source_array, android.R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(adapter);
        spinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                feedback_source = adapter.getItem(position).toString();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {

            }
        });

        Intent intent = getIntent();
        orderId.setText(intent.getStringExtra("order_id"));
        platformWithId.setText(intent.getStringExtra("platformWithId"));

        final Intent resultIntent = new Intent(getApplicationContext(), OrderSingleActivity.class);
        Button saveBtn = (Button) findViewById(R.id.save_btn);
        saveBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                resultIntent.putExtra("done", true);
                setResult(Activity.RESULT_OK, resultIntent);
                finish();
            }
        });

        Button cancelBtn = (Button) findViewById(R.id.cancel_btn);
        cancelBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                setResult(Activity.RESULT_OK, resultIntent);
                finish();
            }
        });
    }
}
