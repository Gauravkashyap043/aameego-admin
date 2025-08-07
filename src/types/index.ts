export interface Remark {
  section: string;
  field: string;
  message: string;
}

export interface CreateDocRemarkPayload {
  userId: string;
  remarks: Remark[];
}
