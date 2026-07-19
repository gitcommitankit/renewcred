interface ApiResponseOptions<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data?: T;
  public readonly meta?: Record<string, unknown>;

  constructor({ success, statusCode, message, data, meta }: ApiResponseOptions<T>) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  static success<T>(data: T, message = 'Success', statusCode = 200, meta?: Record<string, unknown>) {
    return new ApiResponse<T>({ success: true, statusCode, message, data, meta });
  }

  static created<T>(data: T, message = 'Created successfully') {
    return new ApiResponse<T>({ success: true, statusCode: 201, message, data });
  }

  static noContent(message = 'Deleted successfully') {
    return new ApiResponse({ success: true, statusCode: 200, message });
  }

  static error(message: string, statusCode = 500) {
    return new ApiResponse({ success: false, statusCode, message });
  }
}
