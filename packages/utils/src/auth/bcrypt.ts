import bcrypt from "bcrypt"

export async function hashPassword(plain: string): Promise<string> {
    const salt = await bcrypt.genSalt(12)
    return bcrypt.hash(plain, salt)
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash)
}
