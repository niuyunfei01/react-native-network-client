package com.example.btprinter;

import android.app.Activity;
import android.os.Bundle;
import java.io.IOException;
import java.io.OutputStream;

import android.content.Intent;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;

import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.support.print.BluetoothConnector;
import cn.cainiaoshicai.crm.support.print.BluetoothPrinters;
import cn.cainiaoshicai.crm.support.print.GPrinterCommand;
import cn.cainiaoshicai.crm.ui.activity.SettingsPrintActivity;

public class BlueToothPrinterApp extends Activity
{
	/** Called when the activity is first created. */
	EditText message;
	Button printbtn;

	byte FONT_TYPE;
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.print);
		message = (EditText)findViewById(R.id.message);
		printbtn = (Button)findViewById(R.id.printButton);

		printbtn.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				connect();
			}
		});
	}

	protected void connect() {
		BluetoothConnector.BluetoothSocketWrapper btsocket = BluetoothPrinters.INS.getCurrentPrinterSocket();
		if(btsocket == null){
			Intent BTIntent = new Intent(getApplicationContext(), SettingsPrintActivity.class);
			this.startActivityForResult(BTIntent, SettingsPrintActivity.REQUEST_CONNECT_BT);
		}
		else{
			print_bt(btsocket);
		}
	}


	private void print_bt(BluetoothConnector.BluetoothSocketWrapper btsocket) {
		try {
			try {
				Thread.sleep(1000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}

			OutputStream btos = btsocket.getOutputStream();

			byte[] printformat = { 0x1B, 0x21, FONT_TYPE };
			btos.write(printformat);
			byte[] newLine = "\n".getBytes();
			final byte[] starLine = "********************************".getBytes();

			btos.write(starLine);
			btos.write(newLine);
			btos.write("菜鸟食材".getBytes());
			btos.write(newLine);
			btos.write("【在线支付】".getBytes());
			btos.write(newLine);

			btos.write(starLine);
			btos.write(newLine);
			btos.write(("期望送达时间：" + "立即送餐").getBytes());
			btos.write(newLine);
			btos.write(starLine);
			btos.write("订单编号：XXXXXXXXXXXXXXXX".getBytes());

			btos.write(newLine);

			btos.write("下单时间：2016-03-26 15：52".getBytes());
			btos.write(newLine);
			btos.write(starLine);
			btos.write(newLine);

			btos.write("食材名称           数量     金额".getBytes());
			btos.write(newLine);
			btos.write(String.format("%s %d ￥d.2f", "香葱 约100克", 2, 4.60).getBytes());
			btos.write(newLine);





			String msg = message.getText().toString();
			btos.write(msg.getBytes("gbk"));
			btos.write(0x0D);
			btos.write(0x0D);
			btos.write(0x0D);
			btos.write(GPrinterCommand.walkPaper((byte) 4));
			btos.flush();
		} catch (IOException e) {
			e.printStackTrace();
		}

	}
}