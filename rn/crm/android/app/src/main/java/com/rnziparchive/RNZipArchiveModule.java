package com.rnziparchive;

import android.os.Build;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

public class RNZipArchiveModule extends ReactContextBaseJavaModule {

    private static final String PROGRESS_EVENT_NAME = "zipArchiveProgressEvent";
    private static final String EVENT_KEY_FILENAME = "filePath";
    private static final String EVENT_KEY_PROGRESS = "progress";

    public RNZipArchiveModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "RNZipArchive";
    }

    @ReactMethod
    public void unzip(final String zipFilePath, final String destDirectory, final String charset, final Promise promise) {
        new Thread(() -> {
            // Check the file exists
            try {
                new File(zipFilePath);
            } catch (NullPointerException e) {
                promise.reject(null, "Couldn't open file " + zipFilePath + ". ");
                return;
            }

            try {
                // Find the total uncompressed size of every file in the zip, so we can
                // get an accurate progress measurement
                final long totalUncompressedBytes = getUncompressedSize(zipFilePath, charset);

                File destDir = new File(destDirectory);
                if (!destDir.exists()) {
                    //noinspection ResultOfMethodCallIgnored
                    destDir.mkdirs();
                }

                updateProgress(0, 1, zipFilePath); // force 0%

                // We use arrays here so we can update values
                // from inside the callback
                final long[] extractedBytes = {0};
                final int[] lastPercentage = {0};

                ZipFile zipFile;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    zipFile = new ZipFile(zipFilePath, Charset.forName(charset));
                } else {
                    zipFile = new ZipFile(zipFilePath);
                }

                final Enumeration<? extends ZipEntry> entries = zipFile.entries();
                while (entries.hasMoreElements()) {
                    final ZipEntry entry = entries.nextElement();
                    if (entry.isDirectory()) continue;

                    StreamUtil.ProgressCallback cb = bytesRead -> {
                        extractedBytes[0] += bytesRead;

                        int lastTime = lastPercentage[0];
                        int percentDone = (int) ((double) extractedBytes[0] * 100 / (double) totalUncompressedBytes);

                        // update at most once per percent.
                        if (percentDone > lastTime) {
                            lastPercentage[0] = percentDone;
                            updateProgress(extractedBytes[0], totalUncompressedBytes, zipFilePath);
                        }
                    };

                    File fout = new File(destDirectory, entry.getName());
                    String canonicalPath = fout.getCanonicalPath();
                    String destDirCanonicalPath = (new File(destDirectory).getCanonicalPath()) + File.separator;

                    if (!canonicalPath.startsWith(destDirCanonicalPath)) {
                        throw new SecurityException(String.format("Found Zip Path Traversal Vulnerability with %s", canonicalPath));
                    }

                    if (!fout.exists()) {
                        //noinspection ResultOfMethodCallIgnored
                        (new File(fout.getParent())).mkdirs();
                    }
                    InputStream in = null;
                    BufferedOutputStream Bout = null;
                    try {
                        in = zipFile.getInputStream(entry);
                        Bout = new BufferedOutputStream(new FileOutputStream(fout));
                        StreamUtil.copy(in, Bout, cb);
                        Bout.close();
                        in.close();
                    } catch (IOException ex) {
                        if (in != null) {
                            try {
                                in.close();
                            } catch (Exception ignored) {
                            }
                        }
                        if (Bout != null) {
                            try {
                                Bout.close();
                            } catch (Exception ignored) {
                            }
                        }
                    }
                }

                zipFile.close();
                updateProgress(1, 1, zipFilePath); // force 100%
                promise.resolve(destDirectory);
            } catch (Exception ex) {
                updateProgress(0, 1, zipFilePath); // force 0%
                promise.reject(null, "Failed to extract file " + ex.getLocalizedMessage());
            }
        }).start();
    }


    protected void updateProgress(long extractedBytes, long totalSize, String zipFilePath) {
        // Ensure progress can't overflow 1
        double progress = Math.min((double) extractedBytes / (double) totalSize, 1);
        WritableMap map = Arguments.createMap();
        map.putString(EVENT_KEY_FILENAME, zipFilePath);
        map.putDouble(EVENT_KEY_PROGRESS, progress);
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(PROGRESS_EVENT_NAME, map);
    }

    /**
     * Return the uncompressed size of the ZipFile (only works for files on disk, not in assets)
     *
     * @return -1 on failure
     */
    private long getUncompressedSize(String zipFilePath, String charset) {
        long totalSize = 0;
        try {
            ZipFile zipFile;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                zipFile = new ZipFile(zipFilePath, Charset.forName(charset));
            } else {
                zipFile = new ZipFile(zipFilePath);
            }
            Enumeration<? extends ZipEntry> entries = zipFile.entries();
            while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();
                long size = entry.getSize();
                if (size != -1) {
                    totalSize += size;
                }
            }
            zipFile.close();
        } catch (IOException ignored) {
            return -1;
        }
        return totalSize;
    }
    @ReactMethod
    public void addListener(String eventName) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

}