import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="C8A982", sz="4", val="single"):
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

def add_page_number_to_section(section):
    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run()
    fldSimple = parse_xml(r'<w:fldSimple %s w:instr="PAGE"/>' % nsdecls('w'))
    run._r.append(fldSimple)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(11)

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
    
    # 2. ĐỊNH NGHĨA CÁC KIỂU ĐỊNH DẠNG (STYLES)
    # Style Normal cho văn bản thường
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(13)
    style_normal.font.color.rgb = RGBColor(0x1A, 0x1A, 0x1A)
    style_normal.paragraph_format.line_spacing = 1.5
    style_normal.paragraph_format.space_after = Pt(6)
    style_normal.paragraph_format.space_before = Pt(0)
    style_normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # Hàm trợ giúp thêm đoạn văn bản chuẩn
    def add_para(text, indent=True):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(6)
        if indent:
            p.paragraph_format.first_line_indent = Cm(1.0)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        return p

    # Hàm thêm tiêu đề cấp 1 (Tên chương)
    def add_h1(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(12)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(15)
        run.font.color.rgb = RGBColor(0x8B, 0x5A, 0x2B) # Nâu đồng sang trọng
        return p

    # Hàm thêm tiêu đề cấp 2
    def add_h2(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13.5)
        run.font.color.rgb = RGBColor(0x22, 0x22, 0x22)
        return p

    # Hàm thêm tiêu đề cấp 3
    def add_h3(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.italic = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
        return p

    # Hàm thêm tên Bảng (đặt PHÍA TRÊN bảng theo quy định trường)
    def add_table_caption(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.font.color.rgb = RGBColor(0x33, 0x2B, 0x25)
        return p

    # Hàm thêm tên Hình (đặt PHÍA DƯỚI hình theo quy định trường)
    def add_figure_caption(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(12)
        run = p.add_run(text)
        run.italic = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.font.color.rgb = RGBColor(0x44, 0x3A, 0x30)
        return p

    # Hàm chèn hình ảnh căn giữa
    def insert_image(rel_path, width_cm=14.5):
        base_dir = os.path.dirname(__file__)
        full_path = os.path.join(base_dir, rel_path)
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
            run.font.color.rgb = RGBColor(0x88, 0x88, 0x88)

    # 3. NỘI DUNG CHƯƠNG 3
    add_h1("CHƯƠNG 3: THIẾT KẾ VÀ TRIỂN KHAI WEBSITE")
    
    # ----------------------------------------------------
    # 3.1. Thiết kế giao diện
    # ----------------------------------------------------
    add_h2("3.1. Thiết kế giao diện")
    
    add_h3("3.1.1. Sơ đồ cây cấu trúc website và luồng điều hướng")
    add_para("Quá trình xây dựng hệ thống website được khởi đầu bằng việc hoạch định kiến trúc thông tin tổng thể nhằm định hình lộ trình di chuyển của người sử dụng qua từng phân hệ. Cấu trúc trang được tổ chức theo mô hình phân cấp dạng cây kết hợp mạng lưới liên kết ngang, lấy trang chủ làm nút gốc điều phối toàn bộ luồng truy cập của hệ sinh thái. Từ trang chủ, hệ thống phân nhánh thành chín lối đi chuyên biệt bao gồm danh mục sản phẩm, chi tiết cấu hình sản phẩm, bảng so sánh thông số kỹ thuật, khu vực phân tích công nghệ phần cứng, hệ sinh thái ứng dụng không gian số, không gian đặt lịch trải nghiệm thực tế ảo, tiến trình thanh toán đơn hàng, cổng xác thực tài khoản và trang giới thiệu thương hiệu.")
    
    # Chèn Hình 3.1
    insert_image("CauTruc/figures/hinh3_1_so_do_cay.png", width_cm=14.5)
    add_figure_caption("Hình 3.1: Sơ đồ cây cấu trúc thông tin và luồng điều hướng website")
    
    add_para("Luồng điều hướng người dùng được thiết kế tối ưu hóa nhằm rút ngắn tối đa số thao tác cần thiết để tiếp cận dịch vụ. Khi người dùng truy cập trang chủ, họ có thể ngay lập tức quan sát được thông tin của các dòng kính thực tế ảo tiêu biểu. Nếu có nhu cầu đối chiếu chi tiết, một thao tác nhấp chuột tại bảng tóm lược sẽ dẫn thẳng người dùng sang trang so sánh chuyên sâu. Trường hợp người dùng mong muốn đặt mua thiết bị, nút thao tác nhanh sẽ kích hoạt ngăn kéo giỏ hàng trượt ra từ cạnh phải màn hình mà không làm gián đoạn bối cảnh đọc thông tin hiện tại. Đối với đối tượng khách hàng cao cấp có nhu cầu thử nghiệm thiết bị trực tiếp trước khi quyết định mua hàng, thanh điều hướng chính cung cấp lối đi thẳng đến khu vực đặt hẹn tại phòng trưng bày, nơi hệ thống phát hành thẻ định danh điện tử theo thời gian thực.")
    add_para("Bên cạnh luồng điều hướng dọc từ trang chủ xuống các trang con, hệ thống còn duy trì thanh điều hướng cố định trên cùng và chân trang toàn diện tại đáy mỗi màn hình. Thanh điều hướng cố định bảo đảm người dùng luôn có thể quay về trang chủ, truy cập giỏ hàng, mở bảng tìm kiếm hoặc thay đổi chế độ màu sắc hiển thị tại bất kỳ thời điểm nào trong phiên làm việc. Chân trang đóng vai trò là bản đồ chỉ mục thứ cấp, cung cấp đầy đủ liên kết tới các điều khoản sử dụng, chính sách bảo hành thấu kính, tọa độ địa lý của phòng trưng bày và các kênh liên lạc khẩn cấp.")

    add_h3("3.1.2. Hệ thống quy chuẩn thiết kế giao diện")
    add_para("Hệ thống nhận diện thị giác của dự án được xây dựng dựa trên triết lý tối giản thượng hạng, chú trọng vào sự tương phản tinh tế giữa các gam màu tự nhiên và kim loại quý nhằm tôn vinh giá trị của dòng thiết bị điện toán không gian cao cấp. Toàn bộ các thông số về màu sắc, kiểu chữ và khoảng cách được quy chuẩn hóa dưới dạng các biến toàn cục tại tệp tin định dạng nền tảng, cho phép chuyển đổi trạng thái một cách đồng bộ trên toàn bộ mười trang giao diện.")
    
    # Chèn Bảng 3.1
    add_table_caption("Bảng 3.1: Quy chuẩn hệ thống biến màu sắc cho hai chế độ giao diện sáng và tối")
    table_colors = doc.add_table(rows=1, cols=4)
    table_colors.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table_colors.rows[0].cells
    hdr_titles = ["Tên Biến Định Dạng", "Mã Màu Nền Sáng", "Mã Màu Nền Tối", "Mục Đích Sử Dụng Trong Giao Diện"]
    for i, title in enumerate(hdr_titles):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], "F4ECE1")
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.runs[0]
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(11.5)
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)

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
            run = p.runs[0]
            run.font.name = "Times New Roman"
            run.font.size = Pt(11)
            set_cell_margins(row_cells[col_idx], top=80, bottom=80, left=120, right=120)
    set_table_borders(table_colors)

    add_para("Hệ thống màu sắc được chia thành hai tập hợp độc lập phục vụ cho hai chế độ hiển thị sáng và tối. Ở chế độ nền sáng, màu chủ đạo của phông nền là màu be nhạt mang mã nhận diện F8F5F0, mang lại cảm giác ấm áp và sang trọng của chất liệu sợi len cao cấp. Màu sắc dành cho văn bản chính là màu nâu cà phê đậm 261F1A với độ tương phản cao, bảo đảm khả năng đọc rõ nét nhưng không gây chói mắt như màu đen tuyền. Màu điểm nhấn kim loại được chỉ định là sắc vàng đồng A6734B dùng cho các nút kêu gọi hành động, đường viền trang trí và các biểu tượng quan trọng. Khi người dùng kích hoạt chế độ nền tối, nền trang được chuyển đổi hoàn toàn sang sắc đen đá vỏ chai 100E0D, kết hợp cùng các mảng khối bề mặt mang màu nâu đen 171412. Màu chữ tự động chuyển sang sắc trắng sữa F7F3EE, trong khi màu vàng đồng được nâng độ sáng lên mã C8A982 để tạo độ rực rỡ và giữ vững khả năng nhận diện thương hiệu trong điều kiện thiếu sáng.")
    
    # Chèn Hình 3.2
    insert_image("CauTruc/figures/hinh3_2_bang_mau_typography.png", width_cm=14.5)
    add_figure_caption("Hình 3.2: Bảng màu và hệ thống phông chữ quy chuẩn của giao diện")
    
    add_para("Hệ thống phông chữ được cấu hình kết hợp giữa phông chữ kỹ thuật số mang phong cách tương lai cho các tiêu đề và phông chữ hình học trung tính cho văn bản nội dung. Phông chữ tiêu đề được lựa chọn là Space Grotesk với các nét cắt dứt khoát, độ dày nét lớn và khoảng cách ký tự mở rộng, phù hợp với tinh thần đổi mới sáng tạo của thiết bị thực tế ảo độ phân giải tám ca. Phông chữ nội dung sử dụng Inter, một phông chữ được tối ưu hóa đặc biệt cho màn hình kỹ thuật số với chiều cao thân chữ lớn và các nét cong mở, giúp người dùng dễ dàng theo dõi các thông số kỹ thuật phức tạp mà không mỏi mắt. Điểm xuyết tại một số tiêu đề mang tính chất nghệ thuật là phông chữ có chân mang phong cách cổ điển Playfair Display, tạo nên sự giao thoa hài hòa giữa kỹ thuật công nghệ đương đại và di sản chế tác thủ công tinh xảo.")
    add_para("Hệ thống lưới bố cục và khoảng cách được xây dựng dựa trên bội số của tám điểm ảnh, bảo đảm tính nhất quán toán học trong toàn bộ giao diện. Khoảng cách giữa các khối nội dung lớn được ấn định theo các mức ba mươi hai điểm ảnh, bốn mươi tám điểm ảnh và sáu mươi tư điểm ảnh tùy theo độ phân giải thiết bị. Bán kính bo góc của các thẻ thông tin được cố định ở mức mười sáu điểm ảnh hoặc hai mươi tư điểm ảnh, kết hợp với các lớp bóng đổ khuếch tán đa tầng có độ mờ lớn và độ trong suốt thấp, tạo ra chiều sâu không gian quang học ba chiều sống động cho các bề mặt giao diện.")

    add_h3("3.1.3. Cấu trúc và tổ chức bố cục các trang màn hình chính")
    add_para("Hệ thống website NEXUS VR bao gồm mười màn hình chức năng độc lập, mỗi màn hình đảm nhận một nhiệm vụ riêng biệt trong tiến trình tiếp cận, nghiên cứu và quyết định mua hàng của khách hàng.")
    
    # Chèn Bảng 3.2
    add_table_caption("Bảng 3.2: Danh mục mười trang giao diện chính và chức năng tương ứng")
    table_pages = doc.add_table(rows=1, cols=4)
    table_pages.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_p_cells = table_pages.rows[0].cells
    hdr_p_titles = ["STT", "Tên Tệp Tin", "Tên Phân Hệ", "Chức Năng & Hành Động Chính Của Khách Hàng"]
    for i, title in enumerate(hdr_p_titles):
        hdr_p_cells[i].text = title
        set_cell_background(hdr_p_cells[i], "F4ECE1")
        p = hdr_p_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.runs[0]
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(11.5)
        set_cell_margins(hdr_p_cells[i], top=120, bottom=120, left=140, right=140)

    pages_data = [
        ("01", "index.html", "Trang Chủ", "Trình diễn biểu ngữ động, khối sản phẩm nổi bật, bảng so sánh nhanh"),
        ("02", "shop.html", "Danh Mục Sản Phẩm", "Grid sản phẩm linh hoạt, thanh lọc đa tầng theo giá và phân loại"),
        ("03", "product.html", "Chi Tiết Sản Phẩm", "Bộ chọn cấu hình RAM/SSD, góc nhìn ba trăm sáu mươi độ, đặt trước"),
        ("04", "cart.html", "Giỏ Hàng Độc Lập", "Kiểm tra danh sách thiết bị, nhập phiếu ưu đãi, tiến tới thanh toán"),
        ("05", "checkout.html", "Thanh Toán Đơn Hàng", "Thu thập địa chỉ giao hàng, tóm tắt chi phí, thanh toán mô phỏng"),
        ("06", "contact.html", "Đặt Hẹn & Showroom", "Biểu mẫu đặt lịch, khắc tên thẻ VIP ba chiều thời gian thực, xuất vé"),
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
            run = p.runs[0]
            run.font.name = "Times New Roman"
            run.font.size = Pt(11)
            set_cell_margins(row_cells[col_idx], top=80, bottom=80, left=120, right=120)
    set_table_borders(table_pages)

    add_para("Trang chủ đóng vai trò là cửa sổ mở đầu cho hành trình khám phá không gian của dự án. Khu vực đầu trang được bố trí một biểu ngữ mở màn ấn tượng với dòng tiêu đề động học ứng dụng kỹ thuật dải màu ánh kim chạy qua thân chữ. Phía dưới biểu ngữ là khu vực trưng bày hình ảnh không gian của mẫu kính thực tế ảo phiên bản đầu bảng cùng ba góc nhìn toàn diện từ mặt trước, mặt bên và mặt trên. Nửa dưới của trang chủ bao gồm khối giới thiệu các công nghệ đột phá, bảng so sánh nhanh thông số giữa ba phiên bản kính tiêu biểu và trích dẫn đánh giá của các cơ quan báo chí công nghệ chuyên ngành.")
    
    # Chèn Hình 3.3
    insert_image("CauTruc/figures/hinh3_3_trang_chu.png", width_cm=14.5)
    add_figure_caption("Hình 3.3: Giao diện trang chủ với khối biểu ngữ động học và khu vực sản phẩm nổi bật")

    add_para("Trang danh mục sản phẩm được tổ chức theo bố cục lưới hai chiều linh hoạt, chia thành hai khu vực rõ ràng. Cột bên trái hoặc phía trên cùng là thanh công cụ lọc sản phẩm đa tiêu chí, cho phép người dùng sàng lọc thiết bị theo dòng sản phẩm, khoảng giá tiền và mục đích sử dụng. Cột nội dung chính hiển thị các thẻ sản phẩm với hình ảnh khổ lớn, nhãn phân hạng độc quyền, tên thiết bị, giá niêm yết tính theo tiền đồng Việt Nam và nút đặt hàng nhanh. Khi người dùng đưa con trỏ chuột qua thẻ sản phẩm, hình ảnh sản phẩm sẽ tự động nâng độ cao và kích hoạt vệt sáng quét ngang qua khung viền nhằm gia tăng phản hồi thị giác.")
    
    # Chèn Hình 3.4
    insert_image("CauTruc/figures/hinh3_4_danh_muc.png", width_cm=14.5)
    add_figure_caption("Hình 3.4: Giao diện danh mục sản phẩm kèm bộ lọc thuộc tính đa tiêu chí")

    add_para("Trang chi tiết sản phẩm được thiết kế tập trung sâu vào quyết định mua sắm của khách hàng. Phía bên trái màn hình là phòng trưng bày hình ảnh sản phẩm độ phân giải cao kết hợp khả năng phóng to chi tiết từng chất liệu da thuộc, đệm bọt biển và khung viền hợp kim ma-giê. Phía bên phải là khu vực cấu hình thiết bị, nơi khách hàng có thể bấm chọn dung lượng bộ nhớ từ hai trăm năm mươi sáu ghi-ga-byte lên đến một tê-ra-byte, lựa chọn phiên bản dây đeo thể thao hoặc dây kim loại titan, cùng với việc kiểm tra tính tương thích của toa kính thuốc cá nhân trước khi bấm nút đưa vào giỏ hàng.")
    
    # Chèn Hình 3.5
    insert_image("CauTruc/figures/hinh3_5_chi_tiet.png", width_cm=14.5)
    add_figure_caption("Hình 3.5: Giao diện chi tiết sản phẩm và bảng chọn cấu hình bộ nhớ")

    add_para("Trang giỏ hàng độc lập và ngăn kéo giỏ hàng chịu trách nhiệm tổng kết và kiểm soát các mặt hàng đã chọn. Danh sách sản phẩm được trình bày mạch lạc với chức năng tăng giảm số lượng, loại bỏ món hàng và nhập mã giảm giá ưu đãi để nhận chiết khấu trực tiếp.")
    
    # Chèn Hình 3.6
    insert_image("CauTruc/figures/hinh3_6_gio_hang.png", width_cm=14.5)
    add_figure_caption("Hình 3.6: Giao diện giỏ hàng và danh sách sản phẩm chờ thanh toán")

    add_para("Trang liên hệ và đặt lịch phòng trưng bày là một trong những điểm nhấn kỹ thuật quan trọng nhất của hệ thống. Khu vực này được chia làm hai nửa song song, nửa bên trái là biểu mẫu thu thập thông tin khách hàng, khung giờ mong muốn và tình trạng khúc xạ mắt, nửa bên phải là sân khấu trình diễn thẻ tiếp đón điện tử ba chiều hai mặt. Mọi thông tin khách hàng nhập vào biểu mẫu bên trái sẽ ngay lập tức được truyền dẫn và khắc chữ thời gian thực lên mặt trước và mặt sau của chiếc thẻ bên phải.")
    
    # Chèn Hình 3.7
    insert_image("CauTruc/figures/hinh3_7_dat_hen.png", width_cm=14.5)
    add_figure_caption("Hình 3.7: Giao diện không gian đặt hẹn và phát hành thẻ tiếp đón kỹ thuật số")

    add_para("Trang thanh toán đơn hàng dẫn dắt khách hàng qua quy trình ba bước nhập thông tin giao nhận, lựa chọn phương thức thanh toán an toàn và kiểm tra lại toàn bộ chi phí trước khi bấm nút xác thực giao dịch thành công.")
    
    # Chèn Hình 3.8
    insert_image("CauTruc/figures/hinh3_8_thanh_toan.png", width_cm=14.5)
    add_figure_caption("Hình 3.8: Giao diện tiến trình thanh toán đơn hàng và xác thực giao dịch")

    add_h3("3.1.4. Thiết kế thích ứng đa thiết bị và xử lý điểm ngắt màn hình")
    add_para("Nhằm bảo đảm website hoạt động hoàn hảo trên mọi kích thước màn hình từ điện thoại di động cỡ nhỏ đến màn hình máy tính để bàn khổ lớn, hệ thống áp dụng chiến lược thiết kế thích ứng toàn diện dựa trên sáu điểm ngắt then chốt.")
    
    # Chèn Bảng 3.3
    add_table_caption("Bảng 3.3: Hệ thống điểm ngắt và quy tắc thích ứng đa thiết bị")
    table_bp = doc.add_table(rows=1, cols=4)
    table_bp.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_bp_cells = table_bp.rows[0].cells
    hdr_bp_titles = ["Điểm Ngắt", "Nhóm Thiết Bị Mục Tiêu", "Quy Tắc Bố Cục Áp Dụng", "Hành Vi Thích Ứng Của Phần Tử"]
    for i, title in enumerate(hdr_bp_titles):
        hdr_bp_cells[i].text = title
        set_cell_background(hdr_bp_cells[i], "F4ECE1")
        p = hdr_bp_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.runs[0]
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(11.5)
        set_cell_margins(hdr_bp_cells[i], top=120, bottom=120, left=140, right=140)

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
            run = p.runs[0]
            run.font.name = "Times New Roman"
            run.font.size = Pt(11)
            set_cell_margins(row_cells[col_idx], top=80, bottom=80, left=120, right=120)
    set_table_borders(table_bp)

    add_para("Trong quá trình thực tế triển khai giao diện, một vấn đề kỹ thuật nghiêm trọng thường gặp trên các thiết bị di động có chiều rộng ba trăm chín mươi điểm ảnh là hiện tượng vỡ bố cục và tràn viền ngang màn hình. Qua kiểm tra phân tích cây cấu trúc giao diện, nhóm tác giả đã xác định nguyên nhân bắt nguồn từ việc các ô lựa chọn dịch vụ chứa chuỗi ký tự văn bản có chiều dài vượt quá bốn trăm điểm ảnh với thuộc tính ngăn ngắt dòng. Khi kết hợp với hành vi mặc định của thuật toán chia cột lưới trong ngôn ngữ định dạng kiểu dáng, ô chứa dịch vụ đã ép cột lưới mở rộng vượt quá chiều rộng thực tế của màn hình điện thoại, dẫn đến việc toàn bộ phần bên phải của biểu mẫu và thẻ thông tin bị cắt cụt ngoài mép nhìn.")
    
    # Chèn Hình 3.9
    insert_image("CauTruc/figures/hinh3_9_thich_ung_mobile.png", width_cm=8.5)
    add_figure_caption("Hình 3.9: Giao diện thích ứng trên các kích thước màn hình điện thoại di động")

    add_para("Giải pháp kỹ thuật triệt để được triển khai bằng cách áp dụng hàm giới hạn kích thước tối thiểu trong thuộc tính chia cột của hệ thống lưới. Thay vì khai báo kích thước cột đơn thuần là một phần tỷ lệ, nhóm tác giả đã định nghĩa cột lưới theo cú pháp kết hợp hàm nhỏ nhất và lớn nhất, bắt đầu từ giá trị không cho đến một phần tỷ lệ tự do. Đồng thời, thuộc tính chiều rộng tối thiểu bằng không được áp dụng đồng bộ lên tất cả các phần tử chứa văn bản, giúp trình duyệt cho phép chuỗi ký tự tự động thu gọn và hiển thị dấu ba chấm khi chạm tới giới hạn lề thay vì tự ý đẩy phình chiều rộng của toàn bộ trang web. Bên cạnh đó, phần đệm lề hai bên của khung biểu mẫu trên thiết bị di động cũng được tinh chỉnh từ ba mươi hai điểm ảnh xuống còn hai mươi điểm ảnh, giải phóng thêm không gian hiển thị quý giá cho các nút bấm và nhãn thông tin.")

    # ----------------------------------------------------
    # 3.2. Chức năng và tương tác người dùng
    # ----------------------------------------------------
    add_h2("3.2. Chức năng và tương tác người dùng")
    
    add_h3("3.2.1. Hệ thống thẻ tiếp đón kỹ thuật số ba chiều hai mặt")
    add_para("Thẻ tiếp đón kỹ thuật số là một thành phần giao diện mang tính đột phá của website, đóng vai trò là chiếc thẻ thành viên cao cấp chứng nhận quyền tham quan và trải nghiệm phòng trưng bày của khách hàng. Chiếc thẻ được lập trình hoạt động trong không gian phối cảnh ba chiều với góc nhìn sâu một nghìn hai trăm điểm ảnh, cho phép xoay lật hai mặt một trăm tám mươi độ quanh trục thẳng đứng.")
    
    # Chèn Hình 3.10
    insert_image("CauTruc/figures/hinh3_10_the_vip_mat_truoc.png", width_cm=9.5)
    add_figure_caption("Hình 3.10: Chi tiết mặt trước của thẻ tiếp đón với hiệu ứng khắc chữ thời gian thực")

    add_para("Mặt trước của chiếc thẻ thể hiện các thông số định danh cốt lõi bao gồm biểu tượng thương hiệu, nhãn cấp độ tiếp đón thượng hạng, bảng vi mạch quang học mạ vàng mô phỏng và khu vực thông tin cá nhân của khách hàng. Điểm đặc sắc trong trải nghiệm tương tác là tính năng khắc chữ la-ze thời gian thực. Khi người dùng bắt đầu nhập các ký tự họ và tên vào biểu mẫu bên cạnh, một lắng nghe sự kiện nhập liệu trong tập lệnh điều khiển sẽ kích hoạt hiệu ứng tia quét sáng la-ze nhấp nháy, đồng thời sao chép chính xác từng ký tự sang vị trí tên vị khách danh dự trên mặt thẻ. Ngay bên dưới là mã đặt chỗ độc bản tự động sinh ra và khung giờ tiếp đón được cập nhật tương ứng theo các nút chọn buổi sáng, buổi chiều hoặc buổi tối trên biểu mẫu.")
    
    # Chèn Hình 3.11
    insert_image("CauTruc/figures/hinh3_11_the_vip_mat_sau.png", width_cm=9.5)
    add_figure_caption("Hình 3.11: Chi tiết mặt sau của thẻ tiếp đón với dải từ tính và dải chữ ký số")

    add_para("Mặt sau của chiếc thẻ tái hiện cấu trúc của một chiếc thẻ ngân hàng kim loại đen bóng với dải từ tính trải dài toàn bộ chiều ngang, con dấu xác thực hình tròn với viền nét đứt màu vàng đồng, mã băm lượng tử bảo mật và dải chữ ký xác nhận của chủ nhân. Khi khách hàng nhập tên, dải chữ ký tay trên nền trắng ngà sẽ tự động chuyển đổi chuỗi ký tự sang một phông chữ nét viết tay nghệ thuật mềm mại, mang lại cảm giác chân thực như một chữ ký tươi vừa được ký duyệt. Đi liền với dải chữ ký là ô hiển thị mã an ninh ba chữ số được cố định vị trí, tuyệt đối không bị đẩy lệch ra ngoài mép thẻ ngay cả khi khách hàng có tên họ rất dài.")
    add_para("Nhằm tăng cường cảm giác về một vật thể vật lý thực sự, bề mặt của chiếc thẻ được phủ hai lớp hiệu ứng quang học động. Lớp thứ nhất là hiệu ứng phản chiếu ánh kim tập trung, tính toán vị trí điểm sáng hình tròn dựa trên tọa độ tương đối của con trỏ chuột khi lướt qua thẻ hoặc dựa trên độ nghiêng của con quay hồi chuyển trên điện thoại thông minh. Lớp thứ hai là lớp màng tán sắc cầu vồng bảy màu bán trong suốt, di chuyển với tốc độ gấp đôi điểm sáng kim loại, tạo ra dải sắc màu chuyển động lấp lánh như lớp mạ chống giả trên các dòng thẻ ngân hàng cao cấp nhất thế giới.")
    add_para("Bên cạnh các hiệu ứng thị giác, hệ thống còn tích hợp hệ thống âm thanh phản hồi xúc giác vận hành thông qua giao diện lập trình âm thanh web của trình duyệt. Mỗi khi khách hàng bấm lật thẻ, một âm thanh xoay ma sát dạng sóng hình sin tần số bốn trăm héc-zơ kết hợp độ vang ngắn được phát ra tức thì. Tương tự, mỗi khi người dùng chọn khung giờ hoặc bấm các nút tác vụ, các âm thanh gõ nhẹ của chất liệu thủy tinh cao cấp sẽ vang lên, kích thích giác quan và nâng cao sự gắn kết của người dùng đối với trải nghiệm. Hệ thống trang bị sẵn nút bấm bật tắt âm thanh hình chiếc loa nhỏ tại góc điều khiển, cho phép người dùng tùy ý ngắt toàn bộ âm thanh và lưu lựa chọn này vào bộ nhớ của trình duyệt. Cuối cùng, người dùng có thể bấm nút xuất vé để trình duyệt tự động đóng gói dữ liệu thẻ thành một tệp tin thông hành kỹ thuật số lưu trữ về máy tính cá nhân.")

    add_h3("3.2.2. Cơ chế quản lý giỏ hàng thời gian thực")
    add_para("Chức năng giỏ hàng của dự án được triển khai theo mô hình ngăn kéo trượt thông minh, kết hợp giữa khả năng cập nhật trạng thái thời gian thực và độ bền vững dữ liệu trên trình duyệt người dùng. Khi khách hàng nhấn nút thêm vào giỏ hàng tại bất kỳ trang sản phẩm nào, một tín hiệu sự kiện tùy chỉnh được phát ra trên toàn bộ cây tài liệu. Bộ điều khiển giỏ hàng sẽ tiếp nhận tín hiệu này, trích xuất mã định danh sản phẩm, cấu hình bộ nhớ và màu sắc đã chọn để cập nhật vào danh sách các mặt hàng trong phiên làm việc.")
    add_para("Giao diện ngăn kéo giỏ hàng xuất hiện từ cạnh phải màn hình với chuyển động lướt mượt mà, đồng thời kích hoạt một lớp màn mờ phủ lên toàn bộ nội dung phía sau nhằm dồn toàn bộ sự chú ý của người dùng vào đơn hàng. Trong bảng danh sách, mỗi mặt hàng được hiển thị đầy đủ hình ảnh đại diện thu nhỏ, tên thiết bị, phiên bản bộ nhớ, đơn giá và cụm nút bấm điều chỉnh số lượng. Người dùng có thể trực tiếp tăng hoặc giảm số lượng món hàng, hoặc bấm nút biểu tượng thùng rác để loại bỏ sản phẩm. Mọi thao tác này đều kích hoạt hàm tính toán lại tổng tiền hàng, tiền thuế và số lượng tổng cộng trên biểu tượng chiếc túi ở thanh điều hướng trên cùng với độ trễ phản hồi xấp xỉ không phần trăm giây.")
    add_para("Dữ liệu giỏ hàng được đồng bộ hóa liên tục vào bộ nhớ cục bộ của trình duyệt dưới định dạng chuỗi đối tượng mã hóa. Cơ chế này bảo đảm rằng ngay cả khi người dùng vô tình đóng trình duyệt, làm mới trang web hoặc chuyển hướng qua lại giữa mười trang màn hình khác nhau, toàn bộ sản phẩm đã chọn cùng số lượng và các phiếu giảm giá đã áp dụng vẫn được bảo toàn nguyên vẹn, mang lại sự tiện nghi và liền mạch trong trải nghiệm mua sắm trực tuyến.")

    add_h3("3.2.3. Bảng đối chiếu và so sánh thông số kỹ thuật động")
    add_para("Nhằm giải quyết bài toán khó khăn của khách hàng khi phải lựa chọn giữa các dòng thiết bị thực tế ảo có cấu hình phần cứng tương đồng, hệ thống cung cấp một bảng so sánh kỹ thuật tương tác thông minh. Bảng đối chiếu này cho phép đặt cạnh nhau tối đa ba sản phẩm khác nhau trên cùng một khung nhìn để phân tích chi tiết từng khía cạnh kỹ thuật từ ống kính quang học, màn hình hiển thị, hệ thống xử lý trung tâm cho đến kết nối không dây và thời lượng pin.")
    
    # Chèn Bảng 3.4
    add_table_caption("Bảng 3.4: Bảng đối chiếu thông số kỹ thuật các dòng kính thực tế ảo trên giao diện so sánh")
    table_compare = doc.add_table(rows=1, cols=4)
    table_compare.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_c_cells = table_compare.rows[0].cells
    hdr_c_titles = ["Tiêu Chí So Sánh", "NEXUS Vision Pro 8K", "NEXUS Vision Studio", "NEXUS Vision Air Lite"]
    for i, title in enumerate(hdr_c_titles):
        hdr_c_cells[i].text = title
        set_cell_background(hdr_c_cells[i], "F4ECE1")
        p = hdr_c_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.runs[0]
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(11.5)
        set_cell_margins(hdr_c_cells[i], top=120, bottom=120, left=140, right=140)

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
            run = p.runs[0]
            run.font.name = "Times New Roman"
            run.font.size = Pt(11)
            set_cell_margins(row_cells[col_idx], top=80, bottom=80, left=120, right=120)
    set_table_borders(table_compare)

    add_para("Điểm nổi bật của bảng so sánh là khả năng làm nổi bật trực quan các điểm khác biệt. Khi người dùng kích hoạt bộ lọc làm nổi bật, các hàng thông số có giá trị tương đồng giữa các sản phẩm sẽ tự động mờ đi, chỉ giữ lại độ sáng cho những thông số có sự chênh lệch lớn như độ phân giải thấu kính hoặc dung lượng pin, giúp người mua đưa ra quyết định một cách nhanh chóng và chính xác. Trên giao diện máy tính để bàn, bảng so sánh duy trì hàng tiêu đề chứa ảnh và tên sản phẩm luôn cố định ở mép trên màn hình khi người dùng cuộn xem các thông số ở phía dưới. Đối với giao diện điện thoại di động, bảng được cấu hình cơ chế cuộn ngang với thanh chỉ báo vị trí trực quan và hỗ trợ thao tác vuốt chạm hai chiều, bảo đảm không làm phá vỡ bề rộng tổng thể của trang web.")

    add_h3("3.2.4. Cơ chế chuyển đổi và đồng bộ giao diện sáng tối")
    add_para("Hệ thống chuyển đổi chế độ hiển thị giữa sáng và tối được thiết kế nhằm thích ứng linh hoạt với môi trường ánh sáng xung quanh và thói quen thị giác của từng khách hàng. Trình điều khiển giao diện sử dụng nút bấm chuyển đổi biểu tượng mặt trời và mặt trăng đặt tại vị trí trung tâm của thanh điều hướng chính.")
    
    # Chèn Hình 3.12
    insert_image("CauTruc/figures/hinh3_12_chuyen_doi_sang_toi.png", width_cm=14.5)
    add_figure_caption("Hình 3.12: Cơ chế chuyển đổi đồng bộ giữa giao diện nền sáng và giao diện nền tối")

    add_para("Khi người dùng thao tác chuyển chế độ, bộ điều khiển JavaScript sẽ can thiệp vào lớp định danh cao nhất của tài liệu bằng cách bổ sung hoặc loại bỏ lớp định danh chế độ tối. Ngay lập tức, toàn bộ các thuộc tính màu sắc phụ thuộc vào biến giao diện sẽ đồng loạt chuyển dịch sắc độ thông qua một hiệu ứng chuyển tiếp mềm mại kéo dài không phẩy bốn mươi lăm giây, triệt tiêu hoàn toàn cảm giác giật cục thị giác khi đổi màu.")
    add_para("Nhằm bảo đảm tính liên tục của trải nghiệm, hệ thống tự động ghi lại trạng thái lựa chọn của người dùng vào khóa lưu trữ cục bộ trên máy tính cá nhân. Khi người dùng chuyển hướng sang bất kỳ trang web nào khác trong số mười trang của hệ sinh thái hoặc truy cập lại website vào một thời điểm khác, một đoạn tập lệnh nhẹ được ưu tiên thực thi ngay tại phần đầu tài liệu trước khi trình duyệt dựng khung nhìn. Đoạn tập lệnh này sẽ đọc trạng thái đã lưu và gán trước lớp định danh tương ứng, giúp loại bỏ triệt để hiện tượng chớp nháy màu sáng trước khi chuyển tối vốn là lỗi phổ biến trên các website thương mại điện tử hiện nay.")

    # ----------------------------------------------------
    # 3.3. Mã nguồn và cấu trúc dự án
    # ----------------------------------------------------
    add_h2("3.3. Mã nguồn và cấu trúc dự án")
    
    add_h3("3.3.1. Cấu trúc thư mục mã nguồn và phân tầng chức năng")
    add_para("Mã nguồn của dự án được tổ chức khoa học theo nguyên tắc tách biệt mối quan tâm và cấu trúc hóa theo từng phân tầng chức năng rõ rệt. Cây thư mục gốc của dự án được phân chia thành ba khối chính bao gồm khối tệp tin tài liệu gốc, khối tài nguyên tĩnh và khối phục vụ máy chủ.")
    
    # Chèn Bảng 3.5
    add_table_caption("Bảng 3.5: Cấu trúc phân tầng thư mục mã nguồn dự án")
    table_struct = doc.add_table(rows=1, cols=3)
    table_struct.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_s_cells = table_struct.rows[0].cells
    hdr_s_titles = ["Thư Mục / Tệp Tin", "Phân Tầng Chức Năng", "Nhiệm Vụ Và Nội Dung Chứa"]
    for i, title in enumerate(hdr_s_titles):
        hdr_s_cells[i].text = title
        set_cell_background(hdr_s_cells[i], "F4ECE1")
        p = hdr_s_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.runs[0]
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(11.5)
        set_cell_margins(hdr_s_cells[i], top=120, bottom=120, left=140, right=140)

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
            run = p.runs[0]
            run.font.name = "Times New Roman"
            run.font.size = Pt(11)
            set_cell_margins(row_cells[col_idx], top=80, bottom=80, left=120, right=120)
    set_table_borders(table_struct)

    add_para("Khối tài liệu gốc bao gồm mười tệp tin định dạng siêu văn bản tương ứng với mười màn hình chức năng của website, đi kèm tệp tin điều hình máy chủ và các tệp tin cấu hình môi trường triển khai. Mỗi tệp tin siêu văn bản chỉ đảm nhiệm vai trò định nghĩa khung xương cấu trúc ngữ nghĩa và liên kết tới các tệp tin kiểu dáng cũng như tập lệnh điều khiển tương ứng của chính trang đó.")
    add_para("Khối tài nguyên tĩnh nằm trong thư mục tài sản được chia nhỏ thành các thư mục con chuyên biệt. Thư mục kiểu dáng chứa các tệp tin thiết lập biến toàn cục, tệp tin chuẩn hóa đưa các giá trị hiển thị về mặc định, tệp tin định kiểu chung cho toàn bộ dự án, thư mục chứa kiểu dáng của các thành phần dùng chung như thanh điều hướng, chân trang, giỏ hàng, thông báo nổi và thư mục chứa các tệp tin kiểu dáng riêng biệt cho từng trang đơn lẻ. Thư mục tập lệnh điều khiển được tổ chức thành các tầng bao gồm thư mục lưu trữ các bộ điều khiển logic nghiệp vụ cho từng trang, thư mục chứa các động cơ tính toán tái sử dụng như bộ kiểm tra tính hợp lệ của biểu mẫu, bộ đếm số lượng, bộ tải bố cục và bộ chuyển đổi giao diện sáng tối, thư mục dịch vụ quản lý giao tiếp dữ liệu và thư mục chứa cấu trúc dữ liệu sản phẩm mẫu. Thư mục hình ảnh được phân chia ngăn nắp theo các khu vực ảnh biểu ngữ, ảnh sản phẩm, ảnh chụp thực tế và ảnh đội ngũ sáng lập.")
    add_para("Khối phục vụ máy chủ được đặt trong một thư mục riêng biệt chứa tệp tin máy chủ viết bằng môi trường thực thi máy chủ, đóng vai trò cung cấp các giao diện lập trình ứng dụng giả lập, xử lý các yêu cầu gửi dữ liệu từ biểu mẫu liên hệ và điều phối các tiêu đề bảo mật mạng.")

    add_h3("3.3.2. Quy chuẩn xây dựng mã nguồn và quy tắc định danh")
    add_para("Dự án áp dụng phương pháp định danh lớp phần tử theo chuẩn khối, phần tử và biến thể, thường được biết đến với tên gọi viết tắt theo chuẩn quốc tế là phương thức định danh ba thành phần. Quy chuẩn này quy định tên của một khối giao diện độc lập đóng vai trò là tiền tố, theo sau là hai dấu gạch dưới nối tiếp với tên của phần tử thành phần bên trong, và sử dụng hai dấu gạch ngang nối tiếp để biểu thị các trạng thái biến thể hoặc trạng thái kích hoạt của phần tử đó. Việc tuân thủ nghiêm ngặt quy tắc này giúp triệt tiêu hoàn toàn nguy cơ xung đột thuộc tính kiểu dáng giữa các trang khác nhau, đồng thời giúp các thành viên trong nhóm lập trình dễ dàng đọc hiểu cấu trúc phân cấp trực quan ngay từ tên gọi của lớp phần tử.")
    add_para("Bên cạnh quy chuẩn định danh kiểu dáng, mã nguồn kịch bản của dự án được xây dựng theo tiêu chuẩn chú thích tài liệu học thuật hoàn chỉnh cho tất cả các hàm và mô đun nghiệp vụ. Mỗi hàm xử lý đều được mở đầu bằng một khối chú thích ghi rõ mục đích của hàm, danh sách các tham số đầu vào kèm kiểu dữ liệu, giá trị trả về và các sự kiện mà hàm phát ra ngoài môi trường. Toàn bộ mã lệnh JavaScript tuân thủ nghiêm ngặt chế độ kiểm soát chặt chẽ, bắt buộc khai báo biến minh bạch, tránh tuyệt đối việc sử dụng biến toàn cục tự do gây ô nhiễm bộ nhớ và ảnh hưởng tới hiệu năng trang web.")

    add_h3("3.3.3. Phân tích các mô đun xử lý logic cốt lõi")
    add_para("Sơ đồ kiến trúc luồng dữ liệu và điều phối sự kiện phía trình duyệt thể hiện mối quan hệ cộng tác nhịp nhàng giữa các tầng giao diện người dùng, tầng bộ điều khiển nghiệp vụ và tầng lưu trữ bộ nhớ cục bộ.")
    
    # Chèn Hình 3.13
    insert_image("CauTruc/figures/hinh3_13_kien_truc_du_lieu.png", width_cm=14.5)
    add_figure_caption("Hình 3.13: Sơ đồ kiến trúc luồng dữ liệu và điều phối sự kiện phía trình duyệt")

    add_para("Mô đun cốt lõi thứ nhất là thuật toán điều khiển phối cảnh ba chiều của thẻ tiếp đón tại tệp tin điều khiển trang liên hệ. Thuật toán này liên tục lắng nghe tọa độ di chuyển của con trỏ chuột trong phạm vi khung bao quanh thẻ. Khi phát hiện chuyển động, hàm xử lý sẽ quy đổi tọa độ điểm ảnh thực tế của chuột sang khoảng giá trị chuẩn hóa chạy từ trừ một đến một tính từ tâm của chiếc thẻ. Góc nghiêng tối đa của thẻ quanh trục ngang và trục dọc được khống chế ở mức mười một độ để bảo đảm tính chân thực vật lý và tránh làm biến dạng nội dung văn bản. Để chuyển động đạt độ mượt mà tuyệt đối và không bị gián đoạn, một vòng lặp hoạt họa dựa trên khung hình trình duyệt được kích hoạt, liên tục tính toán độ chênh lệch giữa góc nghiêng mục tiêu và góc nghiêng hiện tại theo hệ số suy giảm không phẩy một, mang lại cảm giác chiếc thẻ có quán tính vật lý và trọng lượng thực tế.")
    add_para("Mô đun cốt lõi thứ hai là hệ thống quản lý giỏ hàng và định dạng số học tại tệp tin điều khiển giỏ hàng. Khi tiếp nhận yêu cầu thêm sản phẩm, mô đun thực hiện thuật toán tìm kiếm tuyến tính trong mảng các đối tượng hàng hóa đã lưu trong bộ nhớ. Nếu sản phẩm cùng phiên bản bộ nhớ và màu sắc đã tồn tại, hệ thống chỉ tăng thuộc tính số lượng lên một đơn vị; ngược lại, một phần tử đối tượng mới với các thuộc tính độc lập sẽ được đẩy vào danh sách. Hàm tính toán tài chính sau đó sẽ quét qua toàn bộ mảng dữ liệu, nhân đơn giá từng thiết bị với số lượng tương ứng, cộng dồn tiền thuế giá trị gia tăng ở mức mười phần trăm và áp dụng tỷ lệ phần trăm khấu trừ của mã giảm giá hợp lệ. Chuỗi kết quả tiền tệ cuối cùng được đưa qua một hàm định dạng chuyên biệt để phân tách các nhóm ba chữ số bằng dấu chấm và gắn hậu tố đơn vị tiền đồng Việt Nam ở cuối, bảo đảm chuẩn xác theo thói quen đọc số liệu tài chính của người tiêu dùng trong nước.")

    # 4. LƯU TỆP TIN WORD RA ĐĨA
    output_docx_cautruc = os.path.join(os.path.dirname(__file__), 'CauTruc', 'Chuong_3_Thiet_Ke_Va_Trien_Khai_Website.docx')
    output_docx_root = os.path.join(os.path.dirname(__file__), 'Chuong_3_Thiet_Ke_Va_Trien_Khai_Website.docx')
    
    doc.save(output_docx_cautruc)
    doc.save(output_docx_root)
    print(f"SUCCESS: Saved docx to {output_docx_cautruc}")
    print(f"SUCCESS: Also saved to root {output_docx_root}")

if __name__ == '__main__':
    create_full_chapter3_word_doc()
