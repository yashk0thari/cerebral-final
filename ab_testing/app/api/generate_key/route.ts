import { NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/app/firebase";
import { collection, addDoc } from "firebase/firestore";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request): Promise<NextResponse> {
  console.log("Generating key...");
  const { prompt } = await request.json();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are tasked to generate a 3 word key connected by a dash based on the prompt provided.`,
        },
        { role: "user", content: `${prompt}` },
      ],
    });
    const generateKey = completion.choices[0].message?.content?.trim() || "";
    const hash = Math.random().toString(36).substring(2, 8);
    const uniqueKey = `${generateKey}-${hash}`;
    console.log("Generated Key: \n", uniqueKey);
    // Add the key to Firestore
    const keysCollectionRef = collection(
      db,
      "developer",
      "zjLHwJHVUHxNsyxFK0tX",
      "keys"
    );
    await addDoc(keysCollectionRef, {
      key: uniqueKey,
      createdAt: new Date(),
    });

    return NextResponse.json({ key: uniqueKey });
  } catch (error) {
    console.error("Error generating key or saving to Firestore:", error);
    return NextResponse.json(
      { error: "Failed to generate key or save to database" },
      { status: 500 }
    );
  }
}
