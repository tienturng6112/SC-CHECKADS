import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_heading_styled(doc, text, level):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.space_before = Pt(12)
    h.paragraph_format.space_after = Pt(4)
    run = h.runs[0]
    if level == 1:
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = RGBColor(30, 58, 138) # Deep Blue
    elif level == 2:
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = RGBColor(14, 116, 144) # Cyan / Teal
    elif level == 3:
        run.font.size = Pt(11.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(51, 65, 85) # Slate
    return h

def main():
    doc = Document()

    # Page setup - 1 inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Base style
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(30, 41, 59)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(4)

    # --- TITLE / COVER BLOCK ---
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(10)
    title_p.paragraph_format.space_after = Pt(2)
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_badge = title_p.add_run("BÁO CÁO TRÍCH XUẤT THÔNG TIN DỰ ÁN\n")
    run_badge.font.size = Pt(11)
    run_badge.font.bold = True
    run_badge.font.color.rgb = RGBColor(14, 116, 144)

    run_title = title_p.add_run("CREATIVE ADS CHECK (CHECKADS)\n")
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(15, 23, 42)

    run_sub = title_p.add_run("Hệ Thống AI Thẩm Định, Soát Lỗi Pháp Lý 2026 & Chấm Điểm Hiệu Quả Quảng Cáo Số")
    run_sub.font.size = Pt(11)
    run_sub.font.italic = True
    run_sub.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Meta Info Table
    meta_table = doc.add_table(rows=5, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False

    meta_data = [
        ("Tên dự án:", "Creative Ads Check (Thư mục làm việc: T:\\checkads)"),
        ("Kho lưu trữ (Git):", "https://github.com/thanhdat-71ads/checkads.git"),
        ("Công nghệ cốt lõi:", "React 19, Vite 8, TailwindCSS v4, Lucide React, Node.js Proxy Middleware"),
        ("Tác giả / Credit:", "HiepNguyen / Team Creative Ads Check"),
        ("Thời gian trích xuất:", "Tháng 10 / 2026")
    ]

    for idx, (label, val) in enumerate(meta_data):
        row = meta_table.rows[idx]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(2.0)
        c1.width = Inches(4.8)
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(label)
        r0.font.bold = True
        r0.font.size = Pt(10)
        r0.font.color.rgb = RGBColor(15, 23, 42)
        
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(val)
        r1.font.size = Pt(10)
        
        fill_color = "F1F5F9" if idx % 2 == 0 else "FFFFFF"
        set_cell_background(c0, fill_color)
        set_cell_background(c1, fill_color)
        set_cell_margins(c0, 60, 60, 100, 100)
        set_cell_margins(c1, 60, 60, 100, 100)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # --- 1. TỔNG QUAN DỰ ÁN ---
    add_heading_styled(doc, "1. Tổng Quan Mục Đích & Bối Cảnh Dự Án", 1)
    p = doc.add_paragraph()
    p.add_run(
        "Creative Ads Check là một ứng dụng Web dạng Single Page Application (SPA) chuyên sâu, "
        "được thiết kế riêng cho các nhà quảng cáo, doanh nghiệp thẩm mỹ viện, mỹ phẩm và thực phẩm chức năng (TPCN). "
        "Hệ thống giải quyết 2 bài toán sống còn trong tiếp thị kỹ thuật số tại Việt Nam năm 2026:"
    )
    
    b1 = doc.add_paragraph(style='List Bullet')
    r = b1.add_run("Soát lỗi vi phạm chính sách & pháp luật trước khi duyệt bài: ")
    r.font.bold = True
    b1.add_run("Tự động đối chiếu nội dung quảng cáo với Luật Quảng cáo 2012, Nghị định 342/2025/NĐ-CP (hiệu lực từ 15/2/2026 về quản lý mỹ phẩm, TPCN), Nghị định 15/2018/NĐ-CP, Nghị định 38/2021/NĐ-CP và chính sách kiểm duyệt khắt khe của Meta (Facebook), TikTok Ads, Google Ads.")

    b2 = doc.add_paragraph(style='List Bullet')
    r = b2.add_run("Chấm điểm chất lượng sáng tạo & tỷ lệ chuyển đổi: ")
    r.font.bold = True
    b2.add_run("Đánh giá sức hút của 3 giây đầu (Hook), góc nhìn khách hàng (Pain-point insight), tính chân thật (UGC - User Generated Content), Bằng chứng xã hội, Lời kêu gọi hành động (CTA) và Điểm bán hàng độc nhất (USP).")

    # --- 2. CÔNG NGHỆ & KIẾN TRÚC ---
    add_heading_styled(doc, "2. Tech Stack & Kiến Trúc Kỹ Thuật", 1)
    
    tech_table = doc.add_table(rows=6, cols=3)
    tech_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    headers = ["Thành phần", "Công nghệ sử dụng", "Mô tả vai trò"]
    for i, h in enumerate(headers):
        cell = tech_table.rows[0].cells[i]
        set_cell_background(cell, "1E3A8A")
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        run.font.size = Pt(10)
        set_cell_margins(cell, 80, 80, 100, 100)

    tech_items = [
        ("Frontend Core", "React 19 (19.2.8)", "Nền tảng giao diện SPA hiện đại, tối ưu rendering hiệu năng cao."),
        ("Bundler & Server", "Vite 8 (8.3.0)", "Môi trường phát triển siêu tốc với HMR; tích hợp Custom Server Middleware."),
        ("CSS Framework", "TailwindCSS v4 (@tailwindcss/vite)", "Giao diện phong cách Dark Theme cao cấp, linh hoạt responsive."),
        ("Iconography", "Lucide React (1.59.0)", "Hệ thống icon vector sắc nét, đồng bộ cho từng phân hệ."),
        ("Backend Services", "Vite Node Connect Middleware", "Đóng vai trò mini API server xử lý proxy tránh CORS và ghi file code."),
    ]

    for idx, (comp, tech, desc) in enumerate(tech_items):
        row = tech_table.rows[idx + 1]
        c0, c1, c2 = row.cells[0], row.cells[1], row.cells[2]
        c0.width = Inches(1.5)
        c1.width = Inches(2.3)
        c2.width = Inches(3.0)

        for c, text, bold in [(c0, comp, True), (c1, tech, False), (c2, desc, False)]:
            p = c.paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(9.5)
            r.font.bold = bold
            fill = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
            set_cell_background(c, fill)
            set_cell_margins(c, 70, 70, 90, 90)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # --- 3. CƠ CHẾ HOẠT ĐỘNG NỔI BẬT ---
    add_heading_styled(doc, "3. Các Tính Năng & Cơ Chế Hoạt Động Cốt Lõi", 1)

    add_heading_styled(doc, "3.1. Xử Lý Đa Phương Thức (Multimodal Video Frames Extraction)", 2)
    p = doc.add_paragraph()
    p.add_run(
        "Điểm đột phá của dự án là khả năng thẩm định video trực tiếp ngay trên trình duyệt. "
        "Khi người dùng tải lên video quảng cáo định dạng MP4, thuật toán HTML5 Canvas tự động bóc tách "
        "6 khung hình đại diện trải dài theo dòng thời gian video (video duration), chuyển đổi thành chuỗi base64. "
        "Các khung hình này được gửi kèm prompt tới mô hình Vision AI (Qwen-VL, GPT-4o, Gemini) để mô hình có thể "
        "'xem' diễn biến video, phát hiện chữ chèn trên ảnh vượt 20%, hình ảnh phản cảm, hiệu ứng chỉnh sửa quá đà hoặc trang phục y tế vi phạm."
    )

    add_heading_styled(doc, "3.2. Bốn Chế Độ Thẩm Định Chuyên Sâu", 2)
    mode_list = [
        ("Chỉ ad của tôi (my-ad):", "Chấm riêng biệt mẫu quảng cáo của người dùng, phân tích chi tiết ưu/nhược điểm và trả về 3 mẫu kịch bản viết lại tối ưu."),
        ("Ad của tôi vs Đối thủ (vs-competitor):", "So sánh song song điểm số và từng tiêu chí của mẫu quảng cáo người dùng so với đối thủ cạnh tranh trên thị trường."),
        ("Phân tích đối thủ (analyze-competitor):", "Phân tích, bóc tách cấu trúc chuyển đổi và chấm điểm xếp hạng nhiều mẫu quảng cáo của đối thủ."),
        ("Check kịch bản (check-script):", "Soát lỗi chính sách ngay trên bản nháp brief/kịch bản trước khi bấm máy sản xuất, hạn chế rủi ro lãng phí chi phí quay dựng.")
    ]
    for title, desc in mode_list:
        p = doc.add_paragraph(style='List Bullet')
        r = p.add_run(title + " ")
        r.font.bold = True
        p.add_run(desc)

    add_heading_styled(doc, "3.3. Cổng Kết Nối AI Đa Nền Tảng (OpenAI Compatible)", 2)
    p = doc.add_paragraph()
    p.add_run(
        "Hệ thống không phụ thuộc cứng vào một mô hình duy nhất mà hỗ trợ cổng kết nối tự do: "
        "Gwen (Qwen-VL từ Alibaba Cloud DashScope), Google Gemini, ChatGPT (OpenAI) và Claude (Anthropic). "
        "Cấu hình được quản lý tập trung tại 'src/config/gwenConfig.js' và có thể lưu trực tiếp qua giao diện người dùng. "
        "Khi người dùng chưa có API Key, hệ thống tích hợp Chế độ Demo giả lập thông minh khách quan "
        "để người dùng trải nghiệm trọn vẹn toàn bộ giao diện và luồng báo cáo."
    )

    add_heading_styled(doc, "3.4. Hệ Thống Lưu Trữ Lịch Sử Thẩm Định (History Engine)", 2)
    p = doc.add_paragraph()
    p.add_run(
        "Do mỗi phiên chấm điểm lưu kèm 6 khung hình base64 từ video với dung lượng đáng kể (dễ gây tràn hạn mức 5MB của localStorage trình duyệt), "
        "hệ thống áp dụng kiến trúc lưu trữ File JSON cục bộ (src/data/evaluationHistory.json) được quản lý qua Vite Server Middleware. "
        "Hệ thống cung cấp trọn bộ 3 API chuẩn RESTful (/api/history): GET lấy danh sách, POST tự động lưu phiên chấm điểm mới, "
        "và DELETE hỗ trợ xóa từng bản ghi hoặc dọn sạch toàn bộ. "
        "Tab Lịch sử (History.jsx) được trang bị thanh thống kê trực quan (tổng số ad, điểm trung bình, tỷ lệ đạt chuẩn, cảnh báo luật), "
        "bộ lọc theo nền tảng/điểm số và tính năng mở lại toàn bộ báo cáo chi tiết của bất kỳ phiên thẩm định nào trong quá khứ."
    )

    # --- 4. BỘ 18 TIÊU CHÍ CHẤM ĐIỂM ---
    add_heading_styled(doc, "4. Chi Tiết Bộ 18 Tiêu Chí Thẩm Định Độc Quyền", 1)

    p = doc.add_paragraph()
    p.add_run("Hệ thống chia làm 2 bảng tiêu chí rõ ràng, mỗi tiêu chí được chấm điểm trên thang điểm nguyên 1 - 5:")

    add_heading_styled(doc, "4.1. Bảng 1: Nhóm A — Tuân Thủ Chính Sách & Pháp Luật (9 Tiêu Chí)", 2)
    
    crit_a_table = doc.add_table(rows=10, cols=3)
    crit_a_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(["Mã", "Tên tiêu chí", "Quy định & Căn cứ pháp lý"]):
        cell = crit_a_table.rows[0].cells[i]
        set_cell_background(cell, "991B1B") # Dark Red
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        run.font.size = Pt(9.5)
        set_cell_margins(cell, 80, 80, 100, 100)

    criteria_a_data = [
        ("A1", "Không cam kết kết quả tuyệt đối", "Trừ nặng: 'trắng 100%', 'hết nám vĩnh viễn', 'cam kết hiệu quả', 'hoàn tiền nếu không trắng', mốc thời gian phi thực tế (trắng sau 3 ngày). Tránh sự chắc chắn tuyệt đối."),
        ("A2", "Không nhắm thuộc tính cá nhân", "Trừ khi ngụ ý biết trước tình trạng người xem ('Da bạn đang bị nám?', 'Bạn béo?'). Meta gắn cờ vi phạm chính sách quyền riêng tư cá nhân."),
        ("A3", "Không tuyên bố y tế / thành phần cấm", "Cấm quảng cáo mỹ phẩm/TPCN gây hiểu nhầm là thuốc chữa bệnh (NĐ 342/2025 Đ.27-28, NĐ 15/2018). Trừ các từ: 'đặc trị', 'chữa dứt điểm', 'điều trị tận gốc'."),
        ("A4", "Không dùng từ 'nhất' & so sánh đối thủ", "Luật Quảng cáo Đ.8: Cấm dùng 'tốt nhất', 'số 1', 'duy nhất', 'hàng đầu' khi không có chứng cứ hợp pháp; cấm so sánh trực tiếp với đối thủ."),
        ("A5", "Không mượn hình ảnh bác sĩ / NV y tế", "NĐ 342/2025 (hiệu lực 15/2/2026) CẤM dùng hình ảnh, áo blouse, tên bác sĩ/dược sĩ/nhân viên y tế để quảng cáo mỹ phẩm và TPCN."),
        ("A6", "Đủ thông tin bắt buộc theo luật", "Phải đủ: Tên sản phẩm + công dụng + tên/địa chỉ đơn vị chịu trách nhiệm (mỹ phẩm). Khuyến cáo 'Thực phẩm này không phải là thuốc...' (với TPCN)."),
        ("A7", "Hình ảnh & before/after trung thực", "Cấm dùng ảnh ghép ngụ ý biến đổi phi thực tế hoặc filter làm đẹp quá đà (Meta, Google và TikTok cấm filter trong ad skincare)."),
        ("A8", "Không hạ thấp / mặc cảm ngoại hình", "Cấm nội dung miệt thị, gây lo âu hình thể ('xấu thì ế', 'da sần kém sang'). Nền tảng ưu tiên thông điệp tự tin, tích cực."),
        ("A9", "Chuẩn định dạng & ưu đãi minh bạch", "Chữ trên ảnh dưới 20% diện tích (quy định Facebook). Khuyến mãi có thật, không dùng khan hiếm giả/clickbait lừa gạt (NĐ 38/2021)."),
    ]

    for idx, (code, title, desc) in enumerate(criteria_a_data):
        row = crit_a_table.rows[idx + 1]
        c0, c1, c2 = row.cells[0], row.cells[1], row.cells[2]
        c0.width = Inches(0.6)
        c1.width = Inches(2.2)
        c2.width = Inches(4.0)

        for c, text, bold in [(c0, code, True), (c1, title, True), (c2, desc, False)]:
            p = c.paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(9)
            r.font.bold = bold
            fill = "FEF2F2" if idx % 2 == 0 else "FFFFFF"
            set_cell_background(c, fill)
            set_cell_margins(c, 60, 60, 80, 80)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_heading_styled(doc, "4.2. Bảng 2: Nhóm B — Chất Lượng Sáng Tạo & Tỷ Lệ Chuyển Đổi (9 Tiêu Chí)", 2)
    
    crit_b_table = doc.add_table(rows=10, cols=3)
    crit_b_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(["Mã", "Tên tiêu chí", "Hướng dẫn thẩm định hiệu quả"]):
        cell = crit_b_table.rows[0].cells[i]
        set_cell_background(cell, "065F46") # Dark Emerald
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        run.font.size = Pt(9.5)
        set_cell_margins(cell, 80, 80, 100, 100)

    criteria_b_data = [
        ("B1", "Tiêu đề / hook mở đầu mạnh", "2-3 dòng đầu (trước chữ 'Xem thêm' của Facebook) phải giật mắt ngay. Video: 3 giây đầu phải giữ chân được khách không lướt qua."),
        ("B2", "Đánh trúng insight & nỗi đau", "Chạm đúng vấn đề thật (nám mảng, mụn, lão hoá, tự ti). Nói bằng ngôn ngữ đồng cảm của khách hàng, tránh từ ngữ sáo rỗng."),
        ("B3", "Tập trung 1 mục tiêu / 1 thông điệp", "Nhắm 1 sản phẩm chính, 1 thông điệp cốt lõi, không ôm đồm nhiều ý làm loãng trải nghiệm người xem."),
        ("B4", "Văn phong tự nhiên, chạm cảm xúc", "Viết tự nhiên như lời tâm tình chia sẻ, có cảm xúc gợi hình ảnh, tránh giọng văn cứng nhắc hoặc quảng cáo thổi phồng."),
        ("B5", "Cảm giác chân thật / UGC", "Xu hướng quảng cáo thắng 2026: video quay điện thoại chân thực, trải nghiệm khách hàng thật, hậu trường thay vì bối cảnh trường quay bóng bẩy giả tạo."),
        ("B6", "Bằng chứng xã hội & độ tin cậy", "Review thật, số lượng khách hàng phục vụ, chứng nhận chất lượng uy tín. Không dùng đánh giá giả mạo."),
        ("B7", "Ưu đãi, CTA & thông tin liên hệ", "Lý do phải mua ngay (quà tặng, ưu đãi thời hạn) + Call-to-Action rõ ràng + Hotline, địa chỉ cơ sở minh bạch."),
        ("B8", "Điểm khác biệt (USP)", "Nêu bật lý do chọn thương hiệu thay vì đối thủ (công nghệ độc quyền, bảng thành phần hiếm, tiêu chuẩn dịch vụ)."),
        ("B9", "Chuẩn sản xuất & hợp format nền tảng", "Đúng tỷ lệ khung hình (1:1 hoặc 9:16 cho Mobile, 16:9 cho Youtube), có phụ đề (subtitles), âm thanh rõ ràng không tạp âm."),
    ]

    for idx, (code, title, desc) in enumerate(criteria_b_data):
        row = crit_b_table.rows[idx + 1]
        c0, c1, c2 = row.cells[0], row.cells[1], row.cells[2]
        c0.width = Inches(0.6)
        c1.width = Inches(2.2)
        c2.width = Inches(4.0)

        for c, text, bold in [(c0, code, True), (c1, title, True), (c2, desc, False)]:
            p = c.paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(9)
            r.font.bold = bold
            fill = "ECFDF5" if idx % 2 == 0 else "FFFFFF"
            set_cell_background(c, fill)
            set_cell_margins(c, 60, 60, 80, 80)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # --- 5. CẤU TRÚC THƯ MỤC NGUỒN ---
    add_heading_styled(doc, "5. Bảng Trích Xuất Cấu Trúc Mã Nguồn (Source Tree)", 1)
    
    code_table = doc.add_table(rows=14, cols=3)
    code_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(["Đường dẫn file", "Phân loại", "Chức năng chi tiết"]):
        cell = code_table.rows[0].cells[i]
        set_cell_background(cell, "334155") # Dark Slate
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        run.font.size = Pt(9.5)
        set_cell_margins(cell, 80, 80, 100, 100)

    files_data = [
        ("vite.config.js", "Cấu hình / Mini Backend", "Setup Vite, Tailwind plugin; tích hợp API endpoint proxy (/api/evaluate-ad, /api/save-gwen-config)"),
        ("package.json", "Cấu hình dự án", "Khai báo dependencies: React 19, Lucide, TailwindCSS v4, Vite 8"),
        ("src/App.jsx", "Root Component", "Điều hướng chính, quản lý state tab, sidebar và đồng bộ tiêu chí A/B toàn cục"),
        ("src/components/Sidebar.jsx", "Navigation UI", "Thanh menu dọc 8 phân hệ, hỗ trợ thu gọn mượt mà"),
        ("src/components/Header.jsx", "Header UI", "Hiển thị tiêu đề động theo ngữ cảnh trang, trạng thái Meta Ads 2026 Engine"),
        ("src/components/Dashboard.jsx", "Overview View", "Màn hình chào mừng, banner chuyển sắc gradient và các thẻ tác vụ nhanh"),
        ("src/components/Evaluate.jsx", "Core View", "Form tải lên video/ảnh, cắt frames tự động, chọn chế độ đánh giá và modal chấm điểm"),
        ("src/components/EvaluationResult.jsx", "Result View", "Hiển thị điểm vòng tròn SVG Gauge, 18 thanh điểm 5 nấc, cảnh báo luật và 3 bài viết mẫu"),
        ("src/components/Criteria.jsx", "Settings View", "Giao diện cấu hình AI Gwen, quản lý CRUD 18 tiêu chí chấm điểm và test kết nối"),
        ("src/config/gwenConfig.js", "Configuration", "Lưu trữ baseUrl, apiKey, model kết nối tới hệ thống AI LLM"),
        ("src/data/criteriaData.js", "Data Fixtures", "Chứa nội dung mặc định của 18 tiêu chí chấm điểm Nhóm A và Nhóm B"),
        ("src/components/History.jsx", "History View", "Giao diện lịch sử thẩm định, thống kê điểm số, bộ lọc tìm kiếm và mở lại chi tiết báo cáo"),
        ("src/data/evaluationHistory.json", "JSON Database", "Hệ cơ sở dữ liệu file cục bộ lưu trữ tối đa 100 phiên thẩm định quảng cáo"),
    ]

    for idx, (path_val, f_type, f_desc) in enumerate(files_data):
        row = code_table.rows[idx + 1]
        c0, c1, c2 = row.cells[0], row.cells[1], row.cells[2]
        c0.width = Inches(2.2)
        c1.width = Inches(1.6)
        c2.width = Inches(3.0)

        for c, text, bold in [(c0, path_val, True), (c1, f_type, False), (c2, f_desc, False)]:
            p = c.paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(8.5)
            r.font.bold = bold
            fill = "F1F5F9" if idx % 2 == 0 else "FFFFFF"
            set_cell_background(c, fill)
            set_cell_margins(c, 50, 50, 70, 70)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # --- 6. HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH ---
    add_heading_styled(doc, "6. Hướng Dẫn Cài Đặt & Vận Hành Hệ Thống", 1)
    
    steps = [
        ("Bước 1: Cài đặt thư viện môi trường Node.js", "Mở terminal tại thư mục dự án và chạy lệnh:\n`npm install`"),
        ("Bước 2: Khởi động chế độ phát triển (Development Mode)", "Chạy lệnh phát triển với Vite dev server:\n`npm run dev`\nHệ thống sẽ mở máy chủ cục bộ (thường là http://localhost:5173)."),
        ("Bước 3: Cấu hình cổng kết nối AI", "Truy cập menu 'Bộ tiêu chí' trên thanh điều hướng bên trái. Chọn AI Model (khuyên dùng Gwen hoặc OpenAI Compatible), nhập API Key và Base URL, sau đó bấm 'Kiểm tra kết nối' và 'Lưu cấu hình'."),
        ("Bước 4: Tiến hành thẩm định quảng cáo", "Chuyển sang menu 'Đánh giá'. Kéo thả file video quảng cáo (MP4) hoặc ảnh sản phẩm, nhập Caption hoặc dán link quảng cáo. Bấm nút 'Chấm điểm quảng cáo' để AI phân tích và trả về báo cáo toàn diện.")
    ]

    for step_title, step_detail in steps:
        p = doc.add_paragraph()
        r = p.add_run(step_title + "\n")
        r.font.bold = True
        r.font.color.rgb = RGBColor(14, 116, 144)
        p.add_run(step_detail)

    # --- 7. ĐÁNH GIÁ & TIỀM NĂNG PHÁT TRIỂN ---
    add_heading_styled(doc, "7. Đánh Giá Hiện Trạng & Tiềm Năng Nâng Cấp", 1)
    
    doc.add_paragraph(
        "Dự án Creative Ads Check sở hữu nền tảng kiến trúc vững chắc, giao diện Dark Mode chuẩn mực "
        "và hệ thống prompt thẩm định chuyên biệt sát sườn với thực tế kinh doanh thẩm mỹ tại Việt Nam. "
        "Để hoàn thiện hệ thống trở thành nền tảng SaaS hoàn chỉnh, các hướng nâng cấp tiềm năng bao gồm:"
    )

    potentials = [
        ("Hoàn thiện các phân hệ mở rộng:", "Hiện thực hoá các tab 'Tìm ad đối thủ' (tích hợp Meta Ad Library API), 'Ý tưởng ads' (sinh kịch bản tự động theo trend), 'Thư viện luật' (tra cứu toàn văn các điều luật quảng cáo)."),
        ("Tích hợp Database lưu trữ lịch sử:", "Bổ sung Supabase hoặc SQLite backend để lưu lại toàn bộ các phiên chấm điểm, biểu đồ theo dõi tiến độ cải thiện điểm số theo thời gian của doanh nghiệp."),
        ("Xuất báo cáo PDF / Excel trực tiếp:", "Bổ sung nút xuất báo cáo kết quả thẩm định ra file PDF để agency gửi trực tiếp cho khách hàng phê duyệt kịch bản.")
    ]

    for title, desc in potentials:
        p = doc.add_paragraph(style='List Bullet')
        r = p.add_run(title + " ")
        r.font.bold = True
        p.add_run(desc)

    # Save documents
    docx_path = r"t:\checkads\Creative_Ads_Check_Project_Report.docx"
    doc.save(docx_path)
    print(f"Saved DOCX report to: {docx_path}")

    # Also make a copy with .doc extension for backward compatibility
    doc_path = r"t:\checkads\Creative_Ads_Check_Project_Report.doc"
    import shutil
    shutil.copyfile(docx_path, doc_path)
    print(f"Saved DOC report to: {doc_path}")

if __name__ == "__main__":
    main()

