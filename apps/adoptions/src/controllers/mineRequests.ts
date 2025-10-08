import type { Response } from "express"
import { createSupabaseClient, AppResponse } from "@repo/utils"
import type { AuthenticatedRequest } from "@repo/utils"

export const listMyRequests = async (req: AuthenticatedRequest, res: Response) => {
    const supa = createSupabaseClient()
    const userId = req.user.id
    const role = req.user.role

    if (role === 1) {
        const { data, error } = await supa
            .from("adoption_request")
            .select("*")
            .eq("userid", userId)
            .order("createdat", { ascending: false })

        if (error) return AppResponse(res, 500, error.message, null)
        return AppResponse(res, 200, "OK", { as: "adopter", requests: data ?? [] })
    }

    const { data: myCreatedPosts, error: e1 } = await supa
        .from("post")
        .select("id")
        .eq("creatorid", userId)
    if (e1) return AppResponse(res, 500, e1.message, null)

    const { data: myPets, error: e2 } = await supa.from("pet").select("id").eq("ownerid", userId)
    if (e2) return AppResponse(res, 500, e2.message, null)

    let petIds: number[] = (myPets ?? []).map((p) => p.id)
    let postIdsByPets: number[] = []
    if (petIds.length > 0) {
        const { data: postsByPets, error: e3 } = await supa
            .from("post")
            .select("id")
            .in("petid", petIds)
        if (e3) return AppResponse(res, 500, e3.message, null)
        postIdsByPets = (postsByPets ?? []).map((p) => p.id)
    }

    const postIdSet = new Set<number>([
        ...(myCreatedPosts ?? []).map((p) => p.id),
        ...postIdsByPets,
    ])
    const allPostIds = Array.from(postIdSet)

    if (allPostIds.length === 0) {
        return AppResponse(res, 200, "OK", { as: "giver", requests: [] })
    }

    const { data: requests, error: e4 } = await supa
        .from("adoption_request")
        .select("*")
        .in("postid", allPostIds)
        .order("createdat", { ascending: false })

    if (e4) return AppResponse(res, 500, e4.message, null)
    return AppResponse(res, 200, "OK", { as: "giver", requests: requests ?? [] })
}
