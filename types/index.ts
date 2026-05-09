// BlogPost 타입 정의 (기존과 동일)
export interface BlogPost {
  id: string;
  slug: string;
  title: string | null;
  file_path: string;
  created_at: string;
  updated_at: string;
  series_no: number | null;
  category_no: number | null;
  open: boolean;
  description: string | null;
  series_seq_no: number | null;
  category_name: string | null;
  series_name: string | null;
}
