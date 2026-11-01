# Ý tưởng: Đo khoảng cách và tìm đường trên bản đồ

## Mục tiêu

Cho phép người dùng đo khoảng cách giữa hai điểm trên bản đồ và xem đường đi thực tế đến một địa điểm, chẳng hạn một quán cà phê.

## Các cách tính

### 1. Khoảng cách đường chim bay

- Tính khoảng cách địa lý trực tiếp từ tọa độ vĩ độ/kinh độ của hai điểm.
- Vẽ một đường thẳng nối hai điểm trên bản đồ.
- Hiển thị khoảng cách ước tính, làm tròn theo mét hoặc kilômét.
- Tính ngay trên trình duyệt, không cần backend hay dịch vụ định tuyến.
- Ghi rõ đây không phải quãng đường đi trên đường phố.

### 2. Quãng đường và tuyến đường thực tế

- Gửi điểm đầu, điểm đến và phương tiện đến dịch vụ định tuyến.
- Hiển thị tuyến đường, quãng đường và thời gian dự kiến.
- Có thể bổ sung lựa chọn phương tiện: xe máy, ô tô, đi bộ hoặc xe đạp, tùy dịch vụ.
- Thời gian có giao thông trực tiếp là tính năng nâng cao; phiên bản đầu có thể dùng thời gian ước tính thông thường.

## Tình huống sử dụng

1. **Người dùng tự chọn hai điểm:** chọn điểm đầu và điểm đến bằng cách chấm trên bản đồ.
2. **Từ vị trí hiện tại đến điểm tự chọn:** lấy vị trí thiết bị sau khi người dùng cấp quyền, rồi chấm điểm đến.
3. **Từ vị trí hiện tại đến quán:** lấy vị trí thiết bị và chọn một quán có sẵn.
4. **Chọn điểm đầu thủ công khi không có GPS:** người dùng chấm cả điểm đầu và điểm đến.

> Vị trí thiết bị có thể sai lệch. Nên cho phép chỉnh điểm đầu trên bản đồ và thông báo khi trình duyệt không có quyền vị trí.

## Trải nghiệm giao diện đề xuất

- Chế độ chọn: “Đo đường chim bay” hoặc “Tìm đường thực tế”.
- Hai trường điểm đầu và điểm đến, có thể chọn bằng cách chạm/chấm trên bản đồ.
- Nút “Dùng vị trí của tôi” cho điểm đầu.
- Khi chọn quán, cho phép đặt quán đó làm điểm đến.
- Hiển thị khoảng cách; với tuyến thực tế, hiển thị thêm thời gian dự kiến.
- Nút “Mở chỉ đường trên Google Maps” để chuyển sang ứng dụng Google Maps.
- Có thao tác xóa/chọn lại điểm và xóa tuyến đang xem.
- Hỗ trợ thao tác chạm trên điện thoại và chuột/bàn phím trên máy tính; điều khiển đủ lớn cho màn hình nhỏ.

## Phương án miễn phí và lựa chọn dịch vụ

### Không dùng dịch vụ tính tuyến

- Đường chim bay tự tính từ tọa độ và không tạo lượt gọi API.
- Có thể tạo Google Maps URL chứa điểm đầu/điểm đến để mở Google Maps. Cách này không cần API key; Google Maps tự hiển thị tuyến và hướng dẫn điều hướng.
- Phù hợp cho phiên bản đầu nếu ứng dụng chỉ cần đo sơ bộ và chuyển người dùng sang Google Maps.

### Hiển thị tuyến thật ngay trong ứng dụng

- Có thể dùng gói miễn phí có giới hạn của openrouteservice hoặc GraphHopper.
- Google Routes API cũng có hạn mức miễn phí theo SKU; kiểm tra hạn mức, điều khoản và giá hiện hành trước khi triển khai.
- Gói miễn phí không đồng nghĩa với không giới hạn: cần đọc điều khoản, lượt gọi và quy định thương mại.
- Không dùng máy chủ demo công cộng làm backend sản phẩm lâu dài. Tự host dịch vụ mã nguồn mở vẫn cần máy chủ, dữ liệu bản đồ và công sức vận hành.

## Kiến trúc đề xuất

### Phiên bản đầu

- Tính đường chim bay ngay ở frontend.
- Dùng tọa độ quán đang có trong dữ liệu ứng dụng làm điểm đến.
- Tạo Google Maps URL khi người dùng muốn điều hướng.
- Chưa cần backend mới cho tính khoảng cách hoặc điều hướng.

### Khi cần xem tuyến ngay trên bản đồ ứng dụng

- Frontend gửi tọa độ điểm đầu, điểm đến và phương tiện đến backend.
- Backend kiểm tra dữ liệu, áp giới hạn tần suất và gọi nhà cung cấp định tuyến.
- Backend chỉ trả trường cần dùng: khoảng cách, thời gian và hình học tuyến (polyline).
- Giữ API key nhà cung cấp ở backend, không nhúng vào mã frontend.
- Không lưu cache dữ liệu tuyến nếu điều khoản nhà cung cấp không cho phép.
- Thiết lập quota, cảnh báo chi phí và xử lý lỗi/quá hạn mức.

## Lộ trình triển khai

1. Xác nhận giao diện và nguồn tọa độ quán hiện tại.
2. Thêm chọn hai điểm và đo đường chim bay.
3. Thêm dùng vị trí thiết bị và chọn quán làm điểm đến.
4. Thêm nút mở Google Maps với điểm đầu/điểm đến.
5. Nếu cần vẽ tuyến trong ứng dụng, chọn nhà cung cấp, xác nhận điều khoản/chi phí rồi triển khai endpoint backend.
6. Bổ sung phương tiện, thời gian theo giao thông hoặc tuyến thay thế theo nhu cầu.

## Các quyết định cần chốt trước khi lập trình

- Dùng bản đồ hiện có hay thay đổi thư viện bản đồ?
- Phiên bản đầu chỉ mở Google Maps để điều hướng hay cần vẽ tuyến ngay trong ứng dụng?
- Phương tiện mặc định là xe máy, ô tô hay cho phép chọn?
- Có cần lưu lịch sử tìm đường không? Nếu có, quyết định mục đích, thời gian lưu và cách xin quyền phù hợp.
- Ứng dụng có mục tiêu thương mại không? Điều này ảnh hưởng đến tính phù hợp của một số gói miễn phí.

## Tham khảo

- [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started)
- [Google Routes API](https://developers.google.com/maps/documentation/routes)
- [Google Routes API: giá và hạn mức](https://developers.google.com/maps/documentation/routes/usage-and-billing)
- [Google Routes API: chính sách và attribution](https://developers.google.com/maps/documentation/routes/policies)
- [openrouteservice: giới hạn API](https://openrouteservice.org/restrictions/)
- [GraphHopper: gói dịch vụ](https://www.graphhopper.com/pricing/)
