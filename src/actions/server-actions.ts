"use server";

import * as z from "zod";

const CheckFactPayloadSchema = z.object({
    url: z.string().url(),
})

export async function checkFact(formdata: FormData) {
    const payloadUnsafe = {
        url: formdata.get("url"),
    }
    const payload = CheckFactPayloadSchema.parse(payloadUnsafe);

    console.log(payload);
}