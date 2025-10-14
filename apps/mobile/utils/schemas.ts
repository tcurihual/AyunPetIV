import { z } from "zod"
import { validarRUT } from "@/utils/rut"

export const roleSchema = z.object({
    id: z.number("Se debe ingresar un id valido"),
    roletype: z.string("Se debe ingresar un string"),
})

export const LoginFormSchema = z.object({
    email: z.email("Debes ingresar un correo válido"),
    password: z.string("La contraseña es obligatoria").min(1, "Debe ingresar la contraseña"),
})

export const RegisterFormSchema = z
    .object({
        rut: z.string(),
        email: z.email("Debes ingresar un correo válido"),
        name: z.string("El nombre es obligatorio").min(8, "Debe ingresar ser nombre y apellido"),
        password: z
            .string("La contraseña es obligatoria")
            .min(8, "Debe tener al menos 8 caracteres")
            .regex(/[!@#$%^&*(),.?":{}|<>]/, "Debe incluir al menos un carácter especial")
            .regex(/\d/, "Debe incluir al menos un número"),
        verifyPassword: z.string("Confirme su contraseña"),
        phone: z
            .string()
            .length(8, "El número teléfonico debe tener 8 dígitos")
            .regex(/^\d{8}$/, "El número debe contener solo dígitos"),
    })
    .refine((data) => data.password === data.verifyPassword, {
        message: "Las contraseñas no coinciden",
        path: ["verifyPassword"],
    })
    .refine((data) => validarRUT(data.rut), {
        message: "El RUT no es válido",
        path: ["rut"],
    })

export const GiverRegisterFormSchema = z
    .object({
        name: z
            .string("El nombre es obligatorio")
            .min(8, "Debe ingresar un nombre completo (nombre y apellido)"),
        rut: z.string("El RUT es obligatorio").refine((data) => validarRUT(data), {
            message: "El RUT no es válido",
        }),
        email: z.email("Debes ingresar un correo válido"),
        password: z
            .string("La contraseña es obligatoria")
            .min(8, "Debe tener al menos 8 caracteres")
            .regex(/[!@#$%^&*(),.?":{}|<>]/, "Debe incluir al menos un carácter especial")
            .regex(/\d/, "Debe incluir al menos un número"),
        verifyPassword: z
            .string("Confirma la contraseña")
            .min(8, "Debe tener al menos 8 caracteres"),
        phone: z
            .string()
            .length(8, "El número de teléfono debe tener 8 dígitos")
            .regex(/^\d{8}$/, "El número debe contener solo dígitos"),
        files: z
            .array(z.string())
            .min(1, "Debes subir al menos un archivo (imagen o PDF)")
            .or(z.string().min(1, "Debes subir al menos un archivo (imagen o PDF)")),
    })
    .refine((data) => data.password === data.verifyPassword, {
        message: "Las contraseñas no coinciden",
        path: ["verifyPassword"],
    })

export const PostFormSchema = z.object({
    ownerId: z.number("Debe ingresar un id valido"),
    petId: z.number("Debe ingresar un id valido"),
    title: z
        .string("Debes ingresar el nombre de tu mascota")
        .min(3, "El título debe tener al menos 3 caracteres"),
    description: z
        .string("La descripción de tu mascota es obligatoria")
        .min(10, "La descripción debe tener al menos 10 caracteres"),
})

export const PetFormSchema = z.object({
  ownerId: z.number("Debe ingresar un id valido"),
  species: z.enum(["Dog", "Cat"], "Debes seleccionar una especie"),
  name: z.string("Debes ingresar el nombre de tu mascota")
           .min(3, "El nombre debe tener al menos 3 caracteres"),
  gender: z.enum(["Male", "Female"]),
  age: z.coerce.number("Debe ingresar una edad")
               .int("Debe ser un número entero")
               .min(0, "La edad no puede ser negativa")
               .max(40, "Revisa la edad (máx 40)"),
  size: z.enum(["Small", "Medium", "Large"]),
  sterilized: z.boolean(),
})

export const MessageFormSchema = z.object({
    creatorId: z.number("Debe ingresar un id valido"),
    postId: z.number("Debe ingresar un id valido"),
    description: z.string("Debe incluir el mensaje").min(10, "el mensaje es muy corto"),
})

export const AdoptionFormRequestSchema = z.object({
    postId: z.number("Debe ingresar un id valido"),
    userId: z.number("Debe ingresar un id valido"),
    message: z.string("Debe incluir un mensaje").min(10, "El mensaje es muy corto"),
})

export const ReportFormSchema = z.object({
    userId: z.number("Debe ingresar un id valido"),
    postId: z.number("Debe ingresar un id valido"),
    description: z.enum(["Inappropriate Content", "Spam", "Scam", "Other"]),
})

export const UpdateUserSchema = z.object({
    id: z.string("ID del usuario es requerido"),
    role: z.string("Rol es requerido"),
    rut: z
        .string("RUT es obligatorio")
        .min(9, "El RUT debe tener al menos 9 caracteres (ej: 1234567-8)")
        .max(10, "El RUT no puede tener más de 10 caracteres")
        .refine((rut) => validarRUT(rut), {
            message: "El RUT no es válido. Formato: 12345678-9",
        }),
    email: z
        .string("Email es obligatorio")
        .email("Debe ser un email válido")
        .max(100, "El email no puede tener más de 100 caracteres"),
    name: z
        .string("Nombre es obligatorio")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede tener más de 50 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Debe incluir al menos un carácter especial")
        .regex(/\d/, "Debe incluir al menos un número")
        .optional(),
    validated: z.boolean().default(false),
    address: z.string().max(200, "La dirección no puede tener más de 200 caracteres").optional(),
    description: z
        .string()
        .max(500, "La descripción no puede tener más de 500 caracteres")
        .optional(),
})

export const UserProfileSchema = z.object({
    id: z.string("ID del usuario es requerido"),
    name: z
        .string("Nombre es obligatorio")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede tener más de 50 caracteres")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),
    email: z
        .string("Email es obligatorio")
        .email("Debe ser un email válido")
        .max(100, "El email no puede tener más de 100 caracteres"),
    address: z.string().max(200, "La dirección no puede tener más de 200 caracteres").optional(),
    description: z
        .string()
        .max(500, "La descripción no puede tener más de 500 caracteres")
        .optional(),
})

export const ChangePasswordSchema = z
    .object({
        currentPassword: z.string("Contraseña actual es obligatoria"),
        newPassword: z
            .string("Nueva contraseña es obligatoria")
            .min(8, "Debe tener al menos 8 caracteres")
            .regex(/[!@#$%^&*(),.?":{}|<>]/, "Debe incluir al menos un carácter especial")
            .regex(/\d/, "Debe incluir al menos un número"),
        confirmPassword: z.string("Confirme la nueva contraseña"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "La nueva contraseña debe ser diferente a la actual",
        path: ["newPassword"],
    })

export type UpdateUserData = z.infer<typeof UpdateUserSchema>
export type UserProfileData = z.infer<typeof UserProfileSchema>
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>
