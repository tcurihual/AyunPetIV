import path from "path"
import fs from "fs/promises"

export const PUBLIC_ENTITIES = ["users", "news", "publications", "profile_picture", "profile_mural"]

export const UPLOADS_BASE = path.join(__dirname, "..", "uploads")

export const getAllFiles = async (dirPath: string, out: string[] = []): Promise<string[]> => {
    const entries = await fs.readdir(dirPath)
    for (const entry of entries) {
        const full = path.join(dirPath, entry)
        const st = await fs.stat(full)
        if (st.isDirectory()) await getAllFiles(full, out)
        else out.push(full)
    }
    return out
}
