-- Replace the English source descriptions for KOI Thé and Starbucks with
-- Vietnamese copy so Vietnamese text/audio does not depend on live translation.
BEGIN;

UPDATE public.brand
SET description = 'Hạnh phúc là được sẻ chia những khoảnh khắc đặc biệt cùng bạn bè. Dù là dịp lễ, một buổi hẹn hò hay chỉ là phút thư giãn trong ngày, luôn có lý do để mọi người quây quần bên ly trà KOI. KOI mang niềm vui đến khắp thế giới. Trà được pha mới cùng những nguyên liệu đậm đà hương vị, chuẩn bị bằng tất cả đam mê, tạo nên hương vị đích thực của KOI và khiến mọi người quay lại hết lần này đến lần khác.',
    description_language_code = 'vi',
    updated_at = CURRENT_TIMESTAMP
WHERE brand_name = 'KOI Thé';

UPDATE public.brand
SET description = 'Mỗi tuần, điều này diễn ra hàng triệu lần: một khách hàng nhận thức uống từ nhân viên pha chế Starbucks, nhưng mỗi lần tương tác đều mang nét riêng. Chúng tôi trân trọng sự kết nối ấy trong mọi việc mình làm — từ cam kết mang đến cà phê chất lượng cao nhất thế giới đến cách chúng tôi gắn kết với khách hàng và cộng đồng để kinh doanh có trách nhiệm.',
    description_language_code = 'vi',
    updated_at = CURRENT_TIMESTAMP
WHERE brand_name = 'Starbucks';

COMMIT;
