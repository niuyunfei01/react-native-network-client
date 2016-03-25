package cn.cainiaoshicai.crm.support.print;

import android.app.ListActivity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.Toast;

import cn.cainiaoshicai.crm.R;

public class BluetoothSetting extends ListActivity {
	private Menu mMenu;
	@Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setTitle(getString(R.string.lab_bluetoothetting));
//        setListAdapter(new ArrayAdapter<String>(this,
//                android.R.layout.simple_list_item_single_choice, GENRES));
        
        final ListView listView = getListView();

        listView.setItemsCanFocus(false);
        listView.setChoiceMode(ListView.CHOICE_MODE_SINGLE);
    }

	public static void actionBluetoothSetting(Context context)
    {
        Intent i = new Intent(context, BluetoothSetting.class);
        context.startActivity(i);
    }
	
	@Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Hold on to this
        mMenu = menu;
        
        // Inflate the currently selected menu XML resource.
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.bluetooth_context, menu);
 
        return true;
    }

    private static final String[] GENRES = new String[] {
        "DeShi-142", "BlackBerry 8310", "TP PRINTER"
    };
    
    
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            // For "Title only": Examples of matching an ID with one assigned in
            //                   the XML
            case R.id.menu_searchbluetooth:
//                Toast.makeText(this, "Jump up in the air!", Toast.LENGTH_SHORT).show();
                setListAdapter(new ArrayAdapter<String>(this,
                        android.R.layout.simple_list_item_single_choice, GENRES));
                return true;

            case R.id.menu_clear:
//                Toast.makeText(this, "Dive into the water!", Toast.LENGTH_SHORT).show();
                setListAdapter(new ArrayAdapter<String>(this,
                        android.R.layout.simple_list_item_single_choice, new String[]{}));
                return true;
            default:
                break;
        }
        
        return false;
    }
    
    @Override
    public void onListItemClick(ListView l, View v, int position, long id) {
    	super.onListItemClick(l, v, position, id);
    	String value = l.getItemAtPosition(position).toString();
//    	Toast.makeText(this, value, Toast.LENGTH_SHORT).show();
    	BluetoothChatService.Invoice.actionInvoice(this);
    }
}
