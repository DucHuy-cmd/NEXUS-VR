import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_margins(cell, top=80, bottom=80, left=100, right=100):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="000000", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def format_table(table, col_widths_cm):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    tblPr = table._tbl.tblPr
    tblLayout = parse_xml(r'<w:tblLayout %s w:type="fixed"/>' % nsdecls('w'))
    tblPr.append(tblLayout)
    
    # Thiết lập độ rộng cột cho từng ô và tránh cắt ngang hàng qua trang
    for r_idx, row in enumerate(table.rows):
        trPr = row._tr.get_or_add_trPr()
        trPr.append(parse_xml(r'<w:cantSplit %s/>' % nsdecls('w')))
        if r_idx == 0:
            trPr.append(parse_xml(r'<w:tblHeader %s/>' % nsdecls('w')))
        for c_idx, width_cm in enumerate(col_widths_cm):
            if c_idx < len(row.cells):
                cell = row.cells[c_idx]
                cell.width = Cm(width_cm)
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                set_cell_margins(cell, top=90, bottom=90, left=110, right=110)
    set_table_borders(table, color="000000", sz="4")

def add_page_number_to_section(section):
    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run()
    fldSimple = parse_xml(r'<w:fldSimple %s w:instr="PAGE"/>' % nsdecls('w'))
    run._r.append(fldSimple)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(11)
    run.font.color.rgb = RGBColor(0, 0, 0)

def create_full_chapter3_word_doc():
    doc = Document()
    
    # 1. CÀI ĐẶT TRANG THEO QUY ĐỊNH CỦA TRƯỜNG ĐH GIAO THÔNG VẬN TẢI TP.HCM
    # Khổ A4: 21.0 cm x 29.7 cm
    # Lề trên: 3.5 cm, Lề dưới: 3.0 cm, Lề trái: 3.5 cm, Lề phải: 2.0 cm
    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(3.5)
    section.bottom_margin = Cm(3.0)
    section.left_margin = Cm(3.5)
    section.right_margin = Cm(2.0)
    
    # Đánh số trang ở giữa chân trang
    add_page_number_to_section(section)
    
    # 2. ĐỊNH NGHĨA CÁC KIỂU ĐỊNH DẠNG (STYLES) - TOÀN BỘ CHỮ MÀU ĐEN (RGB 0,0,0)
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(13)
    style_normal.font.color.rgb = RGBColor(0, 0, 0)
    style_normal.paragraph_format.line_spacing = 1.5
    style_normal.paragraph_format.space_after = Pt(6)
    style_normal.paragraph_format.space_before = Pt(0)
    style_normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # Đoạn văn bản chính chuẩn học thuật (không in đậm chữ nào trong nội dung)
    def add_para(text, indent=True):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(6)
        if indent:
            p.paragraph_format.first_line_indent = Cm(1.0)
        run = p.add_run(text)
        run.bold = False
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    # Gạch đầu dòng (-) chia nhỏ nội dung chi tiết (KHÔNG IN ĐẬM BẤT KỲ CHỮ NÀO)
    def add_dash_item(title, content_text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.left_indent = Cm(1.0)
        p.paragraph_format.first_line_indent = Cm(-0.5)
        
        run_dash = p.add_run("- ")
        run_dash.bold = False
        run_dash.font.name = 'Times New Roman'
        run_dash.font.size = Pt(13)
        run_dash.font.color.rgb = RGBColor(0, 0, 0)
        
        if title:
            run_title = p.add_run(title + ": ")
            run_title.bold = False  # KHÔNG IN ĐẬM THEO YÊU CẦU NGƯỜI DÙNG
            run_title.font.name = 'Times New Roman'
            run_title.font.size = Pt(13)
            run_title.font.color.rgb = RGBColor(0, 0, 0)
            
        run_text = p.add_run(content_text)
        run_text.bold = False  # KHÔNG IN ĐẬM
        run_text.font.name = 'Times New Roman'
        run_text.font.size = Pt(13)
        run_text.font.color.rgb = RGBColor(0, 0, 0)
        return p

    # Tiêu đề cấp 1: Tên chương (In hoa, in đậm, căn giữa, cỡ chữ 16 theo chuẩn quy định của trường)
    def add_h1(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(12)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(16)
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    # Tiêu đề cấp 2 (Mục 3.1, 3.2, 3.3): IN HOA HẾT, in đậm, không in nghiêng, CỠ CHỮ 13
    def add_h2(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text.upper())
        run.bold = True
        run.italic = False
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)  # CHÍNH XÁC CỠ CHỮ 13 THEO YÊU CẦU
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    # Tiêu đề cấp 3 (Mục 3.1.1, 3.1.2...): IN ĐẬM, KHÔNG IN NGHIÊNG, không cần in hoa hết, CỠ CHỮ 13
    def add_h3(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.italic = False
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)  # CỠ CHỮ 13
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    # Tên Bảng: Đặt PHÍA TRÊN bảng, CĂN GIỮA, IN NGHIÊNG, không tô màu
    def add_table_caption(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER  # CĂN GIỮA THEO YÊU CẦU
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = False
        run.italic = True  # IN NGHIÊNG
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    # Tên Hình: Đặt PHÍA DƯỚI hình, CĂN GIỮA, IN NGHIÊNG, không tô màu
    def add_figure_caption(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER  # CĂN GIỮA
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(12)
        run = p.add_run(text)
        run.bold = False
        run.italic = True  # IN NGHIÊNG
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    # Chèn hình ảnh căn giữa
    def insert_image(rel_path, width_cm=14.5):
        base_dir = os.path.dirname(os.path.dirname(__file__))
        full_path = os.path.join(base_dir, rel_path)
        if not os.path.exists(full_path):
            full_path = os.path.join(os.path.dirname(__file__), 'figures', os.path.basename(rel_path))
        if os.path.exists(full_path):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.keep_with_next = True
            run = p.add_run()
            run.add_picture(full_path, width=Cm(width_cm))
        else:
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(f"[Hình ảnh minh họa: {os.path.basename(rel_path)}]")
            run.italic = True
            run.font.color.rgb = RGBColor(0, 0, 0)

    # ====================================================
    # NỘI DUNG CHƯƠNG 3
    # ====================================================
    add_h1("CHƯƠNG 3: THIẾT KẾ VÀ TRIỂN KHAI WEBSITE")
    
    # ----------------------------------------------------
    # 3.1. THIẾT KẾ GIAO DIỆN (In hoa hết, cỡ chữ 13, in đậm)
    # ----------------------------------------------------
    add_h2("3.1. Thiết kế giao diện")
    
    # 3.1.1 (In đậm, không in nghiêng, cỡ chữ 13)
    add_h3("3.1.1. Sơ đồ cây cấu trúc website và luồng điều hướng")
    add_para("Quá trình xây dựng hệ thống website được khởi đầu bằng việc hoạch định kiến trúc thông tin tổng thể nhằm định hình lộ trình di chuyển của người sử dụng qua từng phân hệ. Cấu trúc trang được tổ chức theo mô hình phân cấp dạng cây kết hợp mạng lưới liên kết ngang, lấy trang chủ làm nút gốc điều phối toàn bộ luồng truy cập của hệ sinh thái. Từ trang chủ, hệ thống phân nhánh thành chín lối đi chuyên biệt bao gồm danh mục sản phẩm, chi tiết cấu hình sản phẩm, bảng so sánh thông số kỹ thuật, khu vực phân tích công nghệ phần cứng, hệ sinh thái ứng dụng không gian số, không gian đặt lịch trải nghiệm thực tế ảo, tiến trình thanh toán đơn hàng, cổng xác thực tài khoản và trang giới thiệu thương hiệu.")
    
    insert_image("CauTruc/figures/hinh3_1_so_do_cay.png", width_cm=14.5)
    add_figure_caption("Hình 3.1: Sơ đồ cây cấu trúc thông tin và luồng điều hướng website")
    
    add_para("Luồng điều hướng người dùng được thiết kế tối ưu hóa nhằm rút ngắn tối đa số thao tác cần thiết để tiếp cận dịch vụ, cụ thể bao gồm các luồng di chuyển chính như sau:")
    add_dash_item("Luồng điều hướng khám phá sản phẩm", "Từ trang chủ, người dùng tiếp cận trực tiếp biểu ngữ động học và các mẫu kính thực tế ảo tiêu biểu. Tại đây, chỉ với một thao tác nhấp chuột, khách hàng có thể chuyển thẳng đến trang chi tiết sản phẩm hoặc mở danh mục để lọc thiết bị theo nhu cầu.")
    add_dash_item("Luồng đối chiếu thông số chuyên sâu", "Tại khối tóm lược trên trang chủ hoặc thanh điều hướng chính, người dùng có thể kích hoạt trang so sánh kỹ thuật để đặt song song ba dòng thiết bị cạnh nhau, giúp phân tích chi tiết từng khác biệt về thấu kính và cấu hình phần cứng.")
    add_dash_item("Luồng đặt mua và thao tác giỏ hàng nhanh", "Tại bất kỳ vị trí hiển thị sản phẩm nào, nút đặt mua sẽ lập tức kích hoạt ngăn kéo giỏ hàng trượt ra từ mép phải màn hình mà không làm gián đoạn bối cảnh đọc tài liệu hiện tại của khách hàng.")
    add_dash_item("Luồng đặt lịch trải nghiệm phòng trưng bày", "Dẫn dắt khách hàng cao cấp đến biểu mẫu hẹn giờ thử nghiệm thiết bị trực tiếp, đồng thời kích hoạt hệ thống phát hành thẻ định danh kỹ thuật số ba chiều khắc tên thời gian thực.")
    add_dash_item("Thanh điều hướng cố định trên cùng", "Luôn xuất hiện thường trực tại mép trên màn hình khi cuộn trang, cho phép người dùng quay về trang chủ, truy cập giỏ hàng, mở thanh tìm kiếm hoặc thay đổi chế độ màu sắc hiển thị tại bất kỳ thời điểm nào.")
    add_dash_item("Chân trang chỉ mục toàn diện", "Đóng vai trò là bản đồ chỉ mục thứ cấp ở cuối mỗi trang, cung cấp liên kết truy cập các điều khoản sử dụng, chính sách bảo hành thấu kính, tọa độ địa lý phòng trưng bày và các kênh hỗ trợ khẩn cấp.")

    # 3.1.2 (In đậm, không in nghiêng, cỡ chữ 13)
    add_h3("3.1.2. Hệ thống quy chuẩn thiết kế giao diện")
    add_para("Hệ thống nhận diện thị giác của dự án được xây dựng dựa trên triết lý tối giản thượng hạng, chú trọng vào sự tương phản tinh tế giữa các gam màu tự nhiên và kim loại quý nhằm tôn vinh giá trị của dòng thiết bị điện toán không gian cao cấp. Toàn bộ các thông số về màu sắc, kiểu chữ và khoảng cách được quy chuẩn hóa dưới dạng các biến toàn cục tại tệp tin định dạng nền tảng, cho phép chuyển đổi trạng thái một cách đồng bộ trên toàn bộ mười trang giao diện.")
    
    add_table_caption("Bảng 3.1: Quy chuẩn hệ thống biến màu sắc cho hai chế độ giao diện sáng và tối")
    table_colors = doc.add_table(rows=1, cols=4)
    hdr_cells = table_colors.rows[0].cells
    hdr_titles = ["Tên Biến Định Dạng", "Mã Màu Nền Sáng", "Mã Màu Nền Tối", "Mục Đích Sử Dụng Trong Giao Diện"]
    for i, title in enumerate(hdr_titles):
        hdr_cells[i].text = title
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.2
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.space_before = Pt(2)
        run = p.runs[0]
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(11.5)  # TĂNG LÊN 11.5pt CHO TIÊU ĐỀ BẢNG ĐỂ DỄ ĐỌC
        run.font.color.rgb = RGBColor(0, 0, 0)

    color_data = [
        ("--canvas-bg", "#F8F5F0", "#100E0D", "Màu nền không gian chính của toàn bộ trang web"),
        ("--surface-panel", "#FAF7F2", "#171412", "Bề mặt các khối thông tin, khung chứa biểu mẫu"),
        ("--surface-panel-card", "#FFFFFF", "#1D1916", "Màu nền thẻ sản phẩm và thẻ tiếp đón kỹ thuật số"),
        ("--hairline-border", "rgba(200,169,130,0.20)", "rgba(200,169,130,0.18)", "Đường viền mảnh ngăn cách các thành phần giao diện"),
        ("--accent-gold", "#A6734B", "#C8A982", "Màu vàng đồng chủ đạo dùng cho nút nhấn và tiêu đề phụ"),
        ("--accent-gold-foil", "#C8A982", "#DFC19B", "Màu nhũ vàng kim loại tạo vệt sáng phản quang"),
        ("--text-main", "#261F1A", "#F7F3EE", "Văn bản tiêu đề và nội dung chính với độ tương phản cao"),
        ("--text-muted", "#5D5046", "#C5B8AB", "Văn bản phụ, mô tả tính năng và thông số kỹ thuật"),
        ("--text-dim", "#6E5F54", "#A89B8D", "Nhãn ngày tháng, tọa độ và ghi chú chân trang")
    ]
    for row_vals in color_data:
        row_cells = table_colors.add_row().cells
        for col_idx, val in enumerate(row_vals):
            row_cells[col_idx].text = val
            p = row_cells[col_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx in [1, 2] else WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.line_spacing = 1.2
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            run = p.runs[0]
            run.bold = False
            run.font.name = "Times New Roman"
            run.font.size = Pt(11)  # CỠ CHỮ 11pt ĐÁP ỨNG TỐT QUY ĐỊNH BẢNG BIỂU HỌC THUẬT
            run.font.color.rgb = RGBColor(0, 0, 0)
    # Khống chế độ rộng cột cố định: Tổng = 3.2 + 2.3 + 2.3 + 7.2 = 15.0 cm (không tràn)
    format_table(table_colors, [3.2, 2.3, 2.3, 7.2])

    insert_image("CauTruc/figures/hinh3_2_bang_mau_typography.png", width_cm=14.5)
    add_figure_caption("Hình 3.2: Bảng màu và hệ thống phông chữ quy chuẩn của giao diện")
    
    add_para("Các quy chuẩn thiết kế nhận diện thị giác được phân chia thành các thành tố kỹ thuật rõ rệt như sau:")
    add_dash_item("Quy chuẩn bảng màu chế độ nền sáng", "Sử dụng gam màu be nhạt F8F5F0 làm phông nền chủ đạo gợi cảm giác sợi len thượng hạng, văn bản dùng màu nâu cà phê đậm 261F1A tương phản cao dịu mắt, kết hợp sắc vàng đồng A6734B làm điểm nhấn sang trọng.")
    add_dash_item("Quy chuẩn bảng màu chế độ nền tối", "Nền chuyển sang màu đen đá vỏ chai 100E0D, các khối bề mặt mang màu nâu đen 171412, chữ viết đổi sang màu trắng sữa F7F3EE và màu vàng đồng được nâng độ sáng lên C8A982 nhằm giữ vững độ nhận diện.")
    add_dash_item("Quy chuẩn phông chữ tiêu đề chính", "Áp dụng phông chữ kỹ thuật số Space Grotesk với các nét cắt hình học dứt khoát, độ dày nét lớn và khoảng cách ký tự mở rộng, phản ánh tinh thần đổi mới của công nghệ thực tế ảo tám ca.")
    add_dash_item("Quy chuẩn phông chữ nội dung", "Sử dụng phông chữ Inter được tối ưu hóa chuyên sâu cho màn hình điện tử, hỗ trợ người dùng theo dõi các bảng thông số kỹ thuật phức tạp trong thời gian dài mà không mỏi mắt.")
    add_dash_item("Quy chuẩn phông chữ nghệ thuật", "Ứng dụng phông chữ có chân Playfair Display tại các tiêu đề phụ và trích dẫn triết lý, tạo điểm nhấn giao thoa hài hòa giữa kỹ thuật công nghệ cao và di sản chế tác thủ công.")
    add_dash_item("Quy chuẩn hệ thống lưới và khoảng cách", "Tuân thủ chặt chẽ nguyên tắc toán học dựa trên bội số tám điểm ảnh, bán kính bo góc cố định ở mức mười sáu và hai mươi tư điểm ảnh, đi kèm bóng đổ khuếch tán đa tầng tạo chiều sâu không gian quang học.")

    # 3.1.3 (In đậm, không in nghiêng, cỡ chữ 13)
    add_h3("3.1.3. Cấu trúc và tổ chức bố cục các trang màn hình chính")
    add_para("Hệ thống website NEXUS VR bao gồm mười màn hình chức năng độc lập, mỗi màn hình đảm nhận một nhiệm vụ riêng biệt trong tiến trình tiếp cận, nghiên cứu và quyết định mua hàng của khách hàng.")
    
    add_table_caption("Bảng 3.2: Danh mục mười trang giao diện chính và chức năng tương ứng")
    table_pages = doc.add_table(rows=1, cols=4)
    hdr_p_cells = table_pages.rows[0].cells
    hdr_p_titles = ["STT", "Tên Tệp Tin", "Tên Phân Hệ", "Chức Năng & Hành Động Chính Của Khách Hàng"]
    for i, title in enumerate(hdr_p_titles):
        hdr_p_cells[i].text = title
        p = hdr_p_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.2
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.space_before = Pt(2)
        run = p.runs[0]
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(11.5)  # 11.5pt TIÊU ĐỀ
        run.font.color.rgb = RGBColor(0, 0, 0)

    pages_data = [
        ("01", "index.html", "Trang Chủ", "Trình diễn biểu ngữ động, khối sản phẩm nổi bật, bảng so sánh nhanh"),
        ("02", "shop.html", "Danh Mục Sản Phẩm", "Lưới sản phẩm linh hoạt, thanh lọc đa tầng theo giá và phân loại"),
        ("03", "product.html", "Chi Tiết Sản Phẩm", "Bộ chọn cấu hình RAM và bộ nhớ, góc nhìn ba trăm sáu mươi độ"),
        ("04", "cart.html", "Giỏ Hàng Độc Lập", "Kiểm tra danh sách thiết bị, nhập phiếu ưu đãi, tiến tới thanh toán"),
        ("05", "checkout.html", "Thanh Toán Đơn Hàng", "Thu thập địa chỉ giao hàng, tóm tắt chi phí, thanh toán an toàn"),
        ("06", "contact.html", "Đặt Hẹn Showroom", "Biểu mẫu đặt lịch, khắc tên thẻ VIP ba chiều thời gian thực"),
        ("07", "login.html", "Xác Thực Tài Khoản", "Đăng nhập và đăng ký hai chiều, kiểm tra độ an toàn của mật khẩu"),
        ("08", "orders.html", "Theo Dõi Đơn Hàng", "Tra cứu lộ trình vận chuyển, lịch sử thanh toán và trạng thái xử lý"),
        ("09", "about.html", "Về Thương Hiệu", "Tuyên ngôn triết lý chế tác, công nghệ cốt lõi và đội ngũ sáng lập"),
        ("10", "404.html", "Điều Hướng Sự Cố", "Thông báo liên kết không tồn tại và cung cấp phím tắt trở về trang chủ")
    ]
    for row_vals in pages_data:
        row_cells = table_pages.add_row().cells
        for col_idx, val in enumerate(row_vals):
            row_cells[col_idx].text = val
            p = row_cells[col_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx in [0, 1] else WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.line_spacing = 1.2
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            run = p.runs[0]
            run.bold = False
            run.font.name = "Times New Roman"
            run.font.size = Pt(11)  # CỠ CHỮ 11pt RÕ RÀNG
            run.font.color.rgb = RGBColor(0, 0, 0)
    # Khống chế độ rộng cột cố định: Tổng = 1.2 + 2.8 + 3.5 + 7.5 = 15.0 cm (không tràn)
    format_table(table_pages, [1.2, 2.8, 3.5, 7.5])

    add_para("Các màn hình giao diện cốt lõi được triển khai với bố cục và chức năng cụ thể như sau:")
    add_dash_item("Giao diện trang chủ (index.html)", "Mở màn bằng biểu ngữ động học mang dòng chữ ánh kim lấp lánh, tiếp nối là khu vực trưng bày ba góc nhìn không gian của mẫu kính đầu bảng, khối giới thiệu công nghệ cốt lõi, bảng so sánh nhanh thông số và trích dẫn truyền thông chuyên môn.")
    insert_image("CauTruc/figures/hinh3_3_trang_chu.png", width_cm=14.5)
    add_figure_caption("Hình 3.3: Giao diện trang chủ với khối biểu ngữ động học và khu vực sản phẩm nổi bật")

    add_dash_item("Giao diện danh mục sản phẩm (shop.html)", "Được cấu trúc theo lưới hai chiều mở rộng, tích hợp bộ lọc thuộc tính đa tiêu chí giúp lọc nhanh theo dòng thiết bị, khoảng giá và nhu cầu ứng dụng. Mỗi thẻ sản phẩm đều có hiệu ứng nâng khối và phát sáng viền khi lướt chuột.")
    insert_image("CauTruc/figures/hinh3_4_danh_muc.png", width_cm=14.5)
    add_figure_caption("Hình 3.4: Giao diện danh mục sản phẩm kèm bộ lọc thuộc tính đa tiêu chí")

    add_dash_item("Giao diện chi tiết sản phẩm (product.html)", "Bố trí phòng trưng bày ảnh độ phân giải cao cho phép phóng to bề mặt chất liệu da và khung hợp kim ma-giê, đi kèm bộ điều khiển lựa chọn dung lượng bộ nhớ từ 256GB đến 1TB, phiên bản dây đeo và kiểm tra toa kính thuốc.")
    insert_image("CauTruc/figures/hinh3_5_chi_tiet.png", width_cm=14.5)
    add_figure_caption("Hình 3.5: Giao diện chi tiết sản phẩm và bảng chọn cấu hình bộ nhớ")

    add_dash_item("Giao diện giỏ hàng độc lập (cart.html)", "Cung cấp bảng tổng kết danh sách thiết bị, công cụ tăng giảm số lượng, nút xóa từng món và ô nhập mã ưu đãi chiết khấu trực tiếp, giúp người dùng nắm rõ chi phí trước khi chuyển sang bước thanh toán.")
    insert_image("CauTruc/figures/hinh3_6_gio_hang.png", width_cm=14.5)
    add_figure_caption("Hình 3.6: Giao diện giỏ hàng và danh sách sản phẩm chờ thanh toán")

    add_dash_item("Giao diện đặt hẹn và tiếp đón showroom (contact.html)", "Chia thành hai khu vực song song gồm biểu mẫu tiếp nhận thông tin khách hàng và sân khấu mô phỏng thẻ định danh ba chiều hai mặt tự động đồng bộ họ tên, mã số và khung giờ tiếp đón theo thời gian thực.")
    insert_image("CauTruc/figures/hinh3_7_dat_hen.png", width_cm=14.5)
    add_figure_caption("Hình 3.7: Giao diện không gian đặt hẹn và phát hành thẻ tiếp đón kỹ thuật số")

    add_dash_item("Giao diện thanh toán đơn hàng (checkout.html)", "Điều hướng người mua qua quy trình ba bước nhập thông tin nhận hàng, lựa chọn phương thức thanh toán bảo mật và rà soát hóa đơn điện tử minh bạch.")
    insert_image("CauTruc/figures/hinh3_8_thanh_toan.png", width_cm=14.5)
    add_figure_caption("Hình 3.8: Giao diện tiến trình thanh toán đơn hàng và xác thực giao dịch")

    add_dash_item("Giao diện các phân hệ tài khoản và phụ trợ", "Bao gồm trang xác thực tài khoản (login.html) hỗ trợ đăng nhập và đăng ký hai chiều có thanh đo độ mạnh mật khẩu, trang theo dõi đơn hàng (orders.html) tra cứu trạng thái giao hàng, trang triết lý thương hiệu (about.html) và trang báo lỗi điều hướng (404.html).")

    # 3.1.4 (In đậm, không in nghiêng, cỡ chữ 13)
    add_h3("3.1.4. Thiết kế thích ứng đa thiết bị và xử lý điểm ngắt màn hình")
    add_para("Nhằm bảo đảm website hoạt động hoàn hảo trên mọi kích thước màn hình từ điện thoại di động cỡ nhỏ đến màn hình máy tính để bàn khổ lớn, hệ thống áp dụng chiến lược thiết kế thích ứng toàn diện dựa trên sáu điểm ngắt then chốt.")
    
    add_table_caption("Bảng 3.3: Hệ thống điểm ngắt và quy tắc thích ứng đa thiết bị")
    table_bp = doc.add_table(rows=1, cols=4)
    hdr_bp_cells = table_bp.rows[0].cells
    hdr_bp_titles = ["Điểm Ngắt", "Nhóm Thiết Bị Mục Tiêu", "Quy Tắc Bố Cục Áp Dụng", "Hành Vi Thích Ứng Của Phần Tử"]
    for i, title in enumerate(hdr_bp_titles):
        hdr_bp_cells[i].text = title
        p = hdr_bp_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.2
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.space_before = Pt(2)
        run = p.runs[0]
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(11.5)  # 11.5pt TIÊU ĐỀ
        run.font.color.rgb = RGBColor(0, 0, 0)

    bp_data = [
        ("360px", "Điện thoại thông minh cỡ nhỏ", "Một cột đơn (minmax 0, 1fr)", "Nút điều khiển thu nhỏ, đệm lề co gọn 16px"),
        ("375px", "Điện thoại thế hệ nhỏ gọn", "Một cột đơn", "Các thẻ xếp chồng theo chiều dọc, chữ ký tối ưu 1.3rem"),
        ("390px", "Điện thoại tiêu chuẩn hiện đại", "Một cột đơn khóa tràn viền", "Thẻ VIP rộng 342px vừa vặn, không cuộn ngang"),
        ("768px", "Máy tính bảng và màn hình xoay", "Hai cột linh hoạt", "Biểu mẫu và thẻ VIP chuyển sang dạng lưới mở rộng"),
        ("1024px", "Máy tính xách tay tiêu chuẩn", "Hệ thống mười hai cột tỷ lệ", "Biểu mẫu chiếm 7 cột, thẻ VIP chiếm 5 cột ghim dính"),
        ("1440px", "Màn hình để bàn độ phân giải cao", "Mười hai cột căn giữa 1280px", "Tối đa hóa không gian đọc và khoảng cách sang trọng")
    ]
    for row_vals in bp_data:
        row_cells = table_bp.add_row().cells
        for col_idx, val in enumerate(row_vals):
            row_cells[col_idx].text = val
            p = row_cells[col_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx in [0] else WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.line_spacing = 1.2
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            run = p.runs[0]
            run.bold = False
            run.font.name = "Times New Roman"
            run.font.size = Pt(11)  # CỠ CHỮ 11pt
            run.font.color.rgb = RGBColor(0, 0, 0)
    # Khống chế độ rộng cột cố định: Tổng = 2.0 + 4.0 + 4.2 + 4.8 = 15.0 cm (không tràn)
    format_table(table_bp, [2.0, 4.0, 4.2, 4.8])

    insert_image("CauTruc/figures/hinh3_9_thich_ung_mobile.png", width_cm=8.5)
    add_figure_caption("Hình 3.9: Giao diện thích ứng trên các kích thước màn hình điện thoại di động")

    add_para("Chi tiết phân tích nguyên nhân sự cố vỡ bố cục trên thiết bị di động và các biện pháp kỹ thuật khắc phục triệt để như sau:")
    add_dash_item("Hiện tượng lỗi thực tế trên iPhone 12", "Trên màn hình có độ rộng ba trăm chín mươi điểm ảnh, giao diện trang đặt hẹn xuất hiện thanh cuộn ngang ngoài ý muốn, thẻ tiếp đón ba chiều và phần biểu mẫu bị cắt cụt một nửa ở mép phải màn hình.")
    add_dash_item("Nguyên nhân kỹ thuật cốt lõi", "Bắt nguồn từ các ô nút chọn gói dịch vụ chứa chuỗi ký tự dài vượt quá bốn trăm điểm ảnh có thuộc tính ngăn ngắt dòng, ép cột lưới trong CSS phình to vượt quá bề rộng màn hình thực tế.")
    add_dash_item("Giải pháp dùng hàm minmax trong CSS Grid", "Định nghĩa lại cấu trúc cột lưới bằng cú pháp kết hợp giá trị tối thiểu bằng không và tối đa một phần tỷ lệ (minmax(0, 1fr)), cho phép khung chứa tự động co gọn theo màn hình di động.")
    add_dash_item("Giải pháp kiểm soát bề rộng tối thiểu phần tử", "Thiết lập thuộc tính chiều rộng tối thiểu bằng không (min-width: 0) và ngắt dòng tự động trên các nhãn văn bản, giúp chuỗi ký tự dài tự động xuống dòng an toàn hoặc hiển thị dấu ba chấm.")
    add_dash_item("Tinh chỉnh khoảng đệm và khóa kích thước thẻ", "Giảm đệm lề hai bên khung biểu mẫu từ ba mươi hai điểm ảnh xuống hai mươi điểm ảnh, đồng thời ấn định chiều rộng tối đa của thẻ tiếp đón ở mức ba trăm bốn mươi hai điểm ảnh để vừa khít hoàn hảo trong khung nhìn.")

    # ----------------------------------------------------
    # 3.2. CHỨC NĂNG VÀ TƯƠNG TÁC NGƯỜI DÙNG (In hoa hết, cỡ chữ 13, in đậm)
    # ----------------------------------------------------
    add_h2("3.2. Chức năng và tương tác người dùng")
    
    # 3.2.1 (In đậm, không in nghiêng, cỡ chữ 13)
    add_h3("3.2.1. Hệ thống thẻ tiếp đón kỹ thuật số ba chiều hai mặt")
    add_para("Thẻ tiếp đón kỹ thuật số là một thành phần giao diện mang tính đột phá của website, đóng vai trò là chiếc thẻ thành viên cao cấp chứng nhận quyền tham quan và trải nghiệm phòng trưng bày của khách hàng. Chiếc thẻ được lập trình hoạt động trong không gian phối cảnh ba chiều với góc nhìn sâu một nghìn hai trăm điểm ảnh, cho phép xoay lật hai mặt một trăm tám mươi độ quanh trục thẳng đứng.")
    
    insert_image("CauTruc/figures/hinh3_10_the_vip_mat_truoc.png", width_cm=9.5)
    add_figure_caption("Hình 3.10: Chi tiết mặt trước của thẻ tiếp đón với hiệu ứng khắc chữ thời gian thực")

    add_para("Các đặc điểm cấu tạo và cơ chế vận hành của mặt trước chiếc thẻ bao gồm:")
    add_dash_item("Bố cục nhận diện mặt trước", "Hiển thị biểu tượng thương hiệu mạ vàng, nhãn cấp độ thành viên tiếp đón danh dự, bảng vi mạch quang học mô phỏng và khu vực thông tin cá nhân của khách hàng.")
    add_dash_item("Cơ chế khắc chữ la-ze thời gian thực", "Khi người dùng nhập họ tên vào biểu mẫu, sự kiện nhập liệu kích hoạt hiệu ứng tia sáng quét ngang và đồng bộ tức thì từng ký tự sang mặt thẻ với độ trễ phản hồi bằng không.")
    add_dash_item("Đồng bộ khung giờ và mã số định danh", "Mã đặt chỗ ngẫu nhiên độc bản và khung giờ tiếp đón được cập nhật ngay lập tức theo các nút chọn ca trải nghiệm sáng, chiều hoặc tối trên biểu mẫu.")

    insert_image("CauTruc/figures/hinh3_11_the_vip_mat_sau.png", width_cm=9.5)
    add_figure_caption("Hình 3.11: Chi tiết mặt sau của thẻ tiếp đón với dải từ tính và dải chữ ký số")

    add_para("Các chi tiết kỹ thuật ở mặt sau của thẻ và các hiệu ứng quang học kèm theo:")
    add_dash_item("Cấu trúc dải từ tính và bảo mật mặt sau", "Tái hiện cấu trúc thẻ kim loại đen mờ với dải từ tính trải rộng toàn bộ chiều ngang, con dấu tròn sắc vàng đồng, mã băm lượng tử bảo mật và dải chữ ký số của chủ nhân.")
    add_dash_item("Dải chữ ký tay nghệ thuật", "Tự động chuyển đổi chuỗi ký tự tên khách hàng sang phông chữ viết tay mềm mại trên nền trắng ngà, cố định vị trí mã an ninh ba chữ số không bị đẩy lệch ra ngoài mép thẻ.")
    add_dash_item("Hiệu ứng quang học phản chiếu đa tầng", "Phủ hai lớp hiệu ứng chuyển động gồm điểm phản quang ánh kim tính toán theo tọa độ chuột hoặc con quay hồi chuyển, kết hợp lớp màng tán sắc cầu vồng bảy màu di chuyển độc lập tạo chiều sâu vật lý.")
    add_dash_item("Hệ thống âm thanh phản hồi xúc giác", "Tích hợp công nghệ âm thanh web phát tiếng xoay ma sát tần số bốn trăm héc-zơ khi lật thẻ và tiếng gõ thủy tinh nhẹ khi chọn nút, hỗ trợ nút tắt âm thanh lưu vào bộ nhớ trình duyệt.")
    add_dash_item("Chức năng xuất vé thông hành số", "Cho phép đóng gói dữ liệu thành thẻ thông hành điện tử tải về máy tính để xuất trình khi tới tham quan phòng trưng bày thực tế.")

    # 3.2.2 (In đậm, không in nghiêng, cỡ chữ 13)
    add_h3("3.2.2. Cơ chế quản lý giỏ hàng thời gian thực")
    add_para("Chức năng giỏ hàng của dự án được triển khai theo mô hình ngăn kéo trượt thông minh, kết hợp giữa khả năng cập nhật trạng thái thời gian thực và độ bền vững dữ liệu trên trình duyệt người dùng.")
    add_dash_item("Cơ chế phát tín hiệu sự kiện toàn cục", "Khi khách hàng bấm nút đặt mua tại bất kỳ trang nào, sự kiện tùy chỉnh được phát ra trên cây tài liệu để bộ điều khiển trung tâm tiếp nhận thông tin sản phẩm và cấu hình đã chọn.")
    add_dash_item("Ngăn kéo giỏ hàng trượt thông minh", "Xuất hiện mượt mà từ cạnh phải màn hình kèm lớp màn mờ phủ nền, giúp người dùng tập trung hoàn toàn vào đơn hàng mà không bị chuyển trang.")
    add_dash_item("Tương tác danh mục sản phẩm trực quan", "Hiển thị ảnh thu nhỏ, tên thiết bị, phiên bản bộ nhớ, đơn giá, cụm nút điều chỉnh số lượng và nút xóa từng món hàng nhanh chóng.")
    add_dash_item("Tính toán tài chính tự động thời gian thực", "Liên tục tính toán lại tổng tiền hàng, tiền thuế giá trị gia tăng mười phần trăm và áp dụng chiết khấu mã giảm giá với thời gian phản hồi tức thì.")
    add_dash_item("Lưu trữ dữ liệu bền vững qua bộ nhớ cục bộ", "Đồng bộ hóa liên tục vào bộ nhớ trình duyệt dưới định dạng chuỗi đối tượng mã hóa, bảo đảm giỏ hàng nguyên vẹn khi tải lại trang hoặc chuyển hướng qua mười trang khác nhau.")

    # 3.2.3 (In đậm, không in nghiêng, cỡ chữ 13)
    add_h3("3.2.3. Bảng đối chiếu và so sánh thông số kỹ thuật động")
    add_para("Nhằm giải quyết bài toán khó khăn của khách hàng khi phải lựa chọn giữa các dòng thiết bị thực tế ảo có cấu hình phần cứng tương đồng, hệ thống cung cấp một bảng so sánh kỹ thuật tương tác thông minh. Bảng đối chiếu này cho phép đặt cạnh nhau tối đa ba sản phẩm khác nhau trên cùng một khung nhìn để phân tích chi tiết từng khía cạnh kỹ thuật từ ống kính quang học, màn hình hiển thị, hệ thống xử lý trung tâm cho đến kết nối không dây và thời lượng pin.")
    
    add_table_caption("Bảng 3.4: Bảng đối chiếu thông số kỹ thuật các dòng kính thực tế ảo trên giao diện so sánh")
    table_compare = doc.add_table(rows=1, cols=4)
    hdr_c_cells = table_compare.rows[0].cells
    hdr_c_titles = ["Tiêu Chí So Sánh", "NEXUS Vision Pro 8K", "NEXUS Vision Studio", "NEXUS Vision Air Lite"]
    for i, title in enumerate(hdr_c_titles):
        hdr_c_cells[i].text = title
        p = hdr_c_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.2
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.space_before = Pt(2)
        run = p.runs[0]
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(11.5)  # 11.5pt TIÊU ĐỀ BẢNG
        run.font.color.rgb = RGBColor(0, 0, 0)

    compare_data = [
        ("Độ phân giải hiển thị", "Kép 8K (3840 x 2160 mỗi mắt)", "Kép 6K (3072 x 1920 mỗi mắt)", "Kép 4K (2160 x 2160 mỗi mắt)"),
        ("Góc nhìn thấu kính (FOV)", "120 độ siêu rộng", "110 độ tiêu chuẩn", "105 độ linh hoạt"),
        ("Tần số quét màn hình", "120Hz thích ứng", "90Hz - 120Hz", "90Hz cố định"),
        ("Hệ thống vi xử lý", "Kép R1 Quang Học + M2 Không Gian", "R1 Quang Học Độc Lập", "Vi xử lý di động tối ưu"),
        ("Trọng lượng khung đeo", "465 gram (Hợp kim ma-giê)", "490 gram (Khung nhôm)", "380 gram (Vỏ carbon)"),
        ("Thời lượng pin liên tục", "3.5 giờ (Pin mở rộng 6 giờ)", "3.0 giờ", "2.5 giờ"),
        ("Giá niêm yết chính hãng", "89.990.000 VNĐ", "64.990.000 VNĐ", "39.990.000 VNĐ")
    ]
    for row_vals in compare_data:
        row_cells = table_compare.add_row().cells
        for col_idx, val in enumerate(row_vals):
            row_cells[col_idx].text = val
            p = row_cells[col_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx > 0 else WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.line_spacing = 1.2
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            run = p.runs[0]
            run.bold = False
            run.font.name = "Times New Roman"
            run.font.size = Pt(11)  # CỠ CHỮ 11pt RÕ RÀNG
            run.font.color.rgb = RGBColor(0, 0, 0)
    # Khống chế độ rộng cột cố định: Tổng = 3.6 + 3.8 + 3.8 + 3.8 = 15.0 cm (không tràn)
    format_table(table_compare, [3.6, 3.8, 3.8, 3.8])

    add_para("Các tính năng hỗ trợ đối chiếu thông minh được tích hợp trên bảng bao gồm:")
    add_dash_item("Cơ chế làm nổi bật sự khác biệt", "Tự động làm mờ các dòng thông số có giá trị tương đồng và gia tăng độ sáng cho những điểm chênh lệch lớn như độ phân giải hay dung lượng pin, giúp khách hàng nhận diện nhanh điểm vượt trội.")
    add_dash_item("Cố định hàng tiêu đề khi cuộn trang", "Duy trì ảnh và tên sản phẩm luôn ghim dính tại mép trên màn hình máy tính khi người dùng cuộn xem các thông số kỹ thuật bên dưới.")
    add_dash_item("Hỗ trợ cuộn ngang mượt mà trên di động", "Thiết lập thanh chỉ báo vị trí trực quan và hỗ trợ thao tác vuốt chạm hai chiều trên điện thoại, ngăn ngừa hiện tượng vỡ khung ngang toàn trang.")

    # 3.2.4 (In đậm, không in nghiêng, cỡ chữ 13)
    add_h3("3.2.4. Cơ chế chuyển đổi và đồng bộ giao diện sáng tối")
    add_para("Hệ thống chuyển đổi chế độ hiển thị giữa sáng và tối được thiết kế nhằm thích ứng linh hoạt với môi trường ánh sáng xung quanh và thói quen thị giác của từng khách hàng. Trình điều khiển giao diện sử dụng nút bấm chuyển đổi biểu tượng mặt trời và mặt trăng đặt tại vị trí trung tâm của thanh điều hướng chính.")
    
    insert_image("CauTruc/figures/hinh3_12_chuyen_doi_sang_toi.png", width_cm=14.5)
    add_figure_caption("Hình 3.12: Cơ chế chuyển đổi đồng bộ giữa giao diện nền sáng và giao diện nền tối")

    add_para("Chi tiết quy trình chuyển đổi và kỹ thuật chống chớp nháy giao diện:")
    add_dash_item("Thao tác chuyển đổi tập trung", "Người dùng kích hoạt chuyển đổi dễ dàng qua nút bấm trên thanh điều hướng chính với biểu tượng mặt trời và mặt trăng trực quan.")
    add_dash_item("Hiệu ứng chuyển tiếp mềm mại", "JavaScript bổ sung hoặc loại bỏ lớp định danh chế độ tối tại thẻ gốc của tài liệu, kích hoạt quá trình chuyển sắc độ kéo dài không phẩy bốn mươi lăm giây xóa tan hiện tượng giật cục thị giác.")
    add_dash_item("Ghi nhớ trạng thái vào bộ nhớ cục bộ", "Lưu trữ lựa chọn của người dùng vào bộ nhớ máy tính để duy trì trạng thái nhất quán trong toàn bộ phiên làm việc.")
    add_dash_item("Tập lệnh ưu tiên chống chớp nháy màu", "Thực thi đoạn mã nhẹ ngay tại phần đầu tài liệu trước khi trình duyệt dựng khung giao diện, đọc trạng thái đã lưu để gán trước lớp định danh, loại bỏ triệt để hiện tượng chớp sáng trước khi chuyển tối.")

    # ----------------------------------------------------
    # 3.3. MÃ NGUỒN VÀ CẤU TRÚC DỰ ÁN (In hoa hết, cỡ chữ 13, in đậm)
    # ----------------------------------------------------
    add_h2("3.3. Mã nguồn và cấu trúc dự án")
    
    # 3.3.1 (In đậm, không in nghiêng, cỡ chữ 13)
    add_h3("3.3.1. Cấu trúc thư mục mã nguồn và phân tầng chức năng")
    add_para("Mã nguồn của dự án được tổ chức khoa học theo nguyên tắc tách biệt mối quan tâm và cấu trúc hóa theo từng phân tầng chức năng rõ rệt. Cây thư mục gốc của dự án được phân chia thành ba khối chính bao gồm khối tệp tin tài liệu gốc, khối tài nguyên tĩnh và khối phục vụ máy chủ.")
    
    add_table_caption("Bảng 3.5: Cấu trúc phân tầng thư mục mã nguồn dự án")
    table_struct = doc.add_table(rows=1, cols=3)
    hdr_s_cells = table_struct.rows[0].cells
    hdr_s_titles = ["Thư Mục / Tệp Tin", "Phân Tầng Chức Năng", "Nhiệm Vụ Và Nội Dung Chứa"]
    for i, title in enumerate(hdr_s_titles):
        hdr_s_cells[i].text = title
        p = hdr_s_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.2
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.space_before = Pt(2)
        run = p.runs[0]
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(11.5)  # 11.5pt TIÊU ĐỀ BẢNG
        run.font.color.rgb = RGBColor(0, 0, 0)

    struct_data = [
        ("/*.html", "Tài liệu khung xương", "10 trang màn hình định nghĩa cấu trúc ngữ nghĩa HTML5"),
        ("/assets/css/variables.css", "Nền tảng quy chuẩn", "Khai báo toàn bộ Design Tokens màu sắc, phông chữ, bóng đổ"),
        ("/assets/css/global.css", "Kiểu dáng toàn cục", "Quy định bố cục body, container, liên kết và quy chuẩn cuộn"),
        ("/assets/css/pages/", "Kiểu dáng màn hình", "10 tệp tin CSS độc lập phục vụ cho từng trang giao diện riêng"),
        ("/assets/css/components/", "Thành phần tái sử dụng", "Kiểu dáng thanh điều hướng, chân trang, giỏ hàng, thông báo"),
        ("/assets/js/controllers/", "Điều khiển nghiệp vụ", "Các bộ điều khiển độc lập phụ trách logic cho từng trang"),
        ("/assets/js/modules/", "Động cơ tiện ích", "Bộ kiểm tra form, quản lý giỏ hàng, chuyển đổi giao diện sáng tối"),
        ("/assets/js/animations/", "Hiệu ứng chuyển động", "Đăng ký các hiệu ứng quang học và hoạt họa tương tác"),
        ("/assets/images/", "Tài nguyên đồ họa", "Hình ảnh thấu kính, ảnh thực tế ảo, biểu tượng SVG vector"),
        ("/server/", "Dịch vụ máy chủ", "Mã nguồn máy chủ Node.js Express xử lý API và gửi nhận form")
    ]
    for row_vals in struct_data:
        row_cells = table_struct.add_row().cells
        for col_idx, val in enumerate(row_vals):
            row_cells[col_idx].text = val
            p = row_cells[col_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx == 1 else WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.line_spacing = 1.2
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            run = p.runs[0]
            run.bold = False
            run.font.name = "Times New Roman"
            run.font.size = Pt(11)  # CỠ CHỮ 11pt RÕ RÀNG
            run.font.color.rgb = RGBColor(0, 0, 0)
    # Khống chế độ rộng cột cố định: Tổng = 4.0 + 3.5 + 7.5 = 15.0 cm (không tràn)
    format_table(table_struct, [4.0, 3.5, 7.5])

    add_para("Phân định vai trò chi tiết của từng phân tầng mã nguồn như sau:")
    add_dash_item("Khối tài liệu khung xương siêu văn bản", "Bao gồm mười tệp tin định dạng HTML5 đóng vai trò bộ khung cấu trúc ngữ nghĩa thuần túy, liên kết trực tiếp tới các tệp CSS và JavaScript tương ứng mà không chứa mã lệnh nội tuyến.")
    add_dash_item("Khối tài nguyên kiểu dáng tĩnh", "Được phân chia có hệ thống giữa tệp tin thiết lập biến nền tảng, kiểu dáng toàn cục, thư mục thành phần giao diện tái sử dụng và thư mục kiểu dáng riêng biệt cho từng trang con.")
    add_dash_item("Khối kịch bản điều khiển logic", "Phân tầng thành bộ điều khiển nghiệp vụ theo trang, các mô đun động cơ tiện ích tính toán giỏ hàng, xác thực biểu mẫu và hệ thống đăng ký hiệu ứng quang học.")
    add_dash_item("Khối tài nguyên hình ảnh đồ họa", "Phân loại ngăn nắp theo ảnh biểu ngữ, ảnh chân dung sản phẩm độ phân giải cao và biểu tượng đồ họa vector SVG tối ưu tốc độ tải trang.")
    add_dash_item("Khối máy chủ dịch vụ phụ trợ", "Chạy trên môi trường Node.js cung cấp giao diện lập trình giả lập, điều phối tiếp nhận thông tin từ biểu mẫu liên hệ và thiết lập tiêu đề mạng an toàn.")

    # 3.3.2 (In đậm, không in nghiêng, cỡ chữ 13)
    add_h3("3.3.2. Quy chuẩn xây dựng mã nguồn và quy tắc định danh")
    add_para("Nhằm bảo đảm tính đồng bộ và thuận tiện trong quá trình phát triển nhóm, dự án thiết lập hệ thống quy chuẩn kỹ thuật khắt khe xuyên suốt mã nguồn.")
    add_dash_item("Quy tắc định danh kiểu dáng ba thành phần", "Áp dụng phương pháp BEM với tên khối làm tiền tố, nối với phần tử qua hai dấu gạch dưới và nối với biến thể trạng thái qua hai dấu gạch ngang, triệt tiêu hoàn toàn nguy cơ xung đột thuộc tính giữa các trang.")
    add_dash_item("Quy chuẩn chú thích tài liệu học thuật", "Mọi hàm xử lý trong JavaScript đều có khối chú thích nêu rõ mục đích nghiệp vụ, danh sách tham số đầu vào kèm kiểu dữ liệu, giá trị trả về và các sự kiện phát ra.")
    add_dash_item("Chế độ kiểm soát chặt chẽ trong kịch bản", "Kích hoạt chế độ kiểm soát nghiêm ngặt trong JavaScript, bắt buộc khai báo biến minh bạch và cấm tuyệt đối việc sử dụng biến toàn cục tự do gây ô nhiễm bộ nhớ.")
    add_dash_item("Kiểm tra tính hợp lệ biểu mẫu hai lớp", "Kết hợp ràng buộc kiểu dữ liệu của HTML5 với các biểu thức chính quy trong tập lệnh, mang lại phản hồi lỗi tức thì và ngăn chặn việc gửi dữ liệu rỗng.")

    # 3.3.3 (In đậm, không in nghiêng, cỡ chữ 13)
    add_h3("3.3.3. Phân tích các mô đun xử lý logic cốt lõi")
    add_para("Sơ đồ kiến trúc luồng dữ liệu và điều phối sự kiện phía trình duyệt thể hiện mối quan hệ cộng tác nhịp nhàng giữa các tầng giao diện người dùng, tầng bộ điều khiển nghiệp vụ và tầng lưu trữ bộ nhớ cục bộ.")
    
    insert_image("CauTruc/figures/hinh3_13_kien_truc_du_lieu.png", width_cm=14.5)
    add_figure_caption("Hình 3.13: Sơ đồ kiến trúc luồng dữ liệu và điều phối sự kiện phía trình duyệt")

    add_para("Phân tích chi tiết hai mô đun giải thuật trọng tâm của dự án:")
    add_dash_item("Thuật toán điều khiển phối cảnh ba chiều thẻ tiếp đón", "Lắng nghe tọa độ chuột trong phạm vi khung chứa, quy đổi tọa độ điểm ảnh sang khoảng giá trị chuẩn hóa từ trừ một đến một tính từ tâm thẻ, khống chế góc nghiêng tối đa mười một độ để bảo đảm tính thực tế vật lý.")
    add_dash_item("Vòng lặp chuyển động có quán tính mượt mà", "Vận hành theo chu kỳ khung hình trình duyệt với hệ số suy giảm không phẩy một, liên tục bù trừ chênh lệch giữa góc nghiêng mục tiêu và góc nghiêng hiện tại tạo cảm giác chiếc thẻ có trọng lượng thực tế.")
    add_dash_item("Thuật toán tìm kiếm và quản lý hàng hóa trong giỏ hàng", "Tiến hành quét mảng đối tượng lưu trong bộ nhớ; nếu sản phẩm cùng mã cấu hình và màu sắc đã tồn tại thì chỉ tăng số lượng thêm một, nếu là biến thể mới sẽ đẩy một đối tượng độc lập vào danh sách.")
    add_dash_item("Động cơ tính toán tài chính và định dạng số học", "Quét toàn bộ đơn hàng để nhân đơn giá với số lượng, cộng thuế giá trị gia tăng mười phần trăm, trừ tỷ lệ ưu đãi hợp lệ và đưa kết quả qua hàm định dạng phân tách hàng nghìn bằng dấu chấm chuẩn tiền đồng Việt Nam.")

    # 4. LƯU TỆP TIN WORD RA ĐĨA
    output_docx_cautruc = os.path.join(os.path.dirname(__file__), 'Chuong_3_Thiet_Ke_Va_Trien_Khai_Website.docx')
    output_docx_root = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Chuong_3_Thiet_Ke_Va_Trien_Khai_Website.docx')
    
    doc.save(output_docx_cautruc)
    doc.save(output_docx_root)
    print(f"SUCCESS: Saved docx to {output_docx_cautruc}")
    print(f"SUCCESS: Also saved to root {output_docx_root}")

if __name__ == '__main__':
    create_full_chapter3_word_doc()
