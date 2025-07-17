import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
// import Tesseract from "tesseract.js";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const mode = formData.get("mode") as string;
  if (!file || !mode) {
    return NextResponse.json({ error: "Missing file or mode" }, { status: 400 });
  }

  // Save file to disk
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = `${uuidv4()}-${file.name}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Resize and sanitize image
  const processedBuffer = await sharp(buffer)
    .resize(1200, 1200, { fit: "inside" })
    .toFormat("png")
    .toBuffer();
  await writeFile(filepath, new Uint8Array(processedBuffer));

  let rawText = "";
  let jsonResult: any = {};
  let fixed: any = null;

  // For ocr-ai/icr-ai, expect rawText from client (browser-side OCR)
  if (mode === "ocr-ai" || mode === "icr-ai") {
    rawText = formData.get("rawText") as string || "";
  }
  // AI post-processing
  // Always map to fixed output schema after AI call
  function mapToFixedSchema(structured: any): any {
    // Ensure all required fields are present and null if missing
    return {
      vendor_name: structured?.vendor_name ?? null,
      vendor_address: structured?.vendor_address ?? null,
      customer_name: structured?.seller_name ?? null, // renamed
      customer_address: structured?.customer_address ?? null, // new field
      items: Array.isArray(structured?.items) ? structured.items.map((item: any) => ({
        name: item?.name ?? null,
        quantity: item?.quantity ?? null
      })) : [],
      total_amount: structured?.total_amount ?? null,
      date: structured?.date ?? null
    };
  }
  if (mode === "vision") {
    // Full image → AI Vision
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const base64Image = processedBuffer.toString("base64");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that extracts structured data from invoices and receipts. Always return a JSON object with these fields: vendor_name, vendor_address, customer_name, customer_address, items (array of {name, quantity}), total_amount, date. If a field is missing, set it to null. Also provide a short human-readable summary as 'summary'. Example: {\"structured\":{\"vendor_name\":...,\"vendor_address\":...,\"customer_name\":...,\"customer_address\":...,\"items\":[],\"total_amount\":...,\"date\":...},\"summary\":\"...\"}."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract the following fields from this image: vendor_name, vendor_address, customer_name, customer_address, items (array of {name, quantity}), total_amount, date. Return a JSON object with a 'structured' field (with these keys, null if missing) and a 'summary' field (plain English summary)." },
            { type: "image_url", image_url: { url: `data:image/png;base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 1024
    });
    let aiText = response.choices[0]?.message?.content || "";
    // Remove markdown code block if present
    let cleaned = aiText.trim();
    if (cleaned.startsWith("```") ) {
      cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
    }
    try {
      jsonResult = JSON.parse(cleaned);
    } catch {
      jsonResult = { aiText };
    }
    // Always map to fixed output if possible
    if (jsonResult?.structured) {
      fixed = mapToFixedSchema(jsonResult.structured);
    } else if (jsonResult && typeof jsonResult === 'object') {
      fixed = mapToFixedSchema(jsonResult);
    } else {
      fixed = null;
    }
    rawText = "";
    // Store in DB
    if (fixed) {
      await prisma.upload.create({
        data: {
          filename,
          mode,
          fixedResult: JSON.stringify(fixed),
          createdAt: new Date(),
        }
      });
    }
  } else if (mode === "ocr-ai" || mode === "icr-ai") {
    // OCR/ICR + AI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that extracts structured data from invoices and receipts. Always return a JSON object with these fields: vendor_name, vendor_address, customer_name, customer_address, items (array of {name, quantity}), total_amount, date. If a field is missing, set it to null. Also provide a short human-readable summary as 'summary'. Example: {\"structured\":{\"vendor_name\":...,\"vendor_address\":...,\"customer_name\":...,\"customer_address\":...,\"items\":[],\"total_amount\":...,\"date\":...},\"summary\":\"...\"}."
        },
        {
          role: "user",
          content: `Extract the following fields from this OCR text: vendor_name, vendor_address, customer_name, customer_address, items (array of {name, quantity}), total_amount, date. Return a JSON object with a 'structured' field (with these keys, null if missing) and a 'summary' field (plain English summary).\n${rawText}`
        }
      ],
      max_tokens: 1024
    });
    let aiText = response.choices[0]?.message?.content || "";
    try {
      // Remove markdown code block if present
      let cleaned = aiText.trim();
      if (cleaned.startsWith("```") ) {
        cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
      }
      jsonResult = JSON.parse(cleaned);
    } catch {
      jsonResult = { aiText };
    }
    // Always map to fixed output if possible
    if (jsonResult?.structured) {
      fixed = mapToFixedSchema(jsonResult.structured);
    } else if (jsonResult && typeof jsonResult === 'object') {
      fixed = mapToFixedSchema(jsonResult);
    } else {
      fixed = null;
    }
    // Store in DB
    if (fixed) {
      await prisma.upload.create({
        data: {
          filename,
          mode,
          fixedResult: JSON.stringify(fixed),
          createdAt: new Date(),
        }
      });
    }
  } else {
    jsonResult = { extracted: rawText };
    fixed = mapToFixedSchema(jsonResult.extracted ? {} : {}); // fallback: empty schema
    // Store in DB
    await prisma.upload.create({
      data: {
        filename,
        mode,
        fixedResult: JSON.stringify(fixed),
        createdAt: new Date(),
      }
    });
  }
  return NextResponse.json({ rawText, jsonResult, fixed, filename });
}


