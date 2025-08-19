#!/usr/bin/env python3
"""
Script para fusionar múltiples catálogos del Convenio Marco.

Uso:
    python fusionar_catalogos.py archivo1.xlsx archivo2.xlsx ...

Salida:
    catalogo_unico.csv en el directorio actual, con columnas normalizadas:
    Proveedor,RUT,ID_Producto,Producto,Tipo_Producto,Region,Marca,Precio,Imagen

Este script asume que cada archivo Excel tiene la tabla de productos
comenzando en la fila 7 (índice 6), con cabeceras como:
- NOMBRE PROVEEDOR
- RUT PROVEEDOR
- ID PRODUCTO
- PRODUCTO
- TIPO PRODUCTO
- REGION
- MARCA
- PRECIO (opcional)
- IMAGEN (opcional)

Las columnas se renombrarán según el mapeo HEADER_MAP.
Se eliminarán filas sin ID_Producto o Producto.
Se eliminarán duplicados por la combinación (RUT, ID_Producto, Region).
"""

import sys
import pandas as pd
from pathlib import Path

# Mapa de cabeceras posibles a nuestro estándar
HEADER_MAP = {
    "NOMBRE PROVEEDO": "Proveedor",
    "NOMBRE PROVEEDOR": "Proveedor",
    "RUT PROVEEDOR": "RUT",
    "ID PRODUCTO": "ID_Producto",
    "PRODUCTO": "Producto",
    "TIPO PRODUCTO": "Tipo_Producto",
    "REGION": "Region",
    "MARCA": "Marca",
    "PRECIO": "Precio",
    "IMAGEN": "Imagen",
}

STANDARD_COLUMNS = ["Proveedor", "RUT", "ID_Producto", "Producto", "Tipo_Producto", "Region", "Marca", "Precio", "Imagen"]


def load_sheet(path: Path) -> pd.DataFrame:
    """Carga la primera hoja del Excel asumiendo cabeceras en la fila 7 (índice 6)."""
    try:
        xls = pd.ExcelFile(path)
        sheet_name = xls.sheet_names[0]
        df = pd.read_excel(path, sheet_name=sheet_name, header=6)
    except Exception as e:
        raise RuntimeError(f"No se pudo leer {path}: {e}")

    # Eliminar columnas y filas totalmente vacías
    df = df.dropna(axis=1, how="all").dropna(how="all")

    # Renombrar columnas
    new_cols = {}
    for col in df.columns:
        key = str(col).strip().upper()
        match = None
        for k, v in HEADER_MAP.items():
            if key == k:
                match = v
                break
        new_cols[col] = match if match else col
    df = df.rename(columns=new_cols)

    # Asegurar todas las columnas estándar existen
    for c in STANDARD_COLUMNS:
        if c not in df.columns:
            df[c] = pd.NA

    df = df[STANDARD_COLUMNS]

    # Normalizar cadenas
    df["Proveedor"] = df["Proveedor"].astype(str).str.strip()
    df["RUT"] = df["RUT"].astype(str).str.strip()
    df["Region"] = df["Region"].astype(str).str.strip()
    df["Marca"] = df["Marca"].astype(str).str.strip()

    # Quitar filas sin ID o Producto
    df = df.dropna(subset=["ID_Producto", "Producto"])
    return df


def main():
    if len(sys.argv) < 2:
        print("Uso: python fusionar_catalogos.py archivo1.xlsx archivo2.xlsx ...")
        sys.exit(1)

    frames = []
    for fname in sys.argv[1:]:
        path = Path(fname)
        if not path.exists():
            print(f"⚠️  No existe: {path}")
            continue
        try:
            df = load_sheet(path)
            frames.append(df)
            print(f"✓ Procesado: {path.name} ({len(df)} filas)")
        except Exception as e:
            print(f"❌ Error con {path.name}: {e}")

    if not frames:
        print("No se generó salida (sin archivos válidos).")
        sys.exit(1)

    out = pd.concat(frames, ignore_index=True)
    # Eliminar duplicados por RUT + ID_Producto + Region
    out = out.drop_duplicates(subset=["RUT", "ID_Producto", "Region"], keep="first")

    out.to_csv("catalogo_unico.csv", index=False, encoding="utf-8")
    print(f"\n✅ Listo: catalogo_unico.csv ({len(out)} filas)")


if __name__ == "__main__":
    main()
