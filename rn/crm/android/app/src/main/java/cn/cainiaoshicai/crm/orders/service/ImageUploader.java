package cn.cainiaoshicai.crm.orders.service;

public class ImageUploader {

    public static final String CON_START_FILEID = "FILEID:";

    public String upload(String filename) {

//        Log.d(GlobalCtx.DAIFAN_TAG, "start writing filename:" + filename + " to server");
//
//        HttpClient httpClient = new DefaultHttpClient();
//        HttpContext httpContext = new BasicHttpContext();
//        HttpPost httpPost = new HttpPost("http://51daifan.sinaapp.com/recipes/add_image");
//
//        try {
//            MultipartEntity multipartContent = new MultipartEntity();
//            multipartContent.addPart("Filedata", new FileBody(new File(filename)));
//            long totalSize = multipartContent.getContentLength();
//
//            // Send it
//            httpPost.setEntity(multipartContent);
//            HttpResponse response = httpClient.onPageFinished(httpPost, httpContext);
//            StatusLine statusLine = response.getStatusLine();
//
//            if (statusLine.getStatusCode() == 200) {
//                String con = EntityUtils.toString(response.getEntity());
//                if (con.startsWith(CON_START_FILEID)) {
//                    return con.substring(CON_START_FILEID.length());
//                } else {
//                    Log.e(GlobalCtx.DAIFAN_TAG, "response incorrect:" + con);
//                }
//            } else {
//                Log.d(GlobalCtx.DAIFAN_TAG, "uploading failed for status line:" + statusLine.toString());
//            }
//        } catch (Exception e) {
//            Log.d(GlobalCtx.DAIFAN_TAG, "Uploading filename" + filename + " failed", e);
//        }
        return null;
    }
}
