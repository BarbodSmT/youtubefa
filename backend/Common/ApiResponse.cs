namespace YouTubeChannelLibrary.API.Common;

// This non-generic class is for responses without a data payload.
public class ApiResponse
{
    public bool IsSuccess { get; set; }
    public string Message { get; set; }
    public int StatusCode { get; set; }

    protected ApiResponse(bool isSuccess, string message, int statusCode)
    {
        IsSuccess = isSuccess;
        Message = message;
        StatusCode = statusCode;
    }
    
    public static ApiResponse Success(string message = "عملیات با موفقیت انجام شد")
    {
        return new ApiResponse(true, message, 200);
    }
    
    public static ApiResponse Fail(string message, int statusCode = 400)
    {
        return new ApiResponse(false, message, statusCode);
    }
}


// This generic class is for responses that DO have a data payload.
public class ApiResponse<T> : ApiResponse
{
    public T? Data { get; set; }

    private ApiResponse(bool isSuccess, T? data, string message, int statusCode)
        : base(isSuccess, message, statusCode)
    {
        Data = data;
    }

    public static ApiResponse<T> Success(T data, string message = "عملیات با موفقیت انجام شد")
    {
        return new ApiResponse<T>(true, data, message, 200);
    }

    public new static ApiResponse<T> Fail(string message, int statusCode = 400)
    {
        return new ApiResponse<T>(false, default, message, statusCode);
    }
}