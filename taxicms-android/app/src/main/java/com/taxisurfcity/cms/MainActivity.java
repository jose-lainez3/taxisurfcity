package com.taxisurfcity.cms;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.*;
import android.widget.*;
import org.json.*;
import java.net.*;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final String HOME = "https://marketingmobile.taxistuncoelsalvador.com/";
    private static final String HOST = "marketingmobile.taxistuncoelsalvador.com";
    private static final String RELEASES = "https://api.github.com/repos/jose-lainez3/taxisurfcity/releases?per_page=30";
    private static final int PICK_IMAGE = 41;
    private WebView web;
    private ProgressBar progress;
    private TextView status;
    private ValueCallback<Uri[]> imageCallback;
    private boolean checking;
    private int versionCode;
    private String versionName;

    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        try {
            android.content.pm.PackageInfo info = getPackageManager().getPackageInfo(getPackageName(), 0);
            versionCode = info.versionCode;
            versionName = info.versionName;
        } catch (Exception e) { versionCode = 1; versionName = "1.0.1"; }
        getWindow().setStatusBarColor(Color.rgb(16,45,35));
        getWindow().setNavigationBarColor(Color.rgb(16,45,35));
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(16,45,35));
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets;
        });
        LinearLayout bar = new LinearLayout(this);
        bar.setGravity(android.view.Gravity.CENTER_VERTICAL);
        bar.setPadding(dp(12),dp(6),dp(6),dp(6));
        TextView title = new TextView(this);
        title.setText("TaxiCMS  ·  v" + versionName);
        title.setTextColor(Color.WHITE); title.setTextSize(15);
        bar.addView(title,new LinearLayout.LayoutParams(0,dp(48),1));
        Button refresh = new Button(this); refresh.setText("Recargar"); refresh.setAllCaps(false);
        refresh.setContentDescription("Recargar panel");
        refresh.setOnClickListener(v -> { status.setVisibility(View.GONE); web.loadUrl(HOME); });
        bar.addView(refresh);
        Button update = new Button(this); update.setText("Actualizar"); update.setAllCaps(false);
        update.setContentDescription("Buscar actualización de TaxiCMS");
        update.setOnClickListener(v -> checkUpdates(true));
        bar.addView(update);
        root.addView(bar);
        progress = new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
        root.addView(progress,new LinearLayout.LayoutParams(-1,dp(3)));
        status = new TextView(this); status.setPadding(dp(16),dp(12),dp(16),dp(12));
        status.setTextColor(Color.WHITE); status.setVisibility(View.GONE);
        root.addView(status,new LinearLayout.LayoutParams(-1,-2));
        web = new WebView(this);
        root.addView(web,new LinearLayout.LayoutParams(-1,0,1));
        setContentView(root);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setJavaScriptCanOpenWindowsAutomatically(false);
        s.setSupportMultipleWindows(false);
        if (android.os.Build.VERSION.SDK_INT >= 26) s.setSafeBrowsingEnabled(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request) {
                Uri u=request.getUrl();
                if ("https".equals(u.getScheme()) && HOST.equalsIgnoreCase(u.getHost())
                        && (u.getPort()==-1 || u.getPort()==443)) return false;
                if(request.isForMainFrame() && request.hasGesture() && "https".equals(u.getScheme()))
                    openExternal(u);
                return true;
            }
            @Override public void onPageStarted(WebView v,String url,android.graphics.Bitmap icon) {
                status.setVisibility(View.GONE); progress.setVisibility(View.VISIBLE);
            }
            @Override public void onPageFinished(WebView v,String url) {
                progress.setVisibility(View.GONE);
            }
            @Override public void onReceivedError(WebView v,WebResourceRequest req,WebResourceError error) {
                if(req.isForMainFrame()) showError("No se pudo conectar al panel. Comprueba Internet y pulsa Recargar.");
            }
            @Override public void onReceivedHttpError(WebView v,WebResourceRequest req,WebResourceResponse response) {
                if(req.isForMainFrame()) showError("El panel respondió con HTTP "+response.getStatusCode()+". Pulsa Recargar.");
            }
            @Override public void onReceivedSslError(WebView v,SslErrorHandler handler,android.net.http.SslError error) {
                handler.cancel(); showError("No se pudo verificar la conexión segura.");
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView v,int p) { progress.setProgress(p); }
            @Override public boolean onShowFileChooser(WebView v,ValueCallback<Uri[]> cb,FileChooserParams p) {
                if(imageCallback!=null) imageCallback.onReceiveValue(null);
                imageCallback=cb;
                Intent i=new Intent(Intent.ACTION_GET_CONTENT);
                i.setType("image/*"); i.addCategory(Intent.CATEGORY_OPENABLE);
                try { startActivityForResult(Intent.createChooser(i,"Seleccionar imagen del tour"),PICK_IMAGE); }
                catch(ActivityNotFoundException ex) { imageCallback.onReceiveValue(null); imageCallback=null; }
                return true;
            }
        });
        if(saved==null || web.restoreState(saved)==null) web.loadUrl(HOME);
        checkUpdates(false);
    }
    private int dp(int n) { return (int)(n*getResources().getDisplayMetrics().density+0.5f); }
    private void showError(String message) { status.setText(message); status.setVisibility(View.VISIBLE); progress.setVisibility(View.GONE); }
    private void openExternal(Uri u) {
        try { startActivity(new Intent(Intent.ACTION_VIEW,u)); }
        catch(ActivityNotFoundException ex) { Toast.makeText(this,"No hay navegador disponible.",Toast.LENGTH_LONG).show(); }
    }
    @Override protected void onActivityResult(int req,int result,Intent data) {
        super.onActivityResult(req,result,data);
        if(req==PICK_IMAGE && imageCallback!=null) {
            Uri u=result==RESULT_OK && data!=null ? data.getData() : null;
            imageCallback.onReceiveValue(u!=null?new Uri[]{u}:null); imageCallback=null;
        }
    }
    @Override protected void onSaveInstanceState(Bundle out) { web.saveState(out); super.onSaveInstanceState(out); }
    @Override public void onBackPressed() { if(web.canGoBack()) web.goBack(); else super.onBackPressed(); }
    @Override protected void onDestroy() {
        if(imageCallback!=null){imageCallback.onReceiveValue(null); imageCallback=null;}
        if(web!=null){web.destroy();web=null;} super.onDestroy();
    }
    private void checkUpdates(boolean manual) {
        if(checking)return; checking=true;
        new Thread(() -> {
            int best=versionCode; String download=null; String error=null;
            HttpURLConnection conn=null;
            try {
                conn=(HttpURLConnection)new URL(RELEASES).openConnection();
                conn.setConnectTimeout(8000);conn.setReadTimeout(10000);
                conn.setRequestProperty("Accept","application/vnd.github+json");
                conn.setRequestProperty("User-Agent","TaxiCMS-Android");
                if(conn.getResponseCode()!=200)throw new IOException("HTTP "+conn.getResponseCode());
                StringBuilder body=new StringBuilder();
                try(BufferedReader br=new BufferedReader(new InputStreamReader(conn.getInputStream(),StandardCharsets.UTF_8))){
                    String line;while((line=br.readLine())!=null)body.append(line);
                }
                JSONArray items=new JSONArray(body.toString());
                for(int i=0;i<items.length();i++){
                    JSONObject item=items.getJSONObject(i);
                    String tag=item.optString("tag_name");
                    if(item.optBoolean("draft")||item.optBoolean("prerelease")||!tag.matches("taxicms-v[0-9]+"))continue;
                    int code;try{code=Integer.parseInt(tag.substring(9));}catch(NumberFormatException e){continue;}
                    if(code<=best)continue;
                    JSONArray assets=item.optJSONArray("assets"); if(assets==null)continue;
                    for(int j=0;j<assets.length();j++){
                        JSONObject a=assets.getJSONObject(j);
                        String expected="https://github.com/jose-lainez3/taxisurfcity/releases/download/"+tag+"/TaxiCMS.apk";
                        if("TaxiCMS.apk".equals(a.optString("name")) && expected.equals(a.optString("browser_download_url"))){
                            best=code;download=expected;break;
                        }
                    }
                }
            }catch(Exception e){error="No se pudo comprobar la actualización.";}
            finally{if(conn!=null)conn.disconnect();}
            final String link=download, failure=error; final int found=best;
            runOnUiThread(()->{
                checking=false;if(isFinishing()||isDestroyed())return;
                if(link!=null){
                    new AlertDialog.Builder(this).setTitle("Nueva versión de TaxiCMS")
                        .setMessage("Versión 1.0."+found+" disponible. Descárgala e instala la actualización sobre la app actual.")
                        .setNegativeButton("Después",null).setPositiveButton("Descargar",(d,w)->openExternal(Uri.parse(link))).show();
                }else if(manual)Toast.makeText(this,failure!=null?failure:"No hay una versión más reciente publicada.",Toast.LENGTH_LONG).show();
            });
        }).start();
    }
}
