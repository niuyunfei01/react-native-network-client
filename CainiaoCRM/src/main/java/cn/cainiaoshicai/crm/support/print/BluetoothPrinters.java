package cn.cainiaoshicai.crm.support.print;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import cn.cainiaoshicai.crm.support.debug.AppLogger;

/**
 */
public class BluetoothPrinters {

    public final static BluetoothPrinters INS = new BluetoothPrinters();

    private AtomicReference<DeviceStatus> currentPrinter = new AtomicReference<>();
    private List<DeviceStatus> printers = new ArrayList<>();

    public BluetoothConnector.BluetoothSocketWrapper getCurrentPrinterSocket() {
        if (currentPrinter.get() != null) {
            return currentPrinter.get().getSocket();
        } else {
            for (DeviceStatus printer: printers) {
                if (printer.isConnected()) {
                    currentPrinter.set(printer);
                    return printer.getSocket();
                }
            }
        }

        return null;
    }

    public static class DeviceStatus {
        private BluetoothDevice device;
        private String name;
        private String addr;
        private boolean connected;
        private BluetoothConnector.BluetoothSocketWrapper mbtSocket;

        public DeviceStatus(BluetoothDevice device, boolean connected) {
            this.name = device.getName();
            this.addr = device.getAddress();
            this.connected = connected;
            this.device = device;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getAddr() {
            return addr;
        }

        public boolean isConnected() {
            return connected;
        }

        public BluetoothDevice getDevice() {
            return device;
        }

        public BluetoothConnector.BluetoothSocketWrapper getSocket() {
            return mbtSocket;
        }

        public void finalize() throws Throwable {
            super.finalize();
            closeSocket();
        }

        public boolean isBound() {
            return this.device != null && (device.getBondState() == BluetoothDevice.BOND_BONDED);
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;

            DeviceStatus that = (DeviceStatus) o;

            return !(device != null ? !device.equals(that.device) : that.device != null);
        }

        @Override
        public int hashCode() {
            return device != null ? device.hashCode() : 0;
        }

        public void resetSocket(BluetoothConnector.BluetoothSocketWrapper mbtSocket) {
            closeSocket();
            this.mbtSocket = mbtSocket;
            this.connected = true;
            INS.printers.add(this);
        }

        private void closeSocket() {
            if (this.mbtSocket != null) {
                try {
                    this.mbtSocket.close();
                } catch (IOException e) {
                    e.printStackTrace();
                    AppLogger.e(("error to close mbt socket"));
                }

                INS.printers.remove(this);
            }
        }
    }
}
