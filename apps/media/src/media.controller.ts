import { Request, Response } from "express"
import path from "path"
import fs from "fs"
import sharp from "sharp"

// Resuelve la carpeta de assets tanto si corres con ts-node (src) como si compilas (dist)
function resolveAssetsDir(): string {
  const candidates = [
    path.resolve(__dirname, "assets"),        // apps/media/src/assets
    path.resolve(__dirname, "..", "assets"),  // apps/media/dist/assets (si compilas)
    path.resolve(process.cwd(), "src", "assets"),
    path.resolve(process.cwd(), "assets"),
  ]
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir
  }
  return path.resolve(__dirname, "assets")
}

const ASSETS_DIR = resolveAssetsDir()
const PETS_DIR = path.join(ASSETS_DIR, "pets")
const PLACEHOLDER_PATH = path.join(ASSETS_DIR, "placeholder.jpg")

console.log("[media] ASSETS_DIR:", ASSETS_DIR)

function findPetFileById(id: string): string | null {
  const exts = [".jpg", ".jpeg", ".png", ".webp"]
  for (const ext of exts) {
    const p = path.join(PETS_DIR, `${id}${ext}`)
    if (fs.existsSync(p)) return p
  }
  return null
}

async function makeGeneratedPlaceholder(w: number) {
  // Genera un placeholder gris si no hay archivo en disco
  return sharp({
    create: {
      width: Math.max(32, Math.min(w, 512)),
      height: Math.max(20, Math.min(Math.round(w * 0.7), 360)),
      channels: 3,
      background: "#eaeaea",
    },
  }).jpeg({ quality: 60 }).toBuffer()
}

/**
 * GET /api/pets/:id/image?variant=thumb|full
 *  - thumb: 320px ancho, calidad 55 (rápido para Home)
 *  - full : 1280px ancho, calidad 85 (detalle)
 */
export async function getPetImage(req: Request, res: Response) {
  try {
    const { id } = req.params
    const variant = (req.query.variant as string) || "thumb"

    // Verificar el nombre de los archivos
    const file =
      [".jpg", ".jpeg", ".png", ".webp"]
        .map(ext => path.join(PETS_DIR, `${id}${ext}`))
        .find(p => fs.existsSync(p)) || PLACEHOLDER_PATH

    if (!file) {
      return res.status(404).send("Imagen no encontrada")
    }

    const w = variant === "full" ? 1280 : 320
    const q = variant === "full" ? 85 : 55

    // Procesar la imagen con sharp
    const buffer = await sharp(file)
      .resize({ width: w, withoutEnlargement: true })
      .toFormat("jpeg", { quality: q })
      .toBuffer()

    res.setHeader("Content-Type", "image/jpeg")
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
    return res.send(buffer)
  } catch (err) {
    console.error(err)
    return res.status(500).send("Error al procesar la imagen")
  }
}


/**
 * (Opcional) original sin compresión
 * GET /api/pets/:id/image/original
 */
export async function getPetImageOriginal(req: Request, res: Response) {
  const { id } = req.params
  let file = findPetFileById(String(id))
  if (!file && fs.existsSync(PLACEHOLDER_PATH)) {
    file = PLACEHOLDER_PATH
  }
  if (file) {
    return res.sendFile(file)
  }
  // Si no hay nada, manda un placeholder generado
  const ph = await makeGeneratedPlaceholder(640)
  res.setHeader("Content-Type", "image/jpg")
  return res.send(ph)
}
