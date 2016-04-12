package cn.cainiaoshicai.crm.orders.util;

import android.annotation.SuppressLint;
import android.content.Context;
import android.text.format.DateUtils;

import cn.cainiaoshicai.crm.R;

import java.text.DateFormatSymbols;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

/**
 *  Helper class, extending the standard DateUtils of Android. 
 *  It has an advanced logic, that for timestamps of today,
 *  it would display the seconds or minutes or hours,
 *  while for other timestamps it would display the date.
 *  
 * http://stackoverflow.com/questions/3910042/javaandroid-convert-sqlite-date-to-x-days-ago
 */
public class DateTimeUtils extends DateUtils {

	private static String sTimestampLabelYesterday;
	private static String sTimestampLabelToday;
	private static String sTimestampLabelJustNow;
	private static String sTimestampLabelMinutesAgo;
	private static String sTimestampLabelHoursAgo;
	private static String sTimestampLabelHourAgo;
	private static String sTimestampLabelMonth;
	private static String sTimestampLabelDay;

	private static String datetime_short;

	private static Context sCtx;
	
	private static DateTimeUtils sInstance = null;

	/**
	 * GlobalCtx contructor. needed to get access to the application context &
	 * strings for i18n
	 * 
	 * @param context
	 *            Context
	 * @return DateTimeUtils singleton instanec
	 * @throws Exception
	 */
	public static DateTimeUtils getInstance(Context context) {
		sCtx = context;
		if (sInstance == null) {
            sInstance = new DateTimeUtils();
            sTimestampLabelYesterday = context.getResources().getString(
                    R.string.WidgetProvider_timestamp_yesterday);
            sTimestampLabelToday = context.getResources().getString(
                    R.string.WidgetProvider_timestamp_today);
            sTimestampLabelJustNow = context.getResources().getString(
                    R.string.WidgetProvider_timestamp_just_now);
            sTimestampLabelMinutesAgo = context.getResources().getString(
                    R.string.WidgetProvider_timestamp_minutes_ago);
            sTimestampLabelHoursAgo = context.getResources().getString(
                    R.string.WidgetProvider_timestamp_hours_ago);
            sTimestampLabelHourAgo = context.getResources().getString(
                    R.string.WidgetProvider_timestamp_hour_ago);
            sTimestampLabelMonth = context.getResources().getString(
                    R.string.WidgetProvider_timestamp_month);
            sTimestampLabelDay = context.getResources().getString(
                    R.string.WidgetProvider_timestamp_day);
            datetime_short = context.getResources().getString(
                    R.string.WidgetProvider_datetime_short);
        }
		return sInstance;
	}

	/**
	 * Checks if the given date is yesterday.
	 * 
	 * @param date
	 *            - Date to check.
	 * @return TRUE if the date is yesterday, FALSE otherwise.
	 */
	public static boolean isYesterday(long date) {

		final Calendar currentDate = Calendar.getInstance();
		currentDate.setTimeInMillis(date);

		final Calendar yesterdayDate = Calendar.getInstance();
		yesterdayDate.add(Calendar.DATE, -1);

		return yesterdayDate.get(Calendar.YEAR) == currentDate
				.get(Calendar.YEAR)
				&& yesterdayDate.get(Calendar.DAY_OF_YEAR) == currentDate
						.get(Calendar.DAY_OF_YEAR);
	}

	public static String[] sWeekdays = new DateFormatSymbols().getWeekdays(); // get
																				// day
																				// names
	public static final long millisInADay = 1000 * 60 * 60 * 24;

	public static String dayOfMonth(Date daytime) {
		return new SimpleDateFormat("dd").format(daytime);
	}
	public static String shortYmd(Date orderDay) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        return sdf.format(orderDay);
    }
	public static String shortYmdHourMin(Date datetime) {
		if (datetime == null) return "";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        return sdf.format(datetime);
    }

	public static String mdHourMinCh(Date datetime) {
		if (datetime == null) return "";
		return new SimpleDateFormat("M月d日 HH:mm").format(datetime);
    }

	public static String dHourMinCh(Date datetime) {
		if (datetime == null) return "";
		return new SimpleDateFormat("d日 HH:mm").format(datetime);
    }

	public static String hourMin(Date datetime) {
		if (datetime == null) return "";
		return new SimpleDateFormat("HH:mm").format(datetime);
    }

	/**
	 * Displays a user-friendly date difference string.
	 * 
	 * @param timedate
	 *            Timestamp to format as date difference from now
	 * @return Friendly-formatted date diff string
	 */
	public String getTimeDiffString(long timedate) {
		Calendar startDateTime = Calendar.getInstance();
		Calendar endDateTime = Calendar.getInstance();
		endDateTime.setTimeInMillis(timedate);
		long milliseconds1 = startDateTime.getTimeInMillis();
		long milliseconds2 = endDateTime.getTimeInMillis();
		long diff = milliseconds1 - milliseconds2;

		long hours = diff / (60 * 60 * 1000);
		long minutes = diff / (60 * 1000);
		minutes = minutes - 60 * hours;
		//long seconds = diff / (1000);

		boolean isToday = DateTimeUtils.isToday(timedate);
		boolean isYesterday = DateTimeUtils.isYesterday(timedate);

		if (hours > 0 && hours < 12) {
			return hours == 1 ? String.format(sTimestampLabelHourAgo, hours)
					: String.format(sTimestampLabelHoursAgo, hours);
		} else if (hours <= 0) {
			if (minutes > 0) {
				return String.format(sTimestampLabelMinutesAgo, minutes);
			} else {
				return sTimestampLabelJustNow;
			}
		} else if (isToday) {
			return sTimestampLabelToday;
		} else if (isYesterday) {
			return sTimestampLabelYesterday;
		} else if (startDateTime.getTimeInMillis() - timedate < millisInADay * 6) {
			return sWeekdays[endDateTime.get(Calendar.DAY_OF_WEEK)];
		} else {
			return formatDateTime(sCtx, timedate, DateUtils.FORMAT_NUMERIC_DATE);
		}
	}

    public String getMonthAndDay(Date date){
        return  String.format(sTimestampLabelMonth, date.getMonth())+ String.format(sTimestampLabelDay, date.getDay());
    }

	public String getShortFullTime(Date date) {
        return String.format(datetime_short, date, date, date, date);
	}

    public String getShortTime(Date date) {
		if (date == null) {
			return "";
		}

		@SuppressLint("SimpleDateFormat") SimpleDateFormat sdf = new SimpleDateFormat("HH:mm");
        return sdf.format(date);
    }
}