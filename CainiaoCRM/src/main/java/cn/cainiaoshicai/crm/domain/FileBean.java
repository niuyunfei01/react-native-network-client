package cn.cainiaoshicai.crm.domain;

/**
 * Created by liuzhr on 4/24/17.
 */

public class FileBean {

    //{"file":{"id":"18029","key":"L99DN","filename":"magazine-unlock-02-2.3.587-bigpicture_02_40.jpg","ext":"jpg","size":502297,"time":1493284741}}

    private String id;
    private String key;
    private String filename;
    private String ext;
    private long size;
    private int time; //unix timestamp

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getExt() {
        return ext;
    }

    public void setExt(String ext) {
        this.ext = ext;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public int getTime() {
        return time;
    }

    public void setTime(int time) {
        this.time = time;
    }
}
