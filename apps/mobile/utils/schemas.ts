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
    title: z
        .string("Debes ingresar el nombre de tu mascota")
        .min(3, "El título debe tener al menos 3 caracteres"),
    gender: z.enum(["Male", "Female"]),
    age: z.number("Debe ingresar una edad"),
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
