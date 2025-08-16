-- Create danhsachcho (waiting list) table for Supabase
-- Run this SQL in Supabase SQL Editor after creating benhnhan table

CREATE TABLE IF NOT EXISTS public.danhsachcho (
  id SERIAL NOT NULL,
  benhnhan_id UUID NULL,
  ho_ten TEXT NULL,
  ngay_sinh DATE NULL,
  gioi_tinh TEXT NULL,
  dia_chi TEXT NULL,
  thang_tuoi NUMERIC NULL,
  can_nang NUMERIC(5, 1) NULL,
  ngay_tao DATE NULL DEFAULT CURRENT_DATE,
  so_dien_thoai CHARACTER VARYING(15) NULL,
  
  CONSTRAINT danhsachcho_pkey PRIMARY KEY (id),
  CONSTRAINT unique_benhnhan_id UNIQUE (benhnhan_id),
  CONSTRAINT fk_benhnhan_id FOREIGN KEY (benhnhan_id) REFERENCES benhnhan (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_danhsachcho_benhnhan_id ON danhsachcho(benhnhan_id);
CREATE INDEX IF NOT EXISTS idx_danhsachcho_ngay_tao ON danhsachcho(ngay_tao);
CREATE INDEX IF NOT EXISTS idx_danhsachcho_ho_ten ON danhsachcho(ho_ten);

-- Insert sample data for testing (optional)
-- Make sure you have benhnhan records first before running this
-- INSERT INTO danhsachcho (benhnhan_id, ho_ten, ngay_sinh, gioi_tinh, dia_chi, so_dien_thoai, can_nang, thang_tuoi) 
-- SELECT id, ho_ten, ngay_sinh, gioi_tinh, dia_chi, so_dien_thoai, can_nang, thang_tuoi 
-- FROM benhnhan LIMIT 2;