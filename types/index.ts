// BlogPost 타입 정의 (기존과 동일)
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  file_path: string;
  created_at: string;
  updated_at: string;
  series_no: number;
  category_no: number;
  open: boolean;
  description: string | null;
  series_seq_no: number;
  category_name: string;
  series_name: string;
}
