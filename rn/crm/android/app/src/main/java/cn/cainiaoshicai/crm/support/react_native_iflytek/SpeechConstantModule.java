package cn.cainiaoshicai.crm.support.react_native_iflytek;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.iflytek.cloud.SpeechConstant;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by zph on 2017/8/5.
 */

public class SpeechConstantModule extends ReactContextBaseJavaModule {

    public SpeechConstantModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "SpeechConstantModule";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("APPID", SpeechConstant.APPID);
        constants.put("NET_TYPE", SpeechConstant.NET_TYPE);
        constants.put("FORCE_LOGIN", SpeechConstant.FORCE_LOGIN);
        constants.put("LIB_NAME", SpeechConstant.LIB_NAME);
        constants.put("RESULT_TYPE", SpeechConstant.RESULT_TYPE);
        constants.put("RESULT_LEVEL", SpeechConstant.RESULT_LEVEL);
        constants.put("LANGUAGE", SpeechConstant.LANGUAGE);
        constants.put("ACCENT", SpeechConstant.ACCENT);
        constants.put("DOMAIN", SpeechConstant.DOMAIN);
        constants.put("VAD_ENABLE", SpeechConstant.VAD_ENABLE);
        constants.put("VAD_BOS", SpeechConstant.VAD_BOS);
        constants.put("VAD_EOS", SpeechConstant.VAD_EOS);
        constants.put("SAMPLE_RATE", SpeechConstant.SAMPLE_RATE);
        constants.put("PARAMS", SpeechConstant.PARAMS);
        constants.put("NET_CHECK", SpeechConstant.NET_CHECK);
        constants.put("NET_TIMEOUT", SpeechConstant.NET_TIMEOUT);
        constants.put("KEY_SPEECH_TIMEOUT", SpeechConstant.KEY_SPEECH_TIMEOUT);
        constants.put("ENGINE_MODE", SpeechConstant.ENGINE_MODE);
        constants.put("ENGINE_TYPE", SpeechConstant.ENGINE_TYPE);
        constants.put("AUDIO_SOURCE", SpeechConstant.AUDIO_SOURCE);
        constants.put("ASR_SOURCE_PATH", SpeechConstant.ASR_SOURCE_PATH);
        constants.put("FILTER_AUDIO_TIME", SpeechConstant.FILTER_AUDIO_TIME);
        constants.put("LOCAL_GRAMMAR", SpeechConstant.LOCAL_GRAMMAR);
        constants.put("CLOUD_GRAMMAR", SpeechConstant.CLOUD_GRAMMAR);
        constants.put("GRAMMAR_TYPE", SpeechConstant.GRAMMAR_TYPE);
        constants.put("GRAMMAR_NAME", SpeechConstant.GRAMMAR_NAME);
        constants.put("GRAMMAR_LIST", SpeechConstant.GRAMMAR_LIST);
        constants.put("LOCAL_GRAMMAR_PACKAGE", SpeechConstant.LOCAL_GRAMMAR_PACKAGE);
        constants.put("NOTIFY_RECORD_DATA", SpeechConstant.NOTIFY_RECORD_DATA);
        constants.put("MIXED_THRESHOLD", SpeechConstant.MIXED_THRESHOLD);
        constants.put("MIXED_TYPE", SpeechConstant.MIXED_TYPE);
        constants.put("MIXED_TIMEOUT", SpeechConstant.MIXED_TIMEOUT);
        constants.put("ASR_THRESHOLD", SpeechConstant.ASR_THRESHOLD);
        constants.put("LEXICON_TYPE", SpeechConstant.LEXICON_TYPE);
        constants.put("ASR_NBEST", SpeechConstant.ASR_NBEST);
        constants.put("ASR_WBEST", SpeechConstant.ASR_WBEST);
        constants.put("ASR_PTT", SpeechConstant.ASR_PTT);
        constants.put("ASR_SCH", SpeechConstant.ASR_SCH);
        constants.put("ASR_DWA", SpeechConstant.ASR_DWA);
        constants.put("NLP_VERSION", SpeechConstant.NLP_VERSION);
        constants.put("SCENE", SpeechConstant.SCENE);
        constants.put("TYPE_LOCAL", SpeechConstant.TYPE_LOCAL);
        constants.put("TYPE_CLOUD", SpeechConstant.TYPE_CLOUD);
        constants.put("TYPE_MIX", SpeechConstant.TYPE_MIX);
        constants.put("TYPE_DISTRIBUTED", SpeechConstant.TYPE_DISTRIBUTED);
        constants.put("TYPE_AUTO", SpeechConstant.TYPE_AUTO);
        constants.put("ISV_SST", SpeechConstant.ISV_SST);
        constants.put("ISV_PWDT", SpeechConstant.ISV_PWDT);
        constants.put("ISV_VID", SpeechConstant.ISV_VID);
        constants.put("ISV_RGN", SpeechConstant.ISV_RGN);
        constants.put("ISV_PWD", SpeechConstant.ISV_PWD);
        constants.put("ISV_AUDIO_PATH", SpeechConstant.ISV_AUDIO_PATH);
        constants.put("ISV_CMD", SpeechConstant.ISV_CMD);
        constants.put("ISV_INTERRUPT_ERROR", SpeechConstant.ISV_INTERRUPT_ERROR);
        constants.put("WFR_SST", SpeechConstant.WFR_SST);
        constants.put("ISE_USER_MODEL_ID", SpeechConstant.ISE_USER_MODEL_ID);
        constants.put("ISE_CATEGORY", SpeechConstant.ISE_CATEGORY);
        constants.put("ISE_PARSED", SpeechConstant.ISE_PARSED);
        constants.put("ISE_AUTO_TRACKING", SpeechConstant.ISE_AUTO_TRACKING);
        constants.put("ISE_TRACK_TYPE", SpeechConstant.ISE_TRACK_TYPE);
        constants.put("ISE_INTERRUPT_ERROR", SpeechConstant.ISE_INTERRUPT_ERROR);
        constants.put("ISE_AUDIO_PATH", SpeechConstant.ISE_AUDIO_PATH);
        constants.put("ISE_SOURCE_PATH", SpeechConstant.ISE_SOURCE_PATH);
        constants.put("IVW_SST", SpeechConstant.IVW_SST);
        constants.put("IVW_WORD_PATH", SpeechConstant.IVW_WORD_PATH);
        constants.put("IVW_THRESHOLD", SpeechConstant.IVW_THRESHOLD);
        constants.put("KEEP_ALIVE", SpeechConstant.KEEP_ALIVE);
        constants.put("IVW_SHOT_WORD", SpeechConstant.IVW_SHOT_WORD);
        constants.put("IVW_ENROLL_RES_PATH", SpeechConstant.IVW_ENROLL_RES_PATH);
        constants.put("IVW_ENROLL_DEST_PATH", SpeechConstant.IVW_ENROLL_DEST_PATH);
        constants.put("IVW_ENROLL_TMIN", SpeechConstant.IVW_ENROLL_TMIN);
        constants.put("IVW_ENROLL_TMAX", SpeechConstant.IVW_ENROLL_TMAX);
        constants.put("IVW_VOL_CHECK", SpeechConstant.IVW_VOL_CHECK);
        constants.put("IVW_ENROLL_TIMES", SpeechConstant.IVW_ENROLL_TIMES);
        constants.put("IVW_RES_PATH", SpeechConstant.IVW_RES_PATH);
        constants.put("IVW_NET_MODE", SpeechConstant.IVW_NET_MODE);
        constants.put("IVW_CHANNEL_NUM", SpeechConstant.IVW_CHANNEL_NUM);
        constants.put("IVW_RESET_AIMIC", SpeechConstant.IVW_RESET_AIMIC);
        constants.put("IVW_ALSA_CARD", SpeechConstant.IVW_ALSA_CARD);
        constants.put("IVW_ALSA_RATE", SpeechConstant.IVW_ALSA_RATE);
        constants.put("IVW_AUDIO_PATH", SpeechConstant.IVW_AUDIO_PATH);
        constants.put("VOICE_NAME", SpeechConstant.VOICE_NAME);
        constants.put("EMOT", SpeechConstant.EMOT);
        constants.put("NEXT_TEXT", SpeechConstant.NEXT_TEXT);
        constants.put("LOCAL_SPEAKERS", SpeechConstant.LOCAL_SPEAKERS);
        constants.put("SPEED", SpeechConstant.SPEED);
        constants.put("PITCH", SpeechConstant.PITCH);
        constants.put("VOLUME", SpeechConstant.VOLUME);
        constants.put("BACKGROUND_SOUND", SpeechConstant.BACKGROUND_SOUND);
        constants.put("TTS_BUFFER_TIME", SpeechConstant.TTS_BUFFER_TIME);
        constants.put("TTS_PLAY_STATE", SpeechConstant.TTS_PLAY_STATE);
        constants.put("TTS_DATA_NOTIFY", SpeechConstant.TTS_DATA_NOTIFY);
        constants.put("TTS_INTERRUPT_ERROR", SpeechConstant.TTS_INTERRUPT_ERROR);
        constants.put("TTS_SPELL_INFO", SpeechConstant.TTS_SPELL_INFO);
        constants.put("AUDIO_FORMAT", SpeechConstant.AUDIO_FORMAT);
        constants.put("STREAM_TYPE", SpeechConstant.STREAM_TYPE);
        constants.put("KEY_REQUEST_FOCUS", SpeechConstant.KEY_REQUEST_FOCUS);
        constants.put("TTS_AUDIO_PATH", SpeechConstant.TTS_AUDIO_PATH);
        constants.put("DATA_TYPE", SpeechConstant.DATA_TYPE);
        constants.put("SUBJECT", SpeechConstant.SUBJECT);
        constants.put("ASR_AUDIO_PATH", SpeechConstant.ASR_AUDIO_PATH);
        constants.put("ASR_INTERRUPT_ERROR", SpeechConstant.ASR_INTERRUPT_ERROR);
        constants.put("ASR_NOMATCH_ERROR", SpeechConstant.ASR_NOMATCH_ERROR);
        constants.put("ASR_NET_PERF", SpeechConstant.ASR_NET_PERF);
        constants.put("ENG_ASR", SpeechConstant.ENG_ASR);
        constants.put("ENG_TTS", SpeechConstant.ENG_TTS);
        constants.put("ENG_NLU", SpeechConstant.ENG_NLU);
        constants.put("ENG_IVW", SpeechConstant.ENG_IVW);
        constants.put("ENG_IVP", SpeechConstant.ENG_IVP);
        constants.put("ENG_WFR", SpeechConstant.ENG_WFR);
        constants.put("ENG_EVA", SpeechConstant.ENG_EVA);
        constants.put("MODE_MSC", SpeechConstant.MODE_MSC);
        constants.put("MODE_PLUS", SpeechConstant.MODE_PLUS);
        constants.put("MODE_AUTO", SpeechConstant.MODE_AUTO);
        constants.put("TEXT_ENCODING", SpeechConstant.TEXT_ENCODING);
        constants.put("TEXT_BOM", SpeechConstant.TEXT_BOM);
        constants.put("AUTH_ID", SpeechConstant.AUTH_ID);
        constants.put("MFV_SST", SpeechConstant.MFV_SST);
        constants.put("MFV_VCM", SpeechConstant.MFV_VCM);
        constants.put("MFV_SCENES", SpeechConstant.MFV_SCENES);
        constants.put("MFV_AFC", SpeechConstant.MFV_AFC);
        constants.put("MFV_DATA_PATH", SpeechConstant.MFV_DATA_PATH);
        constants.put("MFV_INTERRUPT_ERROR", SpeechConstant.MFV_INTERRUPT_ERROR);
        constants.put("PROT_TYPE", SpeechConstant.PROT_TYPE);
        constants.put("PLUS_LOCAL_TTS", SpeechConstant.PLUS_LOCAL_TTS);
        constants.put("PLUS_LOCAL_ASR", SpeechConstant.PLUS_LOCAL_ASR);
        constants.put("PLUS_LOCAL_IVW", SpeechConstant.PLUS_LOCAL_IVW);
        constants.put("PLUS_LOCAL_ALL", SpeechConstant.PLUS_LOCAL_ALL);
        constants.put("IST_SESSION_ID", SpeechConstant.IST_SESSION_ID);
        constants.put("IST_SYNC_ID", SpeechConstant.IST_SYNC_ID);
        constants.put("IST_AUDIO_UPLOADED", SpeechConstant.IST_AUDIO_UPLOADED);
        constants.put("IST_AUDIO_PATH", SpeechConstant.IST_AUDIO_PATH);
        constants.put("IST_SESSION_TRY", SpeechConstant.IST_SESSION_TRY);
        return constants;
    }
}