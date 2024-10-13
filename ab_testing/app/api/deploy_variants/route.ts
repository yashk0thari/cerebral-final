import { NextResponse } from "next/server";
import { db } from "@/app/firebase";
import { doc, setDoc, arrayUnion } from "firebase/firestore";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { currentKey, variants } = await request.json();

    if (!currentKey) {
      return NextResponse.json(
        { error: "No current key provided" },
        { status: 400 }
      );
    }

    // Reference to the specific document using the currentKey
    const keyDocRef = doc(
      db,
      "developer",
      "zjLHwJHVUHxNsyxFK0tX",
      "keys",
      currentKey
    );

    // Use setDoc with merge option to create the document if it doesn't exist
    // or update it if it does exist
    await setDoc(
      keyDocRef,
      {
        variants: arrayUnion(...variants),
      },
      { merge: true }
    );

    return NextResponse.json({ message: "Variants deployed successfully" });
  } catch (error) {
    console.error("Error deploying variants:", error);
    return NextResponse.json(
      { error: "Failed to deploy variants" },
      { status: 500 }
    );
  }
}
