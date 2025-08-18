-- Kiểm tra schema của cả hai bảng trước khi tạo trigger
-- Bảng benhnhan schema:
-- id uuid, ho_ten text, ngay_sinh date, gioi_tinh text, dia_chi text, so_dien_thoai text, 
-- created_at date, thang_tuoi integer, can_nang numeric(5,1)

-- Đầu tiên, tạo lại function add_to_danhsachcho với đầy đủ fields
CREATE OR REPLACE FUNCTION add_to_danhsachcho()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert vào danhsachcho với tất cả fields từ benhnhan
  INSERT INTO danhsachcho (
    benhnhan_id,
    ho_ten,
    ngay_sinh, 
    gioi_tinh,
    dia_chi,
    so_dien_thoai,
    thang_tuoi,
    can_nang,
    ngay_tao
  ) VALUES (
    NEW.id,
    NEW.ho_ten,
    NEW.ngay_sinh,
    NEW.gioi_tinh, 
    NEW.dia_chi,
    NEW.so_dien_thoai,
    NEW.thang_tuoi,
    NEW.can_nang,
    NEW.created_at
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo lại trigger để đảm bảo nó được cập nhật
DROP TRIGGER IF EXISTS auto_add_to_danhsachcho ON benhnhan;
CREATE TRIGGER auto_add_to_danhsachcho
  AFTER INSERT ON benhnhan
  FOR EACH ROW
  EXECUTE FUNCTION add_to_danhsachcho();

-- Kiểm tra schema của bảng danhsachcho để đảm bảo các cột tồn tại
-- Nếu thiếu cột nào thì cần thêm vào
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'danhsachcho' 
ORDER BY ordinal_position;