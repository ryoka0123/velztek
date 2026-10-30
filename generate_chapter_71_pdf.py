import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register Georgia font family
windir = os.environ.get('WINDIR', 'C:\\Windows')
fonts_dir = os.path.join(windir, 'Fonts')
pdfmetrics.registerFont(TTFont('Georgia', os.path.join(fonts_dir, 'georgia.ttf')))
pdfmetrics.registerFont(TTFont('Georgia-Bold', os.path.join(fonts_dir, 'georgiab.ttf')))
pdfmetrics.registerFont(TTFont('Georgia-Italic', os.path.join(fonts_dir, 'georgiai.ttf')))
pdfmetrics.registerFont(TTFont('Georgia-BoldItalic', os.path.join(fonts_dir, 'georgiaz.ttf')))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily('Georgia', normal='Georgia', bold='Georgia-Bold', italic='Georgia-Italic', boldItalic='Georgia-BoldItalic')

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        w, h = letter
        
        # Soft warm book background
        self.setFillColor(colors.HexColor("#FAF8F4"))
        self.rect(0, 0, w, h, fill=True, stroke=False)
        
        # Elegant outer and inner border
        self.setStrokeColor(colors.HexColor("#D8C8B0"))
        self.setLineWidth(0.75)
        margin = 36
        self.rect(margin, margin, w - 2*margin, h - 2*margin, fill=False, stroke=True)
        
        self.setStrokeColor(colors.HexColor("#EAE0D0"))
        self.setLineWidth(0.4)
        self.rect(margin + 3, margin + 3, w - 2*(margin + 3), h - 2*(margin + 3), fill=False, stroke=True)
        
        # Corner ornamental accents
        self.setStrokeColor(colors.HexColor("#8B263E"))
        self.setLineWidth(1.2)
        corner_len = 12
        for x, y, dx, dy in [
            (margin, margin, 1, 1),
            (w - margin, margin, -1, 1),
            (margin, h - margin, 1, -1),
            (w - margin, h - margin, -1, -1)
        ]:
            self.line(x, y, x + dx * corner_len, y)
            self.line(x, y, x, y + dy * corner_len)
        
        # Header (Pages 2+)
        if self._pageNumber > 1:
            self.setFont("Georgia", 8)
            self.setFillColor(colors.HexColor("#7A6B58"))
            self.drawCentredString(w / 2.0, h - 48, "VELZTEK  •  CAPÍTULO 71: INSTINTO Y CRISTAL")
            self.setStrokeColor(colors.HexColor("#D8C8B0"))
            self.setLineWidth(0.5)
            self.line(margin + 20, h - 54, w - margin - 20, h - 54)
        
        # Footer (All pages)
        self.setFont("Georgia-Italic", 8.5)
        self.setFillColor(colors.HexColor("#7A6B58"))
        page_str = f"— Página {self._pageNumber} de {page_count} —"
        self.drawCentredString(w / 2.0, 46, page_str)
        
        self.setFont("Georgia", 7.5)
        self.setFillColor(colors.HexColor("#A89885"))
        self.drawString(margin + 15, 46, "Novela Velztek de WARYONI")
        self.drawRightString(w - margin - 15, 46, "Continuación Canónica")
        
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=56,
        rightMargin=56,
        topMargin=64,
        bottomMargin=64
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Typography Styles
    title_series_style = ParagraphStyle(
        'SeriesTitle',
        fontName='Georgia-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#7A1B2E"),
        alignment=TA_CENTER,
        spaceAfter=3
    )
    
    subtitle_style = ParagraphStyle(
        'SeriesSubtitle',
        fontName='Georgia',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#8C7355"),
        alignment=TA_CENTER,
        spaceAfter=14
    )
    
    chapter_num_style = ParagraphStyle(
        'ChapterNum',
        fontName='Georgia-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor("#1F2430"),
        alignment=TA_CENTER,
        spaceAfter=4
    )
    
    meta_box_style = ParagraphStyle(
        'MetaBox',
        fontName='Georgia-Italic',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#554433"),
        alignment=TA_CENTER
    )
    
    pov_style = ParagraphStyle(
        'PovHeader',
        fontName='Georgia-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#FDFBF7"),
        alignment=TA_CENTER
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        fontName='Georgia',
        fontSize=10,
        leading=15,
        textColor=colors.HexColor("#26221F"),
        alignment=TA_JUSTIFY,
        spaceAfter=7
    )
    
    body_dialogue = ParagraphStyle(
        'BodyDialogue',
        fontName='Georgia',
        fontSize=10,
        leading=15,
        textColor=colors.HexColor("#1A1715"),
        alignment=TA_JUSTIFY,
        leftIndent=12,
        spaceAfter=7
    )
    
    sound_effect_style = ParagraphStyle(
        'SoundEffect',
        fontName='Georgia-BoldItalic',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#8B263E"),
        alignment=TA_CENTER,
        spaceBefore=4,
        spaceAfter=6
    )
    
    divider_style = ParagraphStyle(
        'Divider',
        fontName='Georgia',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#B8860B"),
        alignment=TA_CENTER,
        spaceBefore=6,
        spaceAfter=8
    )

    story = []
    
    # Header Banner
    story.append(Paragraph("V E L Z T E K", title_series_style))
    story.append(Paragraph("UNIVERSO Y LORE ORIGINAL DE WARYONI  •  CONTINUACIÓN CRONOLÓGICA", subtitle_style))
    
    # Chapter Title
    story.append(Paragraph("Capítulo 71: Instinto y Cristal", chapter_num_style))
    
    # Metadata Badge in styled Table
    meta_text = (
        "<b>Cronología:</b> Continuación directa tras el desenlace del Capítulo 70 (<i>Bharani</i>)<br/>"
        "<b>Escenario:</b> Exterior Este del Gran Bosque de Aries  •  <b>Conflicto:</b> Azari (Forma Depredador) vs. Bharani (3ª Estrella de Aries)"
    )
    meta_table = Table([[Paragraph(meta_text, meta_box_style)]], colWidths=[490])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#EFE9DD")),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor("#D4C4AA")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))
    
    def make_pov_banner(text):
        p = Paragraph(f"<b>{text.upper()}</b>", pov_style)
        t = Table([[p]], colWidths=[490])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#3D1E2A")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#8B263E")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        return t

    # SECTION 1: POV Azari
    story.append(make_pov_banner("# POV AZARI — FORMA DEPREDADOR #"))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("El mundo a mi alrededor perdió su velocidad habitual.", body_style))
    story.append(Paragraph("No era que el tiempo se hubiera detenido, sino que mis sentidos ahora procesaban cada fragmento de segundo con una crudeza desgarradora. Podía escuchar el crujido microscópico de la hierba aplastándose bajo mis pies; podía sentir las corrientes térmicas ascendiendo por los árboles y el zumbido penetrante de las cuatro alas de Bharani vibrando en frecuencias que antes solo me habrían provocado dolor de cabeza.", body_style))
    story.append(Paragraph("Mi sangre ardía. Era un calor sofocante que golpeaba contra mis sienes, un tamborileo constante que exigía una sola cosa: <i>desgarrar</i>.", body_style))
    
    story.append(Paragraph("—Qué ojos tan despiadados... —la voz de Bharani llegó flotando en el aire cargado de maná, teñida por una fascinación casi lasciva—. Me pregunto cuánto tardará ese fuego en apagarse una vez que mis dedos alcancen ese pequeño corazón tan acelerado.", body_dialogue))
    
    story.append(Paragraph("✦   ✦   ✦", divider_style))
    
    story.append(Paragraph("No respondí. Con el <i>Depredador</i> activo, desperdiciar aliento en palabras era una estupidez.", body_style))
    story.append(Paragraph("Flexioné mis piernas, sintiendo cómo los músculos tensados se comprimían como resortes de acero. En un parpadeo, el suelo bajo mis talones estalló en un cráter de tierra y raíces rotas.", body_style))
    story.append(Paragraph("Desaparecí.", body_style))
    story.append(Paragraph("No fue un simple truco de sombras ni una traslación entre plumas; fue pura aceleración física respaldada por la fuerza bruta de mi raza. Reaparecí a escasos centímetros del rostro de Bharani, mis garras extendidas en un arco descendente envuelto en maná carmesí y negro.", body_style))
    
    story.append(Paragraph("✦   ✦   ✦", divider_style))
    
    story.append(Paragraph("El choque fue ensordecedor.", body_style))
    story.append(Paragraph("Bharani no intentó retroceder. Sus cuatro brazos se alzaron al unísono, sus antebrazos recubiertos por una capa de cristal translúcido que resonó con la fuerza de un yunque al recibir mis garras. Chispas de maná puro salieron disparadas en todas direcciones, segando las copas de los árboles cercanos como si una guadaña invisible hubiera barrido el bosque.", body_style))
    story.append(Paragraph("—¡Demasiado predecible, gatita! —exclamó con una sonrisa burlona.", body_dialogue))
    story.append(Paragraph("Dos de sus manos aprisionaron el impacto de mis garras, mientras sus otros dos brazos libres se dispararon en línea recta hacia mi pecho. Sus dedos afilados brillaban con una luz celeste pálida: la misma técnica con la que afirmaba poder moldear o deshacer la vida interna de un cuerpo.", body_style))
    
    story.append(Paragraph("✦   ✦   ✦", divider_style))
    
    story.append(Paragraph("Si hubiera estado en mi forma normal, aquel contraataque habría perforado mis pulmones antes de que pudiera parpadear. Pero mis alas emplumadas respondieron por puro reflejo biológico.", body_style))
    story.append(Paragraph("Batiendo mis alas con violencia contra el aire comprimido, ejecuté un giro antinatural en medio del aire, esquivando las puntas de sus dedos por un milímetro. La sola corriente de choque que desprendían sus manos rasgó la tela de mi túnica y dejó una quemadura gélida sobre mi piel, entumeciéndome la carne.", body_style))
    story.append(Paragraph("Aprovechando el giro, utilicé la cola emplumada y mi pierna derecha para descargar una patada hacha cargada con todo el peso de mi caída directamente sobre su hombro izquierdo.", body_style))
    
    story.append(Paragraph("¡ C R A C K !", sound_effect_style))
    
    story.append(Paragraph("El sonido de cristal fracturándose reverberó entre nosotras. Bharani fue proyectada hacia el suelo a una velocidad aterradora, estrellándose contra la base de una colina rocosa y levantando una densa cortina de polvo y esquirlas.", body_style))
    story.append(Paragraph("Aterricé pesadamente sobre una rama gruesa, jadeando.", body_style))
    story.append(Paragraph("El calor en mi pecho quemaba con fuerza redoblada. Mis garras se clavaban involuntariamente en la madera viva del tronco. La mente me gritaba que me lanzara sin pensar dentro del polvo, que le destrozara la garganta a mordiscos antes de que se pusiera de pie.", body_style))
    story.append(Paragraph("<i>«Cálmate... respira»</i> me repetí a mí misma, apretando los dientes hasta hacerme sangrar el labio. <i>«Lylia me lo advirtió. El Depredador no es para perder la cabeza; si te dejas gobernar por la fiera, solo serás una presa fácil para un monstruo que ha vivido mil años».</i>", body_dialogue))
    
    story.append(Paragraph("✦   ✦   ✦", divider_style))
    
    story.append(Paragraph("Entre la nube de escombros, el polvo comenzó a arremolinarse hacia adentro, disipado por una repentina ráfaga de viento helado.", body_style))
    story.append(Paragraph("Bharani emergió caminando lentamente.", body_style))
    story.append(Paragraph("Su vestido de seda estaba rasgado en el costado izquierdo, revelando una piel pálida donde finas grietas de luz azulada comenzaban a cerrarse gracias a su propia manipulación de maná. Pero lo que me hizo erizar el vello de la espalda no fue su regeneración, sino la pequeña muesca rota en uno de sus cuernos cristalinos.", body_style))
    story.append(Paragraph("Una gota de icor celeste resbaló por su frente, tiñéndole la mejilla.", body_style))
    story.append(Paragraph("Se llevó un dedo a la cara, probó la gota con la punta de la lengua y clavó sus ojos compuestos en mí. Toda la ligereza y el juego que había mostrado hasta entonces se evaporaron.", body_style))
    story.append(Paragraph("—Lograste marcarme... una simple mortal usando la herencia de las bestias —su voz ya no tenía tono melodioso; sonaba como el roce de dos cuchillas de cristal templado—. Es una lástima. Iba a dejarte entera para mostrársela a mi Reina como un trofeo curioso. Pero ahora... quiero ver cómo suena el crujido de cada uno de tus huesos cuando los retuerza desde adentro.", body_dialogue))
    
    story.append(Paragraph("✦   ✦   ✦", divider_style))
    
    story.append(Paragraph("El espacio entre nosotras se distorsionó.", body_style))
    story.append(Paragraph("El zumbido de sus dos pares de alas alcanzó un tono ultrasónico que hizo vibrar el aire mismo. Bharani no solo volaba; parecía deslizarse a través de las corrientes de maná del bosque.", body_style))
    story.append(Paragraph("Reapareció sobre mí. Sus cuatro brazos descendieron no como garras, sino como agujas quirúrgicas destinadas a paralizar mis centros de energía.", body_style))
    story.append(Paragraph("—¡<i>Corte de sombras</i>! —rugí, forzando a mis plumas a desprenderse en una ráfaga oscura que interceptó su trayectoria.", body_dialogue))
    story.append(Paragraph("Dos de sus manos perforaron la sombra sin inmutarse, alcanzando mi hombro izquierdo. En el instante exacto en que las yemas de sus dedos rozaron mi piel, sentí como si agujas de hielo hirviendo penetraran en mis venas. El flujo de maná en ese brazo se detuvo en seco, y una punzada de dolor indescriptible me obligó a soltar un alarido mientras mi visión se teñía de blanco.", body_style))
    
    story.append(Paragraph("✦   ✦   ✦", divider_style))
    
    story.append(Paragraph("—¿Lo sientes? —susurró casi a mi oído, sus ojos celestes brillando con crueldad—. Tus canales de maná se están colapsando. Un toque más en tu plexo solar y tu corazón dejará de bombear.", body_dialogue))
    story.append(Paragraph("El pánico intentó colarse en mi mente, pero el fuego del <i>Depredador</i> respondió con rabia pura.", body_style))
    story.append(Paragraph("<i>«¡No voy a morir aquí!»</i>", body_dialogue))
    story.append(Paragraph("Ignorando el hombro inutilizado y el dolor que desgarraba mis entrañas, utilicé mi brazo derecho funcional. En lugar de atacar su cuerpo protegido por cristal, concentré toda la reserva de maná sombrío en las garras de mi mano derecha y la clavé directo contra su ala inferior izquierda, apretando con fuerza homicida.", body_style))
    
    story.append(Paragraph("¡ ¡ R I I I P ! !", sound_effect_style))
    
    story.append(Paragraph("La membrana cristalina de su ala se quebró bajo la presión de mis garras. Un chillido agudo y disonante brotó de la garganta de Bharani cuando la delicada estructura de su vuelo fue mutilada.", body_style))
    story.append(Paragraph("Desequilibradas por el impacto y la violencia del choque, ambas caímos rodando por la pendiente del bosque, chocando contra raíces y rocas hasta quedar separadas por apenas una decena de metros.", body_style))
    story.append(Paragraph("Me incorporé con dificultad, apoyando una rodilla en el fango. El hombro izquierdo me colgaba inerte y sentía un sabor metálico inundándome la boca; tosí, escupiendo un coágulo de sangre espesa sobre la hierba.", body_style))
    story.append(Paragraph("Frente a mí, Bharani se levantaba con un movimiento tembloroso pero letal. Uno de sus brazos sostenía su ala dañada, mientras las otras tres extremidades vibraban con una furia fría y desatada. Su presencia ya no ocultaba nada: el maná de la Tercera Estrella de Aries caía sobre el claro con la densidad de una montaña a punto de derrumbarse.", body_style))
    
    story.append(Spacer(1, 8))
    
    # SECTION 2: POV Grania
    story.append(make_pov_banner("# EXTERIOR SECTOR ESTE — MARQUESA GRANIA #"))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("Desde lo alto de una elevación rocosa, con el abanico cerrado firmemente entre mis manos enguantadas, observaba la vorágine de energía que sacudía el valle inferior.", body_style))
    story.append(Paragraph("Las ondas de choque provocadas por la lucha entre Azari y aquella entidad celestial estaban resquebrajando el terreno con una violencia inusitada. Jamás imaginé que la pequeña felina fuera capaz de desatar un poder de semejante magnitud al activar la sangre de su clan, pero lo que realmente me helaba la sangre era la criatura frente a ella.", body_style))
    story.append(Paragraph("—Así que esto es una Estrella verdadera... —murmuré para mí misma, mientras mis doncellas y los caballeros de Kraen mantenían el círculo de contención mágica con rostros pálidos de terror.", body_dialogue))
    story.append(Paragraph("Incluso mutilada de un ala y con un cuerno fracturado, la densidad de maná de Bharani no disminuía; al contrario, parecía conectarse directamente con las raíces subterráneas del Gran Bosque, absorbiendo la energía residual de la propia barrera para sostenerse.", body_style))
    story.append(Paragraph("Y entonces, lo sentí.", body_style))
    story.append(Paragraph("Una presión gélida proveniente del horizonte exterior, mucho más lejana pero infinitamente más pesada que la de Bharani.", body_style))
    
    story.append(Paragraph("✦   ✦   ✦", divider_style))
    
    story.append(Paragraph("Levanté la mirada hacia el cielo del este.", body_style))
    story.append(Paragraph("Las nubes carmesíes que rodeaban la frontera del bosque no se estaban disipando; estaban convergiendo en un vórtice colosal. Entre las corrientes de aire distantes, tres presencias inmensas se desplazaban con paso inexorable hacia nuestra posición.", body_style))
    story.append(Paragraph("—Marquesa... los sensores de maná en el perímetro exterior acaban de colapsar —informó uno de mis oficiales con la voz rota—. Hay firmas celestiales múltiples aproximándose a la brecha.", body_dialogue))
    story.append(Paragraph("Apreté los nudillos contra mi abanico.", body_style))
    story.append(Paragraph("La advertencia de Sherat no era una exageración. Hamal y el resto de las estrellas de Aries ya estaban aquí. Si Azari caía en este claro, no quedaría nadie en el flanco este para retrasar la caída definitiva del sello.", body_style))
    
    story.append(Spacer(1, 8))
    
    # SECTION 3: Climax Azari
    story.append(make_pov_banner("# CLÍMAX — EL FILO DE LA MUERTE #"))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("El zumbido en mis oídos se mezclaba con el latido furioso de mi corazón.", body_style))
    story.append(Paragraph("La fiera en mi interior no retrocedía. Aunque mi cuerpo dolía y el frío de la técnica de Bharani intentaba congelarme el pecho, el instinto de cazador se negaba a doblegarse.", body_style))
    story.append(Paragraph("Bharani dio un paso hacia adelante. Las tres alas restantes comenzaron a batir en un ritmo desparejo pero ferozmente rápido, mientras cristales flotantes de color turquesa se condensaban alrededor de sus cuatro manos como proyectiles de ejecución.", body_style))
    story.append(Paragraph("—Se acabó el tiempo de juegos, pequeña Velztek —sentenció Bharani, y sus ojos reflejaron la luz fría de la muerte—. Eres digna de haber visto mi verdadera forma... ahora duerme en nombre de mi Reina.", body_dialogue))
    story.append(Paragraph("Me afirmé sobre mis piernas ensangrentadas, flexionando las garras de mi mano derecha mientras extendía mi ala restante en un último desafío abierto.", body_style))
    story.append(Paragraph("—Ven por mí, monstruo —escupí con desprecio—. Veamos quién cae primero.", body_dialogue))
    story.append(Paragraph("En ese instante exacto, un trueno ensordecedor desgarró el cielo sobre nuestras cabezas, y una primera grieta luminosa cruzó la bóveda mágica del bosque, anunciando que el asedio total a Kraen acababa de comenzar.", body_style))
    
    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="60%", thickness=0.8, color=colors.HexColor("#B8860B"), spaceAfter=10, spaceBefore=4))
    
    fin_style = ParagraphStyle(
        'Fin',
        fontName='Georgia-BoldItalic',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#7A1B2E"),
        alignment=TA_CENTER
    )
    story.append(Paragraph("CONTINUARÁ EN EL SIGUIENTE CAPÍTULO", fin_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully built: {filename}")

if __name__ == "__main__":
    out_dir = r"C:\Users\jonat\.gemini\antigravity\scratch\manga-site\novela"
    pdf_path = os.path.join(out_dir, "Velztek_Capitulo_71_Instinto_y_Cristal.pdf")
    build_pdf(pdf_path)
