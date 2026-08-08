import { generateObject } from "ai";
import { readFileSync } from "fs";
import path from "path";
import { z } from "zod";

const schema = z
    .object({
        total: z.number().describe("The total amount of the invoice."),
        currency: z.string().describe("The currency of the total amount."),
        invoiceNumber: z.string().describe("The invoice number."),
        companyAddress: z.string().describe("The address of the company or person issuing the invoice."),
        companyName: z.string().describe("The name of the company issuing the invoice."),
        invoiceeAddress: z.string().describe("The address of the company or person receiving the invoice."),
    })
    .describe("The extracted data from the invoice.");

// 2. Initialize the model using the provider function
const model = "openai/gpt-4o-mini"; // or "openai/gpt-4o" for the full model

export const extractDataFromInvoice = async (invoicePath: string) => {
    const result = await generateObject({
        model,
        system: `You will receive an invoice. Please extract the data from the invoice.`,
        schema,
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'file',
                        data: readFileSync(invoicePath),
                        mediaType: 'application/pdf'
                    }
                ]
            }
        ]
    });

    // 3. Optional: return just the extracted object, not the full API response wrapper
    return result.object;
};

const result = await extractDataFromInvoice(
    path.join(import.meta.dirname, './invoice-1.pdf')
);

console.dir(result, { depth: null });