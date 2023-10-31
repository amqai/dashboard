export interface Alert {
  message: string;
  type: AlertType;
}

export enum AlertType {
  Error = "error",
  Success = "success",
  Warning = "warning",
  Info = "info",
}
