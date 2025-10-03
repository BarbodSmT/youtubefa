using System.Globalization;

namespace YouTubeChannelLibrary.API.Common;

public static class DateConverter
{
    public static string ToPersianDate(this DateTime date)
    {
        PersianCalendar pc = new PersianCalendar();
        return $"{pc.GetYear(date)}/{pc.GetMonth(date):00}/{pc.GetDayOfMonth(date):00}";
    }
}