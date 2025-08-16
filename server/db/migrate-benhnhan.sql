-- Create benhnhan table for Supabase
-- Run this SQL in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS benhnhan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ho_ten TEXT NOT NULL,
    ngay_sinh DATE,
    gioi_tinh TEXT,
    dia_chi TEXT,
    so_dien_thoai TEXT,
    can_nang DECIMAL(5,1),
    thang_tuoi INTEGER,
    created_at DATE DEFAULT CURRENT_DATE
);

-- Create index for faster name searches
CREATE INDEX IF NOT EXISTS idx_benhnhan_ho_ten ON benhnhan(ho_ten);
CREATE INDEX IF NOT EXISTS idx_benhnhan_created_at ON benhnhan(created_at);

-- Insert sample data for testing (optional)
-- INSERT INTO benhnhan (ho_ten, ngay_sinh, gioi_tinh, dia_chi, so_dien_thoai, can_nang, thang_tuoi) VALUES
-- ('Nguyễn Văn A', '2020-01-15', 'Nam', '123 Đường ABC, TP.HCM', '0901234567', 15.5, 48),
-- ('Trần Thị B', '2021-05-20', 'Nữ', '456 Đường XYZ, Hà Nội', '0987654321', 12.0, 31);