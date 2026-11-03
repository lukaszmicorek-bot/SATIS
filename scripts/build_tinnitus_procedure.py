#!/usr/bin/env python3
"""Re-typeset the supplied Beltone diagram without changing its decision paths.

The original scan stays in thi-metoda.pdf. This is a graphical transcription,
not a clinical update. Requires reportlab and pdfplumber, plus Arial TTF fonts.
"""
from pathlib import Path
import argparse
import math

from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader
import pdfplumber


def build(root, font_dir):
    output = root / 'procedures'
    assert (output / 'thi-metoda.pdf').is_file(), 'Original scan is required'
    pdfmetrics.registerFont(TTFont('Procedure', str(font_dir / 'Arial.ttf')))
    pdfmetrics.registerFont(TTFont('ProcedureBold', str(font_dir / 'Arial Bold.ttf')))
    pdfmetrics.registerFontFamily('Procedure', normal='Procedure', bold='ProcedureBold')
    width, height = 595.276, 841.89
    target = output / 'thi-procedure-clean.pdf'
    c = canvas.Canvas(str(target), pagesize=(width, height), pageCompression=1, invariant=1)
    c.setTitle('Szumy uszne - procedura THI. Opracowanie graficzne materiału Beltone')
    c.setAuthor('SATIS - opracowanie graficzne; materiał źródłowy Beltone')
    ink, teal, line = '#163C49', '#007B7D', '#759A9E'

    def text(x, top, w, value, size=11, bold=False, color=ink, align=0):
        style = ParagraphStyle('p', fontName='ProcedureBold' if bold else 'Procedure',
                               fontSize=size, leading=size*1.28, textColor=HexColor(color),
                               alignment=align, spaceBefore=0, spaceAfter=0)
        p = Paragraph(value, style)
        _, h = p.wrap(w, 1000)
        p.drawOn(c, x, height-top-h)
        return h

    def box(x, top, w, h, value, fill='#EDF6F5', size=11, bold=False, color=ink):
        style = ParagraphStyle('box', fontName='ProcedureBold' if bold else 'Procedure',
                               fontSize=size, leading=size*1.27, alignment=1,
                               textColor=HexColor(color))
        p = Paragraph(value, style)
        _, ph = p.wrap(w-18, h)
        assert ph <= h-14, (value, ph, h)
        c.setFillColor(HexColor(fill)); c.setStrokeColor(HexColor('#CFDFDF'))
        c.setLineWidth(.6); c.roundRect(x, height-top-h, w, h, 4, fill=1, stroke=1)
        p.drawOn(c, x+9, height-top-(h+ph)/2)

    def arrow(points, label='', lx=None, ly=None):
        c.setStrokeColor(HexColor(line)); c.setFillColor(HexColor(line)); c.setLineWidth(1.15)
        path=c.beginPath(); path.moveTo(points[0][0], height-points[0][1])
        for x,y in points[1:]: path.lineTo(x, height-y)
        c.drawPath(path)
        (x0,y0),(x1,y1)=points[-2:]; angle=math.atan2(y1-y0,x1-x0)
        head=c.beginPath(); head.moveTo(x1,height-y1)
        for d in (-.45,.45):
            head.lineTo(x1-6*math.cos(angle+d),height-(y1-6*math.sin(angle+d)))
        head.close(); c.drawPath(head,fill=1,stroke=0)
        if label: text(lx,ly,76,label,9,bold=True,color=teal)

    def header(kicker, title, subtitle):
        c.setFillColor(HexColor(teal)); c.rect(36,height-42,32,3,fill=1,stroke=0)
        text(79,30,480,kicker,9,True,teal)
        text(36,62,523,title,21,True)
        text(36,119,523,subtitle,10,color='#5B717B')

    def footer(page):
        c.setStrokeColor(HexColor('#CFDFDF')); c.setLineWidth(.6); c.line(36,35,559,35)
        text(36,811,475,'Beltone · M402681-PL-14.11 Rev.A · opracowanie graficzne SATIS',8,color='#5B717B')
        text(526,810,33,f'{page} / 2',9,True,align=2)

    header('SZUMY USZNE / THI', 'Rozpoznanie utrudnień<br/>wywołanych szumami usznymi',
           'Na bazie Tinnitus Handicap Inventory (THI)')
    box(232,152,132,32,'WYNIK THI',fill='#DCEEEE',bold=True)
    for x,label,fill in [(36,'<b>Lekki do łagodnego</b><br/>Stopień 1-2<br/><b>0-36</b>','#EFF7F5'),
                         (220,'<b>Umiarkowany</b><br/>Stopień 3<br/><b>38-56</b>','#E4F1F1'),
                         (404,'<b>Poważny do krytycznego</b><br/>Stopień 4-5<br/><b>58-100</b>','#DEEAF0')]:
        arrow([(298,184),(298,195),(x+77.5,195),(x+77.5,212)])
        box(x,212,155,66,label,fill=fill)
        arrow([(x+77.5,278),(x+77.5,300)])
    box(36,300,523,36,'Przeprowadź badanie/test słuchu',fill='#DCEEEE',bold=True,size=12)
    for x in (113.5,297.5,481.5): arrow([(x,336),(x,359)])
    box(36,359,155,54,'Niedosłuch?',bold=True)
    box(220,359,155,104,'Odpowiednie badania lekarskie przed dopasowaniem aparatu słuchowego Beltone z funkcją Tinnitus Breaker Pro',size=10.5)
    box(404,359,155,54,'Niedosłuch?',bold=True)
    arrow([(82,413),(70,441),(70,489)],'Nie',43,445)
    arrow([(145,413),(151,441),(151,489)],'Tak',158,445)
    box(36,489,68,82,'Kontrola coroczna',size=10)
    box(116,489,75,114,'Kontynuuj<br/>standardową<br/>kwalifikację<br/>do aparatu<br/>słuchowego',size=9.2)
    arrow([(297.5,463),(297.5,489)],'Tak',304,470)
    box(220,489,155,114,'Przejdź do kwalifikacji szumów usznych',size=12)
    arrow([(375,411),(390,411),(390,476),(446,476),(446,489)],'Nie',393,457)
    arrow([(481.5,413),(481.5,489)],'Tak / Nie',489,438)
    box(404,489,155,114,'Skieruj na pełne badania medyczne lub ewaluację psychologiczną',size=11)
    arrow([(153.5,603),(153.5,628),(222,650)])
    arrow([(297.5,603),(297.5,650)])
    arrow([(481.5,603),(481.5,628),(374,650)])
    box(116,650,443,72,'<b>Dopasuj aparaty słuchowe Beltone Tinnitus Breaker Pro</b><br/>Zaoferuj aplikację Tinnitus Calmer do terapii dźwiękiem',fill='#003F5A',color='#FFFFFF',size=12)
    text(36,743,523,'<b>Uwaga:</b> Osoby cierpiące na szumy uszne, u których występuje jednostronny szum uszny lub asymetryczna utrata słuchu, niezależnie od wyniku THI, powinny poddać się odpowiednim badaniom lekarskim przed dopasowaniem aparatów.',9)
    footer(1); c.showPage()

    header('SZUMY USZNE / ROZMOWA Z PACJENTEM','Emocje związane<br/>z szumami usznymi',
           'Osoba cierpiąca na szumy uszne')
    box(168,161,259,42,'Emocje związane z szumami usznymi',fill='#DCEEEE',bold=True,size=12)
    descriptions=[
        ('Zaciekawienie','Podaj podstawowe informacje na temat szumów usznych',
         'np. Poradnik Beltone Tinnitus Breaker Pro, literatura na temat szumów usznych, profesjonalne strony internetowe dotyczące szumów usznych, aplikacja Tinnitus Calmer'),
        ('Obawy','Doradztwo i przegląd opcji terapii',
         'np. terapia dźwiękiem, aplikacja Tinnitus Calmer, Tinnitus Retraining Therapy, leczenie behawioralne, itp.'),
        ('Strapienie','Doradź i zapewnij odpowiednią terapię',
         'np. terapia dźwiękiem, aplikacja Tinnitus Calmer - rozważ odpowiednie skierowania'),
    ]
    for index,(emotion,action,examples) in enumerate(descriptions):
        x=36+index*184
        arrow([(297.5,203),(297.5,223),(x+77.5,223),(x+77.5,248)])
        box(x,248,155,44,emotion,fill='#E3F0EF',bold=True,size=13)
        arrow([(x+77.5,292),(x+77.5,319)])
        box(x,319,155,246,'',fill='#F5F9F9',size=11)
        text(x+10,338,135,action,11,True,align=1)
        h=text(x+10,410,135,examples,11,align=1)
        assert h <= 145, (emotion,h)
    text(36,620,523,'Materiał źródłowy',12,True)
    text(36,646,523,'Tyler RS, Noble W, Coehlo C, Haskell G, Bardia A. (2009). Szum uszny i nadwrażliwość słuchowa. Podręcznik audiologii klinicznej.',10)
    text(36,692,523,'Beltone A/S, Lautrupbjerg 7, DK-2750 Ballerup, Denmark.',10)
    text(36,737,523,'Opracowanie graficzne na podstawie dostarczonego materiału Beltone. Zachowano jego treść i ścieżki postępowania; nie jest to aktualizacja zaleceń klinicznych.',9,color='#5B717B')
    footer(2); c.showPage(); c.save()
    reader=PdfReader(target)
    assert len(reader.pages)==2
    assert all(len(page.extract_text())>500 for page in reader.pages)
    assert not reader.trailer['/Root'].get('/OpenAction')
    with pdfplumber.open(target) as pdf:
        for index,page in enumerate(pdf.pages,1):
            page.to_image(resolution=160).original.convert('RGB').save(output/f'thi-page-{index}.jpg',quality=90,optimize=True)
    print(f'Built 2 searchable vector pages; PDF {target.stat().st_size} bytes')


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1])
    parser.add_argument('--font-dir',type=Path,default=Path('/System/Library/Fonts/Supplemental'))
    args=parser.parse_args()
    build(args.root,args.font_dir)
