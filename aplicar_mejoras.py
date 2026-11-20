#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Taxi SurfCity Lainez - sincronizar y validar mejoras SEO/Navidad de Tours.

Uso (Windows, desde la carpeta principal del proyecto):
    py aplicar_mejoras.py             # sincroniza los archivos del diseño de main
    py aplicar_mejoras.py --dry-run   # muestra cambios sin tocar archivos
    py aplicar_mejoras.py --check     # valida la copia local, sin internet

El script conserva copias originales antes de reemplazarlas.
La versión publicada en GitHub es la fuente de los cambios; no crea
contenido ni inventa precios, disponibilidad o datos de Search Console.
"""
from __future__ import annotations

import argparse
from datetime import datetime
import json
from pathlib import Path
import re
import shutil
import sys
import tempfile
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

REPO = "jose-lainez3/taxisurfcity"
RAW_BASE = "https://raw.githubusercontent.com/" + REPO + "/main/"
FILES = (
    "index.html",
    "tours.html",
    "404.html",
    "assets/css/styllees.css",
    "assets/css/christmas-unified.css",
    "assets/js/i18n.js",
    "assets/js/chatbot.js",
    "assets/js/assistant-config.js",
    "api/assistant.mjs",
    "AI_AGENT_SETUP.md",
    "vercel.json",
    "sitemap.xml",
)
TOUR_IDS = (
    "ruta-de-las-flores",
    "volcan-coatepeque",
    "suchitoto",
    "joya-de-ceren",
    "boqueron",
    "surf-city",
)


def validate_snapshot(files: dict[str, bytes]) -> list[str]:
    errors: list[str] = []
    try:
        html = files["tours.html"].decode("utf-8")
        css = files["assets/css/styllees.css"].decode("utf-8")
        js = files["assets/js/i18n.js"].decode("utf-8")
        sitemap = files["sitemap.xml"].decode("utf-8")
    except (KeyError, UnicodeDecodeError) as exc:
        return ["Archivos incompletos o codificación inválida: " + str(exc)]

    checks = {
        "SEO: título optimizado": "Tours privados en El Salvador" in html,
        "SEO: página canónica": 'rel="canonical"' in html,
        "SEO: catálogo estructurado": '"@type": "CollectionPage"' in html,
        "Medición: Google Analytics 4": "G-JW16TEF1NL" in html,
        "Medición: evento clic en WhatsApp": "tour_whatsapp_click" in html,
        "Diseño: tema exclusivo para tours": 'class="tours-page"' in html,
        "Diseño: navegación por destinos": 'class="tour-explore-nav"' in html,
        "Diseño: sección para elegir tour": 'id="elegir-tour"' in html,
        "Estilos CSS adaptados a tours": "body.tours-page" in css,
        "Traducciones y metadatos": '"t.guide.title"' in js,
        "Portada: tema compartido": 'site-christmas home-page' in files["index.html"].decode("utf-8"),
        "404: tema compartido": 'site-christmas not-found-page' in files["404.html"].decode("utf-8"),
        "CSS: tema compartido": 'body.site-christmas' in files["assets/css/christmas-unified.css"].decode("utf-8"),
        "Asistente: cliente con IA": 'async function askAI' in files["assets/js/chatbot.js"].decode("utf-8"),
        "Asistente: configuración separada": 'TAXISURFCITY_AI_ENDPOINT' in files["assets/js/assistant-config.js"].decode("utf-8"),
        "Asistente: API serverless": 'google_search' in files["api/assistant.mjs"].decode("utf-8"),
        "Asistente: documentación": b'GEMINI_API_KEY' in files["AI_AGENT_SETUP.md"],
        "Enlaces tours Vercel": b'/tours.html' in files["vercel.json"],
        "Catálogo en IA": b'OFFICIAL_TOUR_CONTEXT' in files["api/assistant.mjs"],
        "Sitemap: ruta canónica": "https://taxistuncoelsalvador.com/tours" in sitemap,
    }
    for name, success in checks.items():
        if not success:
            errors.append(name)

    for tour_id in TOUR_IDS:
        if 'id="' + tour_id + '"' not in html:
            errors.append("Tour sin identificador: " + tour_id)
        if 'href="#' + tour_id + '"' not in html:
            errors.append("Tour sin enlace rápido: " + tour_id)

    scripts = re.findall(
        r'<script\s+type="application/ld\+json">([\s\S]*?)</script>',
        html,
        flags=re.IGNORECASE,
    )
    for index, content in enumerate(scripts, start=1):
        try:
            json.loads(content)
        except json.JSONDecodeError as exc:
            errors.append("JSON-LD inválido en bloque " + str(index) + ": " + str(exc))
    if len(scripts) < 4:
        errors.append("Faltan bloques de datos estructurados")

    return errors


def read_local(root: Path, allow_missing: bool = False) -> dict[str, bytes]:
    files = {}
    for name in FILES:
        target = root / name
        if not target.is_file():
            if not allow_missing:
                raise FileNotFoundError("No se encuentra " + str(target))
            files[name] = b""
            continue
        files[name] = target.read_bytes()
    return files


def fetch_remote() -> dict[str, bytes]:
    fetched = {}
    for name in FILES:
        url = RAW_BASE + name
        print("Consultando:", name)
        req = Request(url, headers={"User-Agent": "TaxiSurfCity-SEO-Updater/1.0"})
        with urlopen(req, timeout=25) as resp:
            data = resp.read()
        if not data or len(data) > 750_000:
            raise ValueError("Archivo vacío o demasiado grande: " + name)
        fetched[name] = data
    return fetched


def synchronize(root: Path, incoming: dict[str, bytes], dry_run: bool) -> int:
    local = read_local(root, allow_missing=True)
    changed = [name for name in FILES if local[name] != incoming[name]]
    if not changed:
        print("Todos los archivos ya coinciden con la versión optimizada de GitHub.")
        return 0

    for name in changed:
        print("Actualizar:", name)

    if dry_run:
        print("Simulación: no se modificó ningún archivo.")
        return len(changed)

    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup = root / ".taxisurfcity-backups" / stamp
    for name in changed:
        source = root / name
        if source.is_file():
            target_backup = backup / name
            target_backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target_backup)

    try:
        for name in changed:
            target = root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.NamedTemporaryFile(
                mode="wb", dir=target.parent, prefix=".taxisurfcity-", delete=False
            ) as temp:
                temp.write(incoming[name])
                temporary = Path(temp.name)
            try:
                temporary.replace(target)
            finally:
                temporary.unlink(missing_ok=True)
    except OSError:
        print("Error al escribir. Los respaldos siguen en:", backup)
        raise

    print("Actualizados", len(changed), "archivos. Respaldos:", backup)
    return len(changed)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Aplicar y comprobar mejoras SEO/navideñas de Taxi SurfCity Tours."
    )
    opts = parser.add_mutually_exclusive_group()
    opts.add_argument("--check", action="store_true",
                      help="Comprobar archivos locales, sin acceder a internet")
    opts.add_argument("--dry-run", action="store_true",
                      help="Consultar cambios disponibles sin escribir nada")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    if not (root / "tours.html").is_file():
        print("Coloca este archivo en la raíz del repositorio, junto a tours.html.")
        return 2

    if args.check:
        errors = validate_snapshot(read_local(root))
        if errors:
            print("Problemas por revisar:")
            for error in errors:
                print(" -", error)
            return 1
        print("Correcto: SEO, analítica, JSON-LD y diseño navideño unificado encontrados.")
        return 0

    try:
        downloaded = fetch_remote()
        problems = validate_snapshot(downloaded)
        if problems:
            print("Se detuvo la actualización: la versión remota no pasó la validación.")
            for problem in problems:
                print(" -", problem)
            return 3
        synchronize(root, downloaded, args.dry_run)
    except (OSError, HTTPError, URLError, ValueError) as exc:
        print("No se completó la actualización:", exc)
        return 4

    if not args.dry_run:
        problems = validate_snapshot(read_local(root))
        if problems:
            print("Advertencia: hay comprobaciones pendientes:", problems)
            return 5
        print("Verificación final correcta.")
        print("Revisa los cambios con: git diff")
        print("Para publicar desde tu equipo: git add . && git commit -m \"Mejoras tours\" && git push")
    return 0


if __name__ == "__main__":
    sys.exit(main())
