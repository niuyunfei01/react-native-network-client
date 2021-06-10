package cn.cainiaoshicai.crm.ui.activity;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;

import com.andexert.calendarlistview.library.DayPickerView;
import com.andexert.calendarlistview.library.SimpleMonthAdapter;

import java.util.Calendar;

import cn.cainiaoshicai.crm.MainOrdersActivity;
import cn.cainiaoshicai.crm.R;


public class DatepickerActivity extends Activity implements com.andexert.calendarlistview.library.DatePickerController {

    private DayPickerView dayPickerView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.datepicker_layout);

        dayPickerView = (DayPickerView) findViewById(R.id.activity_daypicker);
        dayPickerView.setController(this);
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.main_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();
        return super.onOptionsItemSelected(item);
    }

    @Override
    public int getMaxYear()
    {
        int year = Calendar.getInstance().get(Calendar.YEAR);
        return year + 1;
    }

    @Override
    public void onDayOfMonthSelected(int year, int month, int day)
    {
        Log.e("Day Selected", day + " / " + month + " / " + year);
        Intent result = new Intent(getApplicationContext(), MainOrdersActivity.class);
        Calendar ins = Calendar.getInstance();
        ins.set(year, month, day);
        result.putExtra("daytime", ins.getTime());
        setResult(Activity.RESULT_OK, result);
        finish();
    }

    @Override
    public void onDateRangeSelected(SimpleMonthAdapter.SelectedDays<SimpleMonthAdapter.CalendarDay> selectedDays)
    {
        Log.e("Date range selected", selectedDays.getFirst().toString() + " --> " + selectedDays.getLast().toString());
    }
}
