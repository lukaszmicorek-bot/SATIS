"""Build public blank-template SVGs and local GUS address dictionaries. No client data."""
import argparse
import csv
import io
import json
import subprocess
import zipfile
from pathlib import Path


def rows(path):
    with zipfile.ZipFile(path) as archive:
        name = next(name for name in archive.namelist() if name.lower().endswith(".csv"))
        return list(csv.DictReader(io.StringIO(archive.read(name).decode("utf-8-sig")), delimiter=";"))


def build(pdf, terc, simc, output):
    output.mkdir(parents=True, exist_ok=True)
    units = rows(terc)
    provinces = {row["WOJ"]:row["NAZWA"].lower() for row in units if not row["POW"]}
    counties = {}
    for row in units:
        if row["POW"] and not row["GMI"]:
            label = row["NAZWA"]
            if "miasto" in row["NAZWA_DOD"]:
                label += " (miasto na prawach powiatu)"
            counties[row["WOJ"] + row["POW"]] = label
    administration = {row["WOJ"]+row["POW"]+row["GMI"]+row["RODZ"]:
        [row["NAZWA"], counties[row["WOJ"]+row["POW"]], provinces[row["WOJ"]]]
        for row in units if row["GMI"] and row["WOJ"]+row["POW"] == "2417"}
    places = []
    for row in rows(simc):
        code = row["WOJ"]+row["POW"]+row["GMI"]+row["RODZ_GMI"]
        if row["SYM"] == row["SYMPOD"] and code in administration:
            places.append([row["NAZWA"],code,row["SYM"],"miasto" if row["RM"] == "96" else ""])
    data = {"downloaded":"2026-11-02", "source":"GUS TERYT · TERC i SIMC",
        "sourceUrl":"https://eteryt.stat.gov.pl/eTeryt/rejestr_teryt/udostepnianie_danych/baza_teryt/uzytkownicy_indywidualni/pobieranie/pliki_pelne.aspx?contrast=default",
        "countyScope":"2417","scopeLabel":"powiat żywiecki","units":administration,"places":places}
    (output/"geography.json").write_text(json.dumps(data,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
    for page in range(1,8):
        target = output/f"page-{page}.svg"
        subprocess.run(["pdftocairo","-svg","-f",str(page),"-l",str(page),str(pdf),str(target)],check=True)
        source = target.read_text(encoding="utf-8")
        if any(token in source.lower() for token in ("<script", "<foreignobject", 'href="http', 'href="file:')):
            raise ValueError("Template must contain only local static vector graphics")
    print(f"Blank template: 7 pages. GUS dictionary: {len(places)} places. No client data.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf",type=Path,required=True)
    parser.add_argument("--terc",type=Path,required=True)
    parser.add_argument("--simc",type=Path,required=True)
    parser.add_argument("--output",type=Path,required=True)
    args = parser.parse_args()
    build(args.pdf,args.terc,args.simc,args.output)
